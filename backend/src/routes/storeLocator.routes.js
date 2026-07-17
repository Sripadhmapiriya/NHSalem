import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendMail } from '../utils/mailer.js'
import { cityInterestRegistered, cityLaunchedNotification } from '../utils/emailTemplates.js'

const router = express.Router()

// Ensure table exists on route load
pool.query(`
  CREATE TABLE IF NOT EXISTS city_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    city_id VARCHAR(100) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(email, city_id)
  );
`).catch(err => console.error('Error creating city_notifications table:', err))

const citySchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  pincode: z.string().optional().nullable(),
  status: z.enum(['live', 'coming_soon']).optional().default('live'),
  slots: z.array(z.string()).optional().default([]),
  stores: z.number().int().optional().default(0)
})

const cityNotifySchema = z.object({
  email: z.string().email(),
  cityId: z.string().min(2)
})

// Helper: notify city subscribers
async function notifyCitySubscribers(cityId, cityName) {
  try {
    const notifyRes = await pool.query('SELECT email FROM city_notifications WHERE city_id = $1', [cityId])
    const emails = notifyRes.rows.map(r => r.email)

    if (emails.length > 0) {
      console.log(`Notifying ${emails.length} users that ${cityName} is live...`)
      const emailHtml = cityLaunchedNotification({ cityName })
      
      for (const email of emails) {
        await sendMail({
          to: email,
          subject: `NH Salem is now LIVE in ${cityName}! 🐟`,
          html: emailHtml
        }).catch(err => console.error(`Failed to send launch notification to ${email}:`, err))
      }

      // Clear the notifications
      await pool.query('DELETE FROM city_notifications WHERE city_id = $1', [cityId])
      console.log(`Cleared launch notification interest for ${cityName}`)
    }
  } catch (err) {
    console.error(`Error notifying subscribers for city ${cityName}:`, err)
  }
}

// GET /api/cities (lists all cities)
router.get('/cities', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM cities ORDER BY status ASC, name ASC')
  res.json(result.rows)
}))

// POST /api/cities/notify (registers interest in a coming soon city)
router.post('/cities/notify', asyncHandler(async (req, res) => {
  const { email, cityId } = cityNotifySchema.parse(req.body)
  const normalizedEmail = email.toLowerCase().trim()

  // Verify city exists and is coming_soon
  const cityResult = await pool.query('SELECT name, status, stores FROM cities WHERE id = $1', [cityId])
  if (cityResult.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'City not found' })
  }
  
  const city = cityResult.rows[0]
  if (city.status === 'live' && (city.stores ?? 0) > 0) {
    return res.status(400).json({ success: false, message: `We are already live in ${city.name}! You can place your order now.` })
  }

  // Save interest to DB
  await pool.query(
    'INSERT INTO city_notifications (email, city_id) VALUES ($1, $2) ON CONFLICT (email, city_id) DO NOTHING',
    [normalizedEmail, cityId]
  )

  // Send confirmation email to user
  try {
    const interestHtml = cityInterestRegistered({ email: normalizedEmail, cityName: city.name })
    sendMail({
      to: normalizedEmail,
      subject: `We'll notify you when we launch in ${city.name}! 📍`,
      html: interestHtml
    }).catch(err => console.error('Failed to send interest confirmation email:', err))

    // Notify admin
    const adminEmail = process.env.SHOP_ADMIN_EMAIL || 'sripadhmapiriya12@gmail.com'
    sendMail({
      to: adminEmail,
      subject: `🔔 Launch Interest: ${city.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>City Launch Interest Registered</h2>
          <p>The user <strong>${normalizedEmail}</strong> wants to be notified when NH Salem launches in <strong>${city.name}</strong>.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send admin interest alert:', err))
  } catch (emailErr) {
    console.error('Error triggering interest emails:', emailErr)
  }

  res.json({ success: true, message: `Successfully registered interest for ${city.name}!` })
}))

// GET /api/cities/:pincode (checks delivery availability for a pincode)
router.get('/cities/:pincode', asyncHandler(async (req, res) => {
  const { pincode } = req.params

  const result = await pool.query("SELECT * FROM cities WHERE pincode = $1 AND status = 'live'", [pincode])
  
  if (result.rows.length > 0) {
    const city = result.rows[0]
    return res.json({
      available: true,
      city: city.name,
      slots: typeof city.slots === 'string' ? JSON.parse(city.slots) : city.slots,
      message: `Delivery available to ${city.name}! Choose your slot.`
    })
  }

  res.json({
    available: false,
    message: `We don't deliver to ${pincode} yet. Coming soon!`
  })
}))

// ── Admin Endpoints ──

// GET /api/admin/cities
router.get('/admin/cities', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM cities ORDER BY name ASC')
  res.json({ success: true, cities: result.rows })
}))

// POST /api/admin/cities
router.post('/admin/cities', requireAdmin, asyncHandler(async (req, res) => {
  const c = citySchema.parse(req.body)

  const check = await pool.query('SELECT id FROM cities WHERE id = $1', [c.id])
  if (check.rows.length > 0) {
    return res.status(400).json({ success: false, message: 'City ID already exists' })
  }

  const result = await pool.query(
    `INSERT INTO cities (id, name, pincode, status, slots, stores)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [c.id, c.name, c.pincode || null, c.status, JSON.stringify(c.slots), c.stores]
  )

  res.status(201).json({ success: true, city: result.rows[0] })
}))

// PUT /api/admin/cities/:id
router.put('/admin/cities/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const c = citySchema.parse(req.body)

  const check = await pool.query('SELECT id, status, name FROM cities WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'City not found' })
  }
  const oldCity = check.rows[0]

  const result = await pool.query(
    `UPDATE cities SET
      name = $1, pincode = $2, status = $3, slots = $4, stores = $5
     WHERE id = $6
     RETURNING *`,
    [c.name, c.pincode || null, c.status, JSON.stringify(c.slots), c.stores, id]
  )

  // If status changed to live, notify subscribers
  if (oldCity.status === 'coming_soon' && c.status === 'live') {
    notifyCitySubscribers(id, c.name).catch(err => console.error('Failed to notify city subscribers:', err))
  }

  res.json({ success: true, city: result.rows[0] })
}))

// DELETE /api/admin/cities/:id
router.delete('/admin/cities/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM cities WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'City not found' })
  }

  res.json({ success: true, id })
}))

export default router


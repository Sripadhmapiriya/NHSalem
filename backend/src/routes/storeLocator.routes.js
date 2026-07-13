import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const citySchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  pincode: z.string().optional().nullable(),
  status: z.enum(['live', 'coming_soon']).optional().default('live'),
  slots: z.array(z.string()).optional().default([]),
  stores: z.number().int().optional().default(0)
})

// GET /api/cities (lists all cities)
router.get('/cities', asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM cities ORDER BY status ASC, name ASC')
  res.json(result.rows)
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

  const check = await pool.query('SELECT id FROM cities WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'City not found' })
  }

  const result = await pool.query(
    `UPDATE cities SET
      name = $1, pincode = $2, status = $3, slots = $4, stores = $5
     WHERE id = $6
     RETURNING *`,
    [c.name, c.pincode || null, c.status, JSON.stringify(c.slots), c.stores, id]
  )

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

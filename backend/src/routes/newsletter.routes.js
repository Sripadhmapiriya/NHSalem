import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendMail, broadcastToSubscribers } from '../utils/mailer.js'
import { newsletterWelcome } from '../utils/emailTemplates.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

const newsletterSchema = z.object({
  email: z.string().email()
})

const broadcastSchema = z.object({
  subject: z.string(),
  updateType: z.enum(['new_product', 'new_promotion', 'new_subscription_plan', 'general']),
  content: z.any()
})

// POST /api/newsletter/subscribe
router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email } = newsletterSchema.parse(req.body)
  const normalizedEmail = email.toLowerCase().trim()

  // Check if already subscribed
  const check = await pool.query('SELECT id FROM newsletter_subscribers WHERE email = $1', [normalizedEmail])
  if (check.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'You are already subscribed!' })
  }

  // Save to DB
  await pool.query(
    'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
    [normalizedEmail]
  )

  // Send Welcome Email to subscriber asynchronously
  try {
    const welcomeHtml = newsletterWelcome({ email: normalizedEmail })
    sendMail({
      to: normalizedEmail,
      subject: "Welcome to NH Salem Sea Foods! 🐟",
      html: welcomeHtml
    }).catch(err => console.error('Failed to send newsletter welcome email:', err))

    // Notify admin
    const adminEmail = process.env.SHOP_ADMIN_EMAIL || 'sripadhmapiriya12@gmail.com'
    sendMail({
      to: adminEmail,
      subject: `🔔 New Newsletter Subscriber: ${normalizedEmail}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Subscriber Alert</h2>
          <p>The email address <strong>${normalizedEmail}</strong> has just subscribed to your newsletter.</p>
        </div>
      `
    }).catch(err => console.error('Failed to send admin subscriber alert:', err))
  } catch (emailErr) {
    console.error('Error triggering welcome emails:', emailErr)
  }

  res.json({
    success: true,
    message: `${email} subscribed successfully!`
  })
}))

// GET /api/newsletter/unsubscribe
router.get('/unsubscribe', asyncHandler(async (req, res) => {
  const email = req.query.email
  if (email) {
    await pool.query('DELETE FROM newsletter_subscribers WHERE email = $1', [email.toLowerCase().trim()])
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Unsubscribed Successfully</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          padding: 80px 20px;
          background-color: #f5f5f5;
        }
        .card {
          background: white;
          padding: 40px 30px;
          border-radius: 12px;
          max-width: 480px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        h1 {
          color: #166534;
          font-size: 24px;
          margin-top: 0;
        }
        p {
          color: #475569;
          font-size: 15px;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background-color: #0f172a;
          color: white !important;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 6px;
          margin-top: 24px;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Unsubscribed Successfully</h1>
        <p>You have been unsubscribed from the NH Salem Sea Foods newsletter and marketing list. You will no longer receive updates about offers or new products.</p>
        <a href="https://nh-salem.vercel.app" class="btn">Return to Shore</a>
      </div>
    </body>
    </html>
  `)
}))

// POST /api/newsletter/broadcast (admin only)
router.post('/broadcast', requireAdmin, asyncHandler(async (req, res) => {
  const { subject, updateType, content } = broadcastSchema.parse(req.body)
  const result = await broadcastToSubscribers({ updateType, subject, content })
  res.json({ success: true, sent: result.sent })
}))

export default router

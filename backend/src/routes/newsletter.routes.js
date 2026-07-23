import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import asyncHandler from '../middleware/asyncHandler.js'

const router = express.Router()

const emailSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
})

// POST /api/newsletter/subscribe
router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email } = emailSchema.parse(req.body)
  const normalizedEmail = email.toLowerCase().trim()

  // Check if already subscribed
  const check = await pool.query('SELECT id FROM newsletter_subscribers WHERE email = $1', [normalizedEmail])
  if (check.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'You are already subscribed to our newsletter!' })
  }

  // Insert into newsletter_subscribers
  await pool.query(
    'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
    [normalizedEmail]
  )

  return res.json({
    success: true,
    message: '🎉 Thank you for subscribing to NH Salem updates!'
  })
}))

export default router

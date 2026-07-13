import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const newsletterSchema = z.object({
  email: z.string().email()
})

// POST /api/newsletter/subscribe
router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email } = newsletterSchema.parse(req.body)

  await pool.query(
    'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
    [email.toLowerCase().trim()]
  )

  res.json({
    success: true,
    message: `${email} subscribed successfully!`
  })
}))

export default router

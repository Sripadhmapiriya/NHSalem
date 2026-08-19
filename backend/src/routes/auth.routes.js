import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import pool from '../db/pool.js'
import { generateUserToken } from '../utils/jwt.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendMail } from '../utils/mailer.js'
import { passwordResetCustomer } from '../utils/emailTemplates.js'

const router = express.Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8)
})

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6)
})

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, phone, password } = registerSchema.parse(req.body)
  
  // Clean phone: numeric only, exactly 10 digits
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' })
  }

  const finalEmail = email.toLowerCase().trim()

  // Check if email exists
  const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [finalEmail])
  if (existingEmail.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'This email is already registered.' })
  }

  // Check if phone exists
  const existingPhone = await pool.query('SELECT id FROM users WHERE phone = $1', [cleanPhone])
  if (existingPhone.rows.length > 0) {
    return res.status(409).json({ success: false, message: 'This phone number is already registered.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await pool.query(
    'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone',
    [name, finalEmail, cleanPhone, passwordHash]
  )

  const user = result.rows[0]
  const token = generateUserToken(user)

  res.status(201).json({ success: true, user, token })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { email, phone, password } = loginSchema.parse(req.body)

  let user = null
  if (email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
    user = result.rows[0]
  } else if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [cleanPhone])
    user = result.rows[0]
  } else {
    return res.status(400).json({ success: false, message: 'Email or phone number is required' })
  }

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' })
  }

  const token = generateUserToken(user)

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    token
  })
}))

router.get('/me', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [req.user.id])
  const user = result.rows[0]
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  res.json({ user })
}))

router.put('/me', requireUser, asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body
  const result = await pool.query(
    'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone) WHERE id = $4 RETURNING id, name, email, phone',
    [name, email, phone, req.user.id]
  )
  const user = result.rows[0]
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  res.json({ success: true, user })
}))

router.get('/me/stats', requireUser, asyncHandler(async (req, res) => {
  const stats = await pool.query(`
    SELECT COUNT(*) as order_count,
           COALESCE(SUM(total), 0) as total_spent
    FROM orders WHERE user_id = $1
  `, [req.user.id])
  res.json(stats.rows[0])
}))

// OTP Login Stubs
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { phone } = req.body
  console.log(`[Stub OTP] OTP request received for ${phone}`)
  res.json({ success: true, message: `OTP sent to +91 ${phone}` })
}))

router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { phone, otp } = req.body
  
  // Any 6-digit OTP starting with 1 works (e.g. 123456)
  if (otp === '123456' || (otp.length === 6 && otp.startsWith('1'))) {
    // Check if user exists or create a placeholder mock user
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10)
    let userRes = await pool.query('SELECT id, name, email, phone FROM users WHERE phone = $1', [cleanPhone])
    
    let user = userRes.rows[0]
    if (!user) {
      // Create user placeholder
      const placeholderEmail = `phone_${cleanPhone}@example.com`
      const passwordHash = await bcrypt.hash('password123', 10)
      const insertRes = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone`,
        ['Karthik Rajan', placeholderEmail, cleanPhone, passwordHash]
      )
      user = insertRes.rows[0]
    }
    
    const token = generateUserToken(user)
    return res.json({ success: true, user, token })
  }
  
  res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' })
}))

// Password Reset Flow
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' })

  const finalEmail = email.toLowerCase().trim()
  const result = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [finalEmail])
  const user = result.rows[0]

  if (!user) {
    // Return success to avoid email enumeration
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 15 * 60 * 1000 // 15 minutes

  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [otp, expiry, user.id]
  )

  const html = passwordResetCustomer({ customerName: user.name, otp })
  await sendMail({ to: user.email, subject: 'Password Reset Verification Code', html })

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
}))

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  const finalEmail = email.toLowerCase().trim()
  const result = await pool.query('SELECT id, reset_token, reset_token_expiry FROM users WHERE email = $1', [finalEmail])
  const user = result.rows[0]

  if (!user || user.reset_token !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
  }

  if (Date.now() > user.reset_token_expiry) {
    return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  
  await pool.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [passwordHash, user.id]
  )

  res.json({ success: true, message: 'Password has been reset successfully. You can now login.' })
}))

export default router

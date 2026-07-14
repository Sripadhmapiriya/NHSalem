import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import pool from '../db/pool.js'
import { generateUserToken } from '../utils/jwt.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

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

export default router

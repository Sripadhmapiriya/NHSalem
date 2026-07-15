import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const addressSchema = z.object({
  label: z.string().min(1).max(50).optional().default('Home'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  line1: z.string().min(5, 'Enter a complete address'),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(2, 'Enter your state'),
  is_default: z.boolean().optional().default(false)
})

// GET /api/addresses — list all saved addresses for the logged-in user
router.get('/', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, label, name, phone, pincode, line1, city, state, is_default, created_at
     FROM user_addresses
     WHERE user_id = $1
     ORDER BY is_default DESC, created_at DESC`,
    [req.user.id]
  )
  res.json({ success: true, addresses: result.rows })
}))

// POST /api/addresses — create a new address
router.post('/', requireUser, asyncHandler(async (req, res) => {
  const data = addressSchema.parse(req.body)

  // If this is the first address or marked default, clear existing defaults
  if (data.is_default) {
    await pool.query(
      'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
      [req.user.id]
    )
  }

  // Check if this is the user's first address — auto-set as default
  const countRes = await pool.query(
    'SELECT COUNT(*) as cnt FROM user_addresses WHERE user_id = $1',
    [req.user.id]
  )
  const isFirst = parseInt(countRes.rows[0].cnt) === 0

  const result = await pool.query(
    `INSERT INTO user_addresses (user_id, label, name, phone, pincode, line1, city, state, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, label, name, phone, pincode, line1, city, state, is_default, created_at`,
    [req.user.id, data.label, data.name, data.phone, data.pincode, data.line1, data.city, data.state, isFirst || data.is_default]
  )
  res.status(201).json({ success: true, address: result.rows[0] })
}))

// PUT /api/addresses/:id — update an address
router.put('/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  const data = addressSchema.parse(req.body)

  // Verify ownership
  const check = await pool.query(
    'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  )
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Address not found' })
  }

  if (data.is_default) {
    await pool.query(
      'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
      [req.user.id]
    )
  }

  const result = await pool.query(
    `UPDATE user_addresses 
     SET label = $1, name = $2, phone = $3, pincode = $4, line1 = $5, city = $6, state = $7, is_default = $8
     WHERE id = $9 AND user_id = $10
     RETURNING id, label, name, phone, pincode, line1, city, state, is_default, created_at`,
    [data.label, data.name, data.phone, data.pincode, data.line1, data.city, data.state, data.is_default, id, req.user.id]
  )
  res.json({ success: true, address: result.rows[0] })
}))

// DELETE /api/addresses/:id — delete an address
router.delete('/:id', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query(
    'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.id]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Address not found' })
  }
  res.json({ success: true, message: 'Address deleted' })
}))

export default router

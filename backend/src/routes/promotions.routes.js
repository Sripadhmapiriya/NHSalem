import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const promotionSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  type: z.enum(['flat', 'percent']),
  discount_value: z.number().min(0),
  min_order: z.number().min(0).optional().default(0),
  description: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'paused', 'scheduled', 'expired']).optional().default('active'),
  expires_at: z.string().optional().nullable(),
  usage_limit: z.number().int().optional().nullable(),
  applicable_product_ids: z.array(z.string()).optional().default([])
})

function formatPromo(p) {
  return {
    id: p.id,
    code: p.code,
    type: p.type,
    value: Number(p.discount_value),
    minOrder: Number(p.min_order),
    description: p.description,
    status: p.status,
    uses: p.used_count,
    limit: p.usage_limit,
    expiresAt: p.expires_at ? new Date(p.expires_at).toISOString().split('T')[0] : null,
    applicableProductIds: p.applicable_product_ids
  }
}

// ── GET /api/promotions/validate ──────────────────────────────────────────────
router.get('/promotions/validate', asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.query

  if (!code) {
    return res.json({ valid: false, message: 'Coupon code is required' })
  }

  const result = await pool.query('SELECT * FROM promotions WHERE code = $1', [code.toUpperCase().trim()])
  const coupon = result.rows[0]

  if (!coupon) {
    return res.json({ valid: false, message: 'Invalid coupon code' })
  }

  if (coupon.status !== 'active') {
    return res.json({ valid: false, message: 'This coupon is currently inactive or paused' })
  }

  const now = new Date()
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return res.json({ valid: false, message: 'This coupon is not active yet' })
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    await pool.query("UPDATE promotions SET status = 'expired' WHERE id = $1", [coupon.id])
    return res.json({ valid: false, message: 'This coupon has expired' })
  }

  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return res.json({ valid: false, message: 'This coupon usage limit has been reached' })
  }

  const totalNum = Number(orderTotal || 0)
  const minOrderNum = Number(coupon.min_order)
  if (totalNum < minOrderNum) {
    return res.json({ valid: false, message: `Minimum order ₹${minOrderNum} required` })
  }

  let discount = 0
  if (coupon.type === 'flat') {
    discount = Number(coupon.discount_value)
  } else if (coupon.type === 'percent') {
    discount = Math.round((totalNum * Number(coupon.discount_value)) / 100)
  }

  res.json({
    valid: true,
    discount,
    description: coupon.description,
    message: 'Promo code applied!'
  })
}))

// ── Admin Endpoints ──

// GET /api/admin/promotions
router.get('/admin/promotions', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC')
  res.json({
    success: true,
    promotions: result.rows.map(formatPromo)
  })
}))

// POST /api/admin/promotions
router.post('/admin/promotions', requireAdmin, asyncHandler(async (req, res) => {
  const body = promotionSchema.parse(req.body)

  const check = await pool.query('SELECT id FROM promotions WHERE code = $1', [body.code])
  if (check.rows.length > 0) {
    return res.status(400).json({ success: false, message: 'Promotion code already exists' })
  }

  const result = await pool.query(
    `INSERT INTO promotions (code, type, discount_value, min_order, description, status, expires_at, usage_limit, applicable_product_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      body.code,
      body.type,
      body.discount_value,
      body.min_order,
      body.description,
      body.status,
      body.expires_at ? new Date(body.expires_at) : null,
      body.usage_limit,
      JSON.stringify(body.applicable_product_ids)
    ]
  )

  res.status(201).json(formatPromo(result.rows[0]))
}))

// PUT /api/admin/promotions/:id
router.put('/admin/promotions/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const body = promotionSchema.parse(req.body)

  const check = await pool.query('SELECT id FROM promotions WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Promotion not found' })
  }

  const codeCheck = await pool.query('SELECT id FROM promotions WHERE code = $1 AND id != $2', [body.code, id])
  if (codeCheck.rows.length > 0) {
    return res.status(400).json({ success: false, message: 'Promotion code already exists' })
  }

  const result = await pool.query(
    `UPDATE promotions SET
      code = $1, type = $2, discount_value = $3, min_order = $4, description = $5, status = $6, expires_at = $7, usage_limit = $8, applicable_product_ids = $9
     WHERE id = $10
     RETURNING *`,
    [
      body.code,
      body.type,
      body.discount_value,
      body.min_order,
      body.description,
      body.status,
      body.expires_at ? new Date(body.expires_at) : null,
      body.usage_limit,
      JSON.stringify(body.applicable_product_ids),
      id
    ]
  )

  res.json(formatPromo(result.rows[0]))
}))

// DELETE /api/admin/promotions/:id
router.delete('/admin/promotions/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM promotions WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Promotion not found' })
  }

  res.json({ success: true, id })
}))

export default router

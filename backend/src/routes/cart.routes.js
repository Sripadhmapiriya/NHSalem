import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const cartItemSchema = z.object({
  productId: z.string(),
  weight: z.string(),
  quantity: z.number().int().positive()
})

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
  weight: z.string().optional()
})

// ── GET /api/cart ─────────────────────────────────────────────────────────────
router.get('/', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT ci.id, ci.weight, ci.quantity, ci.product_id as "productId", p.name, p.slug, p.image, p.weights
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = $1`,
    [req.user.id]
  )

  // Map database response to match the cart expectations
  const items = result.rows.map(r => {
    // Find correct price from the product's weights array
    const weights = typeof r.weights === 'string' ? JSON.parse(r.weights) : r.weights
    const variant = weights.find(w => w.label === r.weight) || {}
    
    return {
      id: r.id,
      productId: r.productId,
      name: r.name,
      slug: r.slug,
      image: r.image,
      weight: r.weight,
      quantity: r.quantity,
      price: variant.price || 0,
      originalPrice: variant.originalPrice || variant.price || 0
    }
  })

  res.json({ success: true, items })
}))

// ── POST /api/cart ────────────────────────────────────────────────────────────
router.post('/', requireUser, asyncHandler(async (req, res) => {
  const { productId, weight, quantity } = cartItemSchema.parse(req.body)

  // Verify product exists
  const prodCheck = await pool.query('SELECT id, weights FROM products WHERE id = $1', [productId])
  if (prodCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  // Insert or update on conflict
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, weight, quantity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id, weight)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
    [req.user.id, productId, weight, quantity]
  )

  res.status(201).json({ success: true, message: 'Item added to cart' })
}))

// ── PUT /api/cart/:productId ──────────────────────────────────────────────────
router.put('/:productId', requireUser, asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantity, weight } = updateCartItemSchema.parse(req.body)

  let sql = 'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3'
  const params = [quantity, req.user.id, productId]

  if (weight) {
    sql += ' AND weight = $4'
    params.push(weight)
  }

  const result = await pool.query(sql, params)
  if (result.rowCount === 0) {
    return res.status(404).json({ success: false, message: 'Item not found in cart' })
  }

  res.json({ success: true, message: 'Cart updated successfully' })
}))

// ── DELETE /api/cart/:productId ───────────────────────────────────────────────
router.delete('/:productId', requireUser, asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { weight } = req.query

  let sql = 'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2'
  const params = [req.user.id, productId]

  if (weight) {
    sql += ' AND weight = $3'
    params.push(weight)
  }

  const result = await pool.query(sql, params)
  if (result.rowCount === 0) {
    return res.status(404).json({ success: false, message: 'Item not found in cart' })
  }

  res.json({ success: true, message: 'Item removed from cart' })
}))

export default router

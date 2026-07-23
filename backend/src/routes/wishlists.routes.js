import express from 'express'
import pool from '../db/pool.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

// ── GET /api/wishlist ────────────────────────────────────────────────────────
router.get('/wishlist', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT w.product_id, p.name, p.slug, p.image, p.base_price, p.rating, p.review_count, p.badges, p.unit, p.weights, p.variants
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.id]
  )
  
  // Format the product data to match ProductCard expectations
  const items = result.rows.map(row => ({
    id: row.product_id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    basePrice: Number(row.base_price),
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    badges: typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges,
    unit: row.unit,
    weights: typeof row.weights === 'string' ? JSON.parse(row.weights) : row.weights,
    variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
  }))

  res.json({ success: true, items })
}))

// ── POST /api/wishlist/toggle ────────────────────────────────────────────────
router.post('/wishlist/toggle', requireUser, asyncHandler(async (req, res) => {
  const { productId } = req.body
  
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' })
  }

  // Check if item exists
  const check = await pool.query(
    'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
    [req.user.id, productId]
  )

  if (check.rows.length > 0) {
    // Remove it
    await pool.query('DELETE FROM wishlists WHERE id = $1', [check.rows[0].id])
    return res.json({ success: true, action: 'removed', productId })
  } else {
    // Add it
    await pool.query(
      'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, productId]
    )
    return res.json({ success: true, action: 'added', productId })
  }
}))

export default router

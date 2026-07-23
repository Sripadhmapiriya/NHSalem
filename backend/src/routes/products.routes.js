import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { broadcastToSubscribers } from '../utils/mailer.js'

const router = express.Router()

const productSchema = z.object({
  category: z.string(),
  name: z.string().min(2),
  localName: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  how_to_cook: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  badges: z.array(z.any()).optional().default([]),
  weights: z.array(z.object({
    label: z.string(),
    price: z.number(),
    originalPrice: z.number().optional()
  })).optional().default([]),
  variants: z.array(z.object({
    label: z.string(),
    price: z.number(),
    originalPrice: z.number().optional(),
    value: z.number().optional()
  })).optional().default([]),
  basePrice: z.number(),
  freshnessScore: z.number().optional().default(90),
  nutrition: z.any().optional().default({}),
  unit: z.string().optional().nullable(),
  stock_qty: z.number().optional().default(100),
  stockStatus: z.string().optional().default('in_stock'),
  is_active: z.boolean().optional().default(true)
})

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(2).optional().nullable(),
  comment: z.string().min(2).optional().nullable()
})

function formatProduct(p) {
  const finalWeights = typeof p.weights === 'string' ? JSON.parse(p.weights) : (p.weights || [])
  const finalVariants = typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || [])
  
  return {
    id: p.id,
    slug: p.slug,
    category: p.category,
    name: p.name,
    localName: p.local_name,
    tagline: p.tagline,
    description: p.description,
    howToCook: p.how_to_cook,
    image: p.image,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    badges: typeof p.badges === 'string' ? JSON.parse(p.badges) : p.badges,
    weights: finalWeights,
    variants: finalVariants.length > 0 ? finalVariants : finalWeights,
    basePrice: Number(p.base_price),
    rating: Number(p.rating),
    reviewCount: Number(p.review_count),
    isBestSeller: p.is_bestseller,
    catchTime: p.catch_time,
    freshnessScore: p.freshness_score,
    nutritionPer100g: typeof p.nutrition === 'string' ? JSON.parse(p.nutrition) : p.nutrition,
    unit: p.unit,
    stock_qty: p.stock_qty,
    stockStatus: p.stock_status,
    is_active: p.is_active
  }
}

async function generateUniqueSlug(name, productId = null) {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (!baseSlug) baseSlug = 'product'

  let slug = baseSlug
  let count = 0
  while (true) {
    const query = productId 
      ? 'SELECT id FROM products WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM products WHERE slug = $1'
    const params = productId ? [slug, productId] : [slug]
    const res = await pool.query(query, params)
    
    if (res.rows.length === 0) return slug
    
    count++
    slug = `${baseSlug}-${count}`
  }
}

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort, badges } = req.query

  let sql = 'SELECT * FROM products WHERE is_active = true'
  const params = []
  let paramCount = 0

  if (category) {
    paramCount++
    if (category === 'dried-fish') {
      sql += ` AND (category = $${paramCount} OR category = 'dry-fish')`
    } else if (category === 'dry-fish') {
      sql += ` AND (category = $${paramCount} OR category = 'dried-fish')`
    } else {
      sql += ` AND category = $${paramCount}`
    }
    params.push(category)
  }

  if (search) {
    paramCount++
    sql += ` AND (LOWER(name) LIKE $${paramCount} OR LOWER(tagline) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`
    params.push(`%${search.toLowerCase()}%`)
  }

  if (minPrice) {
    paramCount++
    sql += ` AND base_price >= $${paramCount}`
    params.push(Number(minPrice))
  }

  if (maxPrice) {
    paramCount++
    sql += ` AND base_price <= $${paramCount}`
    params.push(Number(maxPrice))
  }

  if (sort === 'za') {
    sql += ' ORDER BY name DESC'
  } else if (sort === 'price_asc') {
    sql += ' ORDER BY base_price ASC'
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY base_price DESC'
  } else if (sort === 'rating') {
    sql += ' ORDER BY rating DESC'
  } else if (sort === 'newest') {
    sql += ' ORDER BY created_at DESC'
  } else {
    // Default is 'az' (ORDER BY name ASC)
    sql += ' ORDER BY name ASC'
  }

  const result = await pool.query(sql, params)
  let products = result.rows.map(formatProduct)

  if (badges) {
    const badgeList = badges.split(',')
    products = products.filter(p => p.badges?.some(b => badgeList.includes(b.type)))
  }

  res.json(products)
}))

// ── GET /api/products/:idOrSlug ───────────────────────────────────────────────
router.get('/products/:idOrSlug', asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

  const sql = isUuid 
    ? 'SELECT * FROM products WHERE id = $1' 
    : 'SELECT * FROM products WHERE slug = $1'

  const result = await pool.query(sql, [idOrSlug])
  
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  res.json(formatProduct(result.rows[0]))
}))

// ── GET /api/reviews (Public approved site/homepage reviews) ─────────────────────
router.get('/reviews', asyncHandler(async (req, res) => {
  const result = await pool.query(
    "SELECT id, user_name as author, title as role, rating, comment as quote, created_at as date FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 10"
  )
  res.json({ success: true, reviews: result.rows })
}))

// ── POST /api/reviews (Submit site review - default status 'pending') ───────────
router.post('/reviews', asyncHandler(async (req, res) => {
  const { author, role, rating, comment, productId } = req.body

  if (!author || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Author name, rating, and review text are required.' })
  }

  // Use product_id if provided, or default to first product in DB
  let pId = productId
  if (!pId) {
    const firstProd = await pool.query('SELECT id FROM products LIMIT 1')
    if (firstProd.rows.length > 0) pId = firstProd.rows[0].id
  }

  await pool.query(
    'INSERT INTO reviews (product_id, user_name, rating, title, comment, status) VALUES ($1, $2, $3, $4, $5, $6)',
    [pId, author, Number(rating), role || 'Verified Customer', comment, 'pending']
  )

  res.status(201).json({
    success: true,
    message: 'Thanks! Your review is being reviewed and will appear once approved.'
  })
}))

// ── GET /api/products/:id/reviews ─────────────────────────────────────────────
router.get('/products/:id/reviews', asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query(
    "SELECT id, user_name as author, rating, title, comment, created_at as date, status FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC",
    [id]
  )
  
  res.json(result.rows)
}))

// ── POST /api/products/:id/reviews ────────────────────────────────────────────
router.post('/products/:id/reviews', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rating, title, comment } = reviewSchema.parse(req.body)

  const prodCheck = await pool.query('SELECT id FROM products WHERE id = $1', [id])
  if (prodCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  await pool.query(
    'INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, status) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, req.user.id, req.user.name, rating, title, comment, 'pending']
  )

  res.status(201).json({ success: true, message: 'Thanks! Your review is being reviewed and will appear once approved.' })
}))

// ── Admin Endpoints ──

// POST /api/admin/products
router.post('/admin/products', requireAdmin, asyncHandler(async (req, res) => {
  const p = productSchema.parse(req.body)
  const slug = await generateUniqueSlug(p.name)

  const result = await pool.query(
    `INSERT INTO products (
      slug, category, name, local_name, tagline, description, how_to_cook, image, images, badges, weights, base_price, freshness_score, nutrition, unit, stock_qty, stock_status, is_active, variants
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING *`,
    [
      slug,
      p.category,
      p.name,
      p.localName,
      p.tagline,
      p.description,
      p.how_to_cook,
      p.image,
      JSON.stringify(p.images),
      JSON.stringify(p.badges),
      JSON.stringify(p.weights || p.variants || []),
      p.basePrice,
      p.freshnessScore,
      JSON.stringify(p.nutrition),
      p.unit,
      p.stock_qty,
      p.stockStatus,
      p.is_active,
      JSON.stringify(p.variants || p.weights || [])
    ]
  )

  // Auto-send product announcement to all subscribers
  broadcastToSubscribers({
    updateType: 'new_product',
    subject: `🐟 New Arrival: ${p.name} — NH Salem Sea Foods`,
    content: {
      name: p.name,
      tagline: p.tagline,
      base_price: p.basePrice,
      category: p.category,
      image_url: p.image
    }
  }).catch(err => console.error('Product announcement broadcast failed:', err))

  res.status(201).json(formatProduct(result.rows[0]))
}))

// PUT /api/admin/products/:id
router.put('/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const p = productSchema.parse(req.body)

  const check = await pool.query('SELECT slug FROM products WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  const newSlug = await generateUniqueSlug(p.name, id)

  const result = await pool.query(
    `UPDATE products SET
      slug = $1, category = $2, name = $3, local_name = $4, tagline = $5, description = $6, how_to_cook = $7, image = $8, images = $9, badges = $10, weights = $11, base_price = $12, freshness_score = $13, nutrition = $14, unit = $15, stock_qty = $16, stock_status = $17, is_active = $18, variants = $19, updated_at = NOW()
     WHERE id = $20
     RETURNING *`,
    [
      newSlug,
      p.category,
      p.name,
      p.localName,
      p.tagline,
      p.description,
      p.how_to_cook,
      p.image,
      JSON.stringify(p.images),
      JSON.stringify(p.badges),
      JSON.stringify(p.weights || p.variants || []),
      p.basePrice,
      p.freshnessScore,
      JSON.stringify(p.nutrition),
      p.unit,
      p.stock_qty,
      p.stockStatus,
      p.is_active,
      JSON.stringify(p.variants || p.weights || []),
      id
    ]
  )

  res.json(formatProduct(result.rows[0]))
}))

// DELETE /api/admin/products/:id
router.delete('/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' })
  }

  res.json({ success: true, id })
}))

// GET /api/admin/reviews
router.get('/admin/reviews', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT r.id, r.user_name as author, p.name as product, r.rating, TO_CHAR(r.created_at, 'YYYY-MM-DD') as date, r.title, r.comment as body,
            (CASE WHEN r.status = 'approved' THEN 'published' WHEN r.status = 'rejected' THEN 'flagged' ELSE 'pending' END) as status,
            true as verified
     FROM reviews r
     JOIN products p ON r.product_id = p.id
     ORDER BY r.created_at DESC`
  )
  res.json({ success: true, reviews: result.rows })
}))

// PUT /api/admin/reviews/:id
router.put('/admin/reviews/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  let dbStatus = 'pending'
  if (status === 'published') dbStatus = 'approved'
  else if (status === 'flagged') dbStatus = 'rejected'

  const result = await pool.query(
    'UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *',
    [dbStatus, id]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Review not found' })
  }

  res.json({ success: true })
}))

// DELETE /api/admin/reviews/:id
router.delete('/admin/reviews/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Review not found' })
  }

  res.json({ success: true })
}))

export default router

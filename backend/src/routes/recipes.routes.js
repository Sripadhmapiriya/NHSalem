import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const recipeSchema = z.object({
  title: z.string().min(2),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  time: z.string().optional().nullable(),
  servings: z.number().int().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ingredients: z.array(z.string()).optional().default([]),
  steps: z.array(z.string()).optional().default([]),
  chefTip: z.string().optional().nullable(),
  status: z.enum(['published', 'draft']).optional().default('published')
})

function formatRecipe(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
    time: r.time,
    servings: r.servings,
    difficulty: r.difficulty,
    image: r.image,
    description: r.description,
    ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
    steps: typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps,
    chefTip: r.chef_tip,
    status: r.status
  }
}

async function generateUniqueRecipeSlug(title, id = null) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (!baseSlug) baseSlug = 'recipe'

  let slug = baseSlug
  let count = 0
  while (true) {
    const query = id 
      ? 'SELECT id FROM recipes WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM recipes WHERE slug = $1'
    const params = id ? [slug, id] : [slug]
    const res = await pool.query(query, params)
    
    if (res.rows.length === 0) return slug
    
    count++
    slug = `${baseSlug}-${count}`
  }
}

// ── GET /api/recipes ──────────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM recipes WHERE status = 'published' ORDER BY created_at DESC")
  res.json(result.rows.map(formatRecipe))
}))

// ── GET /api/recipes/:slug ────────────────────────────────────────────────────
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params
  
  const result = await pool.query('SELECT * FROM recipes WHERE slug = $1', [slug])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Recipe not found' })
  }

  res.json(formatRecipe(result.rows[0]))
}))

// ── Admin Endpoints ──

// GET /api/admin/recipes (list all including drafts)
router.get('/admin/recipes', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC')
  res.json({
    success: true,
    recipes: result.rows.map(formatRecipe)
  })
}))

// POST /api/admin/recipes
router.post('/admin/recipes', requireAdmin, asyncHandler(async (req, res) => {
  const r = recipeSchema.parse(req.body)
  const slug = await generateUniqueRecipeSlug(r.title)
  const id = slug

  const result = await pool.query(
    `INSERT INTO recipes (id, slug, title, category, tags, time, servings, difficulty, image, description, ingredients, steps, chef_tip, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      id,
      slug,
      r.title,
      r.category,
      JSON.stringify(r.tags),
      r.time,
      r.servings,
      r.difficulty,
      r.image,
      r.description,
      JSON.stringify(r.ingredients),
      JSON.stringify(r.steps),
      r.chefTip,
      r.status
    ]
  )

  res.status(201).json(formatRecipe(result.rows[0]))
}))

// PUT /api/admin/recipes/:id
router.put('/admin/recipes/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const r = recipeSchema.parse(req.body)

  const check = await pool.query('SELECT id FROM recipes WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Recipe not found' })
  }

  const slug = await generateUniqueRecipeSlug(r.title, id)

  const result = await pool.query(
    `UPDATE recipes SET
      slug = $1, title = $2, category = $3, tags = $4, time = $5, servings = $6, difficulty = $7, image = $8, description = $9, ingredients = $10, steps = $11, chef_tip = $12, status = $13
     WHERE id = $14
     RETURNING *`,
    [
      slug,
      r.title,
      r.category,
      JSON.stringify(r.tags),
      r.time,
      r.servings,
      r.difficulty,
      r.image,
      r.description,
      JSON.stringify(r.ingredients),
      JSON.stringify(r.steps),
      r.chefTip,
      r.status,
      id
    ]
  )

  res.json(formatRecipe(result.rows[0]))
}))

// DELETE /api/admin/recipes/:id
router.delete('/admin/recipes/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Recipe not found' })
  }

  res.json({ success: true, id })
}))

export default router

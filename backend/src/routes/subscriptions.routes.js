import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const planSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().optional().nullable(),
  price: z.number().min(0),
  period: z.enum(['week', 'month']),
  savings: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional().default([]),
  color: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  isPopular: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active')
})

const userSubSchema = z.object({
  planId: z.string(),
  address: z.any()
})

function formatPlan(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: Number(p.price),
    period: p.period,
    savings: p.savings,
    highlights: typeof p.highlights === 'string' ? JSON.parse(p.highlights) : p.highlights,
    color: p.color,
    badge: p.badge,
    isPopular: p.is_popular,
    status: p.status
  }
}

// ── GET /api/subscriptions/plans ──────────────────────────────────────────────
router.get('/subscriptions/plans', asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM subscription_plans WHERE status = 'active' ORDER BY price ASC")
  res.json(result.rows.map(formatPlan))
}))

// ── POST /api/subscriptions ───────────────────────────────────────────────────
router.post('/subscriptions', requireUser, asyncHandler(async (req, res) => {
  const { planId, address } = userSubSchema.parse(req.body)

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId)
  const planCheck = await pool.query(
    isUuid ? 'SELECT id FROM subscription_plans WHERE id = $1' : 'SELECT id FROM subscription_plans WHERE slug = $1',
    [planId]
  )

  if (planCheck.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription plan not found' })
  }

  const dbPlanId = planCheck.rows[0].id

  const nextDelivery = new Date()
  nextDelivery.setDate(nextDelivery.getDate() + 7)

  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_id, status, start_date, next_delivery_date, address)
     VALUES ($1, $2, 'active', NOW(), $3, $4)
     RETURNING id`,
    [req.user.id, dbPlanId, nextDelivery, JSON.stringify(address)]
  )

  res.status(201).json({
    success: true,
    subscriptionId: result.rows[0].id
  })
}))

// ── GET /api/subscriptions/mine ───────────────────────────────────────────────
router.get('/subscriptions/mine', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT s.*, p.name as plan_name, p.price as plan_price, p.period as plan_period
     FROM subscriptions s
     JOIN subscription_plans p ON s.plan_id = p.id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [req.user.id]
  )

  res.json({
    success: true,
    subscriptions: result.rows.map(r => ({
      id: r.id,
      planId: r.plan_id,
      planName: r.plan_name,
      price: Number(r.plan_price),
      period: r.plan_period,
      status: r.status,
      startDate: r.start_date.toISOString().split('T')[0],
      nextDelivery: r.next_delivery_date ? r.next_delivery_date.toISOString().split('T')[0] : null,
      address: typeof r.address === 'string' ? JSON.parse(r.address) : r.address
    }))
  })
}))

// ── PUT /api/subscriptions/:id/pause ──────────────────────────────────────────
router.put('/subscriptions/:id/pause', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params

  const check = await pool.query('SELECT user_id FROM subscriptions WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription not found' })
  }

  if (check.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  await pool.query(
    "UPDATE subscriptions SET status = 'paused', next_delivery_date = NULL, updated_at = NOW() WHERE id = $1",
    [id]
  )

  res.json({ success: true, message: 'Subscription paused successfully' })
}))

// ── PUT /api/subscriptions/:id/resume ─────────────────────────────────────────
router.put('/subscriptions/:id/resume', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params

  const check = await pool.query('SELECT user_id FROM subscriptions WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription not found' })
  }

  if (check.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  const nextDelivery = new Date()
  nextDelivery.setDate(nextDelivery.getDate() + 7)

  await pool.query(
    "UPDATE subscriptions SET status = 'active', next_delivery_date = $1, updated_at = NOW() WHERE id = $2",
    [nextDelivery, id]
  )

  res.json({ success: true, message: 'Subscription resumed successfully' })
}))

// ── PUT /api/subscriptions/:id/cancel ─────────────────────────────────────────
router.put('/subscriptions/:id/cancel', requireUser, asyncHandler(async (req, res) => {
  const { id } = req.params

  const check = await pool.query('SELECT user_id FROM subscriptions WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription not found' })
  }

  if (check.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }

  await pool.query(
    "UPDATE subscriptions SET status = 'cancelled', next_delivery_date = NULL, updated_at = NOW() WHERE id = $1",
    [id]
  )

  res.json({ success: true, message: 'Subscription cancelled successfully' })
}))

// ── Admin Endpoints ──

// GET /api/admin/subscriptions/plans (lists all plans)
router.get('/admin/subscriptions/plans', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM subscription_plans ORDER BY created_at DESC')
  res.json({
    success: true,
    plans: result.rows.map(formatPlan)
  })
}))

// POST /api/admin/subscriptions/plans
router.post('/admin/subscriptions/plans', requireAdmin, asyncHandler(async (req, res) => {
  const p = planSchema.parse(req.body)
  const slug = p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const result = await pool.query(
    `INSERT INTO subscription_plans (id, slug, name, tagline, price, period, savings, highlights, color, badge, is_popular, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      slug,
      slug,
      p.name,
      p.tagline,
      p.price,
      p.period,
      p.savings,
      JSON.stringify(p.highlights),
      p.color,
      p.badge,
      p.isPopular,
      p.status
    ]
  )

  res.status(201).json(formatPlan(result.rows[0]))
}))

// PUT /api/admin/subscriptions/plans/:id
router.put('/admin/subscriptions/plans/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const p = planSchema.parse(req.body)

  const check = await pool.query('SELECT id FROM subscription_plans WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription plan not found' })
  }

  const result = await pool.query(
    `UPDATE subscription_plans SET
      name = $1, tagline = $2, price = $3, period = $4, savings = $5, highlights = $6, color = $7, badge = $8, is_popular = $9, status = $10
     WHERE id = $11
     RETURNING *`,
    [
      p.name,
      p.tagline,
      p.price,
      p.period,
      p.savings,
      JSON.stringify(p.highlights),
      p.color,
      p.badge,
      p.isPopular,
      p.status,
      id
    ]
  )

  res.json(formatPlan(result.rows[0]))
}))

// DELETE /api/admin/subscriptions/plans/:id
router.delete('/admin/subscriptions/plans/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM subscription_plans WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Subscription plan not found' })
  }

  res.json({ success: true, id })
}))

export default router

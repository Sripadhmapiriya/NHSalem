import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const wholesaleSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default('0000000000'),
  industry: z.string().min(2),
  qty: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
  status: z.string().optional().default('new')
})

function formatInquiry(r) {
  return {
    id: r.id,
    businessName: r.business_name,
    contact: r.contact_name,
    email: r.email,
    phone: r.phone,
    industry: r.industry,
    qty: r.qty,
    notes: r.specifications,
    enquiryDate: r.created_at.toISOString().split('T')[0],
    status: r.status
  }
}

// POST /api/wholesale (Public submission)
router.post('/', asyncHandler(async (req, res) => {
  const body = wholesaleSchema.parse(req.body)

  const result = await pool.query(
    `INSERT INTO wholesale_inquiries (business_name, contact_name, email, phone, industry, qty, specifications, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      body.businessName,
      body.contactName,
      body.email,
      body.phone,
      body.industry,
      body.qty || null,
      body.specifications || null,
      body.status
    ]
  )

  res.status(201).json({
    success: true,
    referenceId: `B2B-${Date.now()}`
  })
}))

// GET /api/admin/wholesale (Admin list)
router.get('/admin', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM wholesale_inquiries ORDER BY created_at DESC')
  res.json({
    success: true,
    inquiries: result.rows.map(formatInquiry)
  })
}))

// POST /api/admin/wholesale (Admin create)
router.post('/admin', requireAdmin, asyncHandler(async (req, res) => {
  const body = wholesaleSchema.parse(req.body)

  const result = await pool.query(
    `INSERT INTO wholesale_inquiries (business_name, contact_name, email, phone, industry, qty, specifications, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      body.businessName,
      body.contactName,
      body.email,
      body.phone,
      body.industry,
      body.qty || null,
      body.specifications || null,
      body.status
    ]
  )

  res.status(201).json(formatInquiry(result.rows[0]))
}))

// PUT /api/admin/wholesale/:id (Admin update)
router.put('/admin/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const body = wholesaleSchema.parse(req.body)

  const check = await pool.query('SELECT id FROM wholesale_inquiries WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' })
  }

  const result = await pool.query(
    `UPDATE wholesale_inquiries SET
      business_name = $1, contact_name = $2, email = $3, phone = $4, industry = $5, qty = $6, specifications = $7, status = $8
     WHERE id = $9
     RETURNING *`,
    [
      body.businessName,
      body.contactName,
      body.email,
      body.phone,
      body.industry,
      body.qty || null,
      body.specifications || null,
      body.status,
      id
    ]
  )

  res.json(formatInquiry(result.rows[0]))
}))

// DELETE /api/admin/wholesale/:id (Admin delete)
router.delete('/admin/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('DELETE FROM wholesale_inquiries WHERE id = $1 RETURNING id', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' })
  }

  res.json({ success: true, id })
}))

export default router

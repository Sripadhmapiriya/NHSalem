import express from 'express'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// ── POST /api/contact ──────────────────────────────────────────────────────────
// Public endpoint for submitting a contact message
router.post('/contact', asyncHandler(async (req, res) => {
  const { name, contact, message } = req.body

  if (!name || !contact || !message) {
    return res.status(400).json({ success: false, error: 'Name, contact, and message are required' })
  }

  const result = await pool.query(
    `INSERT INTO contact_messages (name, contact, message) 
     VALUES ($1, $2, $3) RETURNING *`,
    [name, contact, message]
  )

  res.status(201).json({ success: true, message: result.rows[0] })
}))

// ── GET /api/admin/messages ────────────────────────────────────────────────────
// Admin endpoint to get all contact messages
router.get('/admin/messages', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM contact_messages ORDER BY created_at DESC`
  )
  res.json({ success: true, messages: result.rows })
}))

// ── PUT /api/admin/messages/:id ────────────────────────────────────────────────
// Admin endpoint to update message status
router.put('/admin/messages/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const result = await pool.query(
    `UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  )

  if (!result.rows.length) {
    return res.status(404).json({ success: false, error: 'Message not found' })
  }

  res.json({ success: true, message: result.rows[0] })
}))

// ── DELETE /api/admin/messages/:id ─────────────────────────────────────────────
// Admin endpoint to delete a message
router.delete('/admin/messages/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query(
    `DELETE FROM contact_messages WHERE id = $1 RETURNING id`,
    [id]
  )

  if (!result.rows.length) {
    return res.status(404).json({ success: false, error: 'Message not found' })
  }

  res.json({ success: true })
}))

export default router

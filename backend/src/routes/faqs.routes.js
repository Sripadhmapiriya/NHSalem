import express from 'express'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

// GET /api/faqs?search=
router.get('/', asyncHandler(async (req, res) => {
  const { search } = req.query

  let sql = 'SELECT id, title, content, category FROM faqs'
  const params = []

  if (search) {
    sql += ' WHERE LOWER(title) LIKE $1 OR LOWER(content) LIKE $1'
    params.push(`%${search.toLowerCase()}%`)
  }

  sql += ' ORDER BY id ASC'

  const result = await pool.query(sql, params)
  res.json(result.rows)
}))

export default router

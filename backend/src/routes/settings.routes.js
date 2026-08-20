import express from 'express'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

// ── GET /api/settings/promotions ──────────────────────────────────────────────
router.get('/promotions', asyncHandler(async (req, res) => {
  // Public endpoint to get the banner settings (now fetches directly from promotions table)
  const couponRes = await pool.query(
    "SELECT id, code, description, discount_value, type FROM promotions WHERE status = 'active' AND show_on_ui = true"
  )
  
  if (couponRes.rows.length > 0) {
    return res.json({
      success: true,
      banner: {
        enabled: true,
        coupons: couponRes.rows
      }
    })
  }

  return res.json({ success: true, banner: { enabled: false, coupons: [] } })
}))

export default router

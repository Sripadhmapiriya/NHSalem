import express from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TDeuMv7LYAc8Se'
const keySecret = process.env.RAZORPAY_KEY_SECRET || '3YJPf7naLlS0LKjHAfhCmYUi'

let razorpay = null
if (keyId && keySecret && !keyId.includes('mockkey')) {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })
    console.log('Razorpay configured successfully.')
  } catch (err) {
    console.error('Failed to initialize Razorpay:', err)
  }
} else {
  console.warn('WARNING: Razorpay credentials missing or mock. Running in STUB TEST MODE.')
}

router.post('/create-order', asyncHandler(async (req, res) => {
  const { amount } = req.body
  
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required' })
  }

  const amountPaise = Math.round(Number(amount) * 100)

  if (razorpay) {
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    }
    const order = await razorpay.orders.create(options)
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId
    })
  } else {
    // Stub Test Mode
    const mockOrderId = `order_mock_${Date.now()}`
    res.json({
      success: true,
      orderId: mockOrderId,
      amount: amountPaise,
      currency: 'INR',
      key: 'rzp_test_TDeuMv7LYAc8Se'
    })
  }
}))

router.post('/verify', asyncHandler(async (req, res) => {
  const razorpay_order_id = req.body.razorpay_order_id || req.body.razorpayOrderId
  const razorpay_payment_id = req.body.razorpay_payment_id || req.body.razorpayPaymentId
  const razorpay_signature = req.body.razorpay_signature || req.body.razorpaySignature
  const orderId = req.body.orderId

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing required payment verification details' })
  }

  let verified = false

  if (razorpay) {
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id)
    const generatedSignature = hmac.digest('hex')
    verified = generatedSignature === razorpay_signature
  } else {
    // Test mode verification always passes for stubs
    verified = true
  }

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' })
  }

  // Update order status in db
  let orderRes
  if (orderId) {
    orderRes = await pool.query(
      'SELECT id FROM orders WHERE order_number = $1 OR id = $1',
      [orderId]
    )
  } else {
    orderRes = await pool.query(
      'SELECT id FROM orders WHERE razorpay_order_id = $1',
      [razorpay_order_id]
    )
  }

  if (orderRes && orderRes.rows.length > 0) {
    const dbOrderId = orderRes.rows[0].id
    await pool.query(
      `UPDATE orders 
       SET payment_status = 'paid', razorpay_order_id = $1, razorpay_payment_id = $2 
       WHERE id = $3`,
      [razorpay_order_id, razorpay_payment_id, dbOrderId]
    )
    return res.json({ success: true, orderId: dbOrderId, message: 'Payment verified successfully' })
  } else {
    // If the order wasn't placed in the DB yet, we still return verified: true and the success status
    // so the frontend can then place the order.
    return res.json({ success: true, message: 'Payment signature verified successfully (Order not found in DB)' })
  }
}))

router.get('/key', (req, res) => {
  res.json({ key: keyId })
})

export default router

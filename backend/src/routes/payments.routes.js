import express from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import pool from '../db/pool.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET

let razorpay = null
if (keyId && keySecret) {
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
  console.warn('WARNING: Razorpay credentials missing. Running in TEST MODE.')
}

router.post('/razorpay/create-order', asyncHandler(async (req, res) => {
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
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    })
  } else {
    // Stub Test Mode
    const mockOrderId = `order_mock_${Date.now()}`
    res.json({
      success: true,
      razorpayOrderId: mockOrderId,
      amount: amountPaise,
      currency: 'INR',
      keyId: 'rzp_test_mockkey'
    })
  }
}))

router.post('/razorpay/verify', asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

  let verified = false

  if (razorpay) {
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId)
    const generatedSignature = hmac.digest('hex')
    verified = generatedSignature === razorpaySignature
  } else {
    // Test mode verification
    verified = true
  }

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' })
  }

  // Update order status in db
  const orderRes = await pool.query(
    'SELECT id FROM orders WHERE order_number = $1 OR id = $1',
    [orderId]
  )

  if (orderRes.rows.length > 0) {
    const dbOrderId = orderRes.rows[0].id
    await pool.query(
      `UPDATE orders 
       SET payment_status = 'paid', razorpay_order_id = $1, razorpay_payment_id = $2 
       WHERE id = $3`,
      [razorpayOrderId, razorpayPaymentId, dbOrderId]
    )
  }

  res.json({ success: true, message: 'Payment verified successfully' })
}))

export default router

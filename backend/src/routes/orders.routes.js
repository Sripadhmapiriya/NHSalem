import express from 'express'
import { z } from 'zod'
import pool from '../db/pool.js'
import { verifyUserToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import { requireUser } from '../middleware/auth.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendMail } from '../utils/mailer.js'
import { orderPlacedCustomer, newOrderAdmin, orderConfirmedCustomer } from '../utils/emailTemplates.js'


const router = express.Router()

const orderItemSchema = z.object({
  productId: z.string(),
  weight: z.string(),
  quantity: z.number().int().positive()
})

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema),
  address: z.any(),
  slot: z.string(),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().optional().nullable(),
  razorpayOrderId: z.string().optional().nullable(),
  razorpayPaymentId: z.string().optional().nullable(),
  razorpaySignature: z.string().optional().nullable()
})

const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'accepted', 'packed', 'out_for_delivery', 'delivered', 'cancelled'])
})

function getOptionalUser(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    return verifyUserToken(token)
  }
  return null
}

async function formatOrderDetails(orderRow) {
  const [itemsRes, stagesRes] = await Promise.all([
    pool.query(
      `SELECT oi.price, oi.quantity, oi.product_name as name, oi.weight, p.image, p.slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderRow.id]
    ),
    pool.query(
      'SELECT stage_key as id, label, icon, completed_at as "completedAt" FROM order_stages WHERE order_id = $1 ORDER BY (CASE WHEN stage_key = \'confirmed\' THEN 1 WHEN stage_key = \'packed\' THEN 2 WHEN stage_key = \'out_for_delivery\' THEN 3 ELSE 4 END) ASC',
      [orderRow.id]
    )
  ])

  return {
    id: orderRow.order_number,
    dbId: orderRow.id,
    status: orderRow.status,
    placedAt: orderRow.placed_at,
    estimatedDelivery: orderRow.estimated_delivery,
    address: typeof orderRow.address === 'string' ? JSON.parse(orderRow.address) : orderRow.address,
    items: itemsRes.rows.map(item => ({
      name: item.name,
      weight: item.weight,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image || null,
      slug: item.slug || null
    })),
    subtotal: Number(orderRow.subtotal),
    discount: Number(orderRow.discount),
    shipping: Number(orderRow.shipping),
    total: Number(orderRow.total),
    freshnessScore: orderRow.freshness_score,
    catchTime: orderRow.catch_time,
    paymentMethod: orderRow.payment_method,
    paymentStatus: orderRow.payment_status,
    stages: stagesRes.rows.map(s => ({
      ...s,
      completedAt: s.completedAt ? new Date(s.completedAt).toISOString() : null
    }))
  }
}

async function getOrdersDetailed(ordersRows) {
  if (ordersRows.length === 0) return []

  const orderIds = ordersRows.map(o => o.id)

  const [itemsRes, stagesRes] = await Promise.all([
    pool.query(
      `SELECT oi.order_id, oi.price, oi.quantity, oi.product_name as name, oi.weight, p.image, p.slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ANY($1)`,
      [orderIds]
    ),
    pool.query(
      `SELECT order_id, stage_key as id, label, icon, completed_at as "completedAt"
       FROM order_stages
       WHERE order_id = ANY($1)
       ORDER BY (CASE WHEN stage_key = 'confirmed' THEN 1 WHEN stage_key = 'packed' THEN 2 WHEN stage_key = 'out_for_delivery' THEN 3 ELSE 4 END) ASC`,
      [orderIds]
    )
  ])

  // Group items by order_id
  const itemsByOrder = {}
  itemsRes.rows.forEach(item => {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = []
    }
    itemsByOrder[item.order_id].push({
      name: item.name,
      weight: item.weight,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image || null,
      slug: item.slug || null
    })
  })

  // Group stages by order_id
  const stagesByOrder = {}
  stagesRes.rows.forEach(s => {
    if (!stagesByOrder[s.order_id]) {
      stagesByOrder[s.order_id] = []
    }
    stagesByOrder[s.order_id].push({
      id: s.id,
      label: s.label,
      icon: s.icon,
      completedAt: s.completedAt ? new Date(s.completedAt).toISOString() : null
    })
  })

  return ordersRows.map(orderRow => ({
    id: orderRow.order_number,
    dbId: orderRow.id,
    status: orderRow.status,
    placedAt: orderRow.placed_at,
    estimatedDelivery: orderRow.estimated_delivery,
    address: typeof orderRow.address === 'string' ? JSON.parse(orderRow.address) : orderRow.address,
    items: itemsByOrder[orderRow.id] || [],
    subtotal: Number(orderRow.subtotal),
    discount: Number(orderRow.discount),
    shipping: Number(orderRow.shipping),
    total: Number(orderRow.total),
    freshnessScore: orderRow.freshness_score,
    catchTime: orderRow.catch_time,
    paymentMethod: orderRow.payment_method,
    paymentStatus: orderRow.payment_status,
    stages: stagesByOrder[orderRow.id] || []
  }))
}

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/orders', asyncHandler(async (req, res) => {
  const { items, address, slot, paymentMethod, couponCode } = placeOrderSchema.parse(req.body)
  const user = getOptionalUser(req)

  let subtotal = 0
  const dbItems = []

  for (const item of items) {
    const prodRes = await pool.query('SELECT name, weights FROM products WHERE id = $1', [item.productId])
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Product ${item.productId} not found` })
    }

    const prod = prodRes.rows[0]
    const weights = typeof prod.weights === 'string' ? JSON.parse(prod.weights) : prod.weights
    const variant = weights.find(w => w.label === item.weight)

    if (!variant) {
      return res.status(400).json({ success: false, message: `Weight variant ${item.weight} not found for product ${prod.name}` })
    }

    const price = Number(variant.price)
    subtotal += price * item.quantity

    dbItems.push({
      productId: item.productId,
      name: prod.name,
      weight: item.weight,
      price,
      quantity: item.quantity
    })
  }

  let discount = 0
  let validCouponCode = null

  if (couponCode) {
    const promoRes = await pool.query('SELECT * FROM promotions WHERE code = $1', [couponCode.toUpperCase().trim()])
    const coupon = promoRes.rows[0]

    if (coupon && coupon.status === 'active' && subtotal >= Number(coupon.min_order)) {
      validCouponCode = coupon.code
      if (coupon.type === 'flat') {
        discount = Number(coupon.discount_value)
      } else if (coupon.type === 'percent') {
        discount = Math.round((subtotal * Number(coupon.discount_value)) / 100)
      }

      await pool.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = $1', [coupon.id])
    }
  }

  const shipping = subtotal >= 499 ? 0 : 49
  const total = Math.max(0, subtotal - discount + shipping)

  const orderNumber = `NHS-${Math.floor(10000 + Math.random() * 90000)}`

  const estimatedDelivery = new Date()
  estimatedDelivery.setHours(estimatedDelivery.getHours() + 3)

  const orderInsertRes = await pool.query(
    `INSERT INTO orders (
      order_number, user_id, status, address, delivery_slot, payment_method, payment_status, subtotal, discount, shipping, total, coupon_code, freshness_score, catch_time, estimated_delivery, razorpay_order_id, razorpay_payment_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING id`,
    [
      orderNumber,
      user ? user.id : null,
      'confirmed',
      JSON.stringify(address),
      slot,
      paymentMethod,
      'pending',
      subtotal,
      discount,
      shipping,
      total,
      validCouponCode,
      95,
      '2h ago',
      estimatedDelivery,
      req.body.razorpayOrderId || null,
      req.body.razorpayPaymentId || null
    ]
  )

  const dbOrderId = orderInsertRes.rows[0].id

  for (const item of dbItems) {
    await pool.query(
      'INSERT INTO order_items (order_id, product_id, product_name, weight, price, quantity) VALUES ($1, $2, $3, $4, $5, $6)',
      [dbOrderId, item.productId, item.name, item.weight, item.price, item.quantity]
    )
  }

  const stages = [
    { key: 'confirmed', label: 'Confirmed', icon: 'check_circle', completedAt: new Date() },
    { key: 'packed', label: 'Packed on Ice', icon: 'ac_unit', completedAt: null },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'local_shipping', completedAt: null },
    { key: 'delivered', label: 'Delivered', icon: 'home', completedAt: null }
  ]

  for (const stage of stages) {
    await pool.query(
      'INSERT INTO order_stages (order_id, stage_key, label, icon, completed_at) VALUES ($1, $2, $3, $4, $5)',
      [dbOrderId, stage.key, stage.label, stage.icon, stage.completedAt]
    )
  }

  if (user) {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user.id])
  }

  // Send Order Placed emails asynchronously
  try {
    let customerEmail = user?.email
    if (user?.id && !customerEmail) {
      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [user.id])
      if (userRes.rows.length > 0) {
        customerEmail = userRes.rows[0].email
      }
    }

    if (customerEmail) {
      const customerHtml = orderPlacedCustomer({
        orderRef: orderNumber,
        customerName: address.name || user?.name || 'Valued Customer',
        items: dbItems,
        total,
        address,
        slot
      })
      sendMail({
        to: customerEmail,
        subject: `Your NH Salem Order #${orderNumber} is Received!`,
        html: customerHtml
      }).catch(err => console.error('Error sending order confirmation email:', err))
    }

    const adminEmail = process.env.SHOP_ADMIN_EMAIL || 'sripadhmapiriya12@gmail.com'
    const adminHtml = newOrderAdmin({
      orderRef: orderNumber,
      customerName: address.name || user?.name || 'Customer',
      customerEmail: customerEmail || 'guest@example.com',
      customerPhone: address.phone || user?.phone || 'N/A',
      items: dbItems,
      total,
      address,
      slot,
      paymentMethod,
      orderId: dbOrderId
    })
    sendMail({
      to: adminEmail,
      subject: `🆕 New Order #${orderNumber} — Action Required`,
      html: adminHtml
    }).catch(err => console.error('Error sending admin order alert email:', err))
  } catch (emailErr) {
    console.error('Error triggering order placement emails:', emailErr)
  }

  res.status(201).json({ success: true, orderId: orderNumber })
}))

// ── GET /api/orders/mine ──────────────────────────────────────────────────────
router.get('/orders/mine', requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC', [req.user.id])
  const orders = await getOrdersDetailed(result.rows)
  res.json({ success: true, orders })
}))

// ── GET /api/orders/my-orders (and aliased /my-orders) ──────────────────────────
router.get(['/orders/my-orders', '/my-orders'], requireUser, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC', [req.user.id])
  const orders = await getOrdersDetailed(result.rows)
  res.json(orders)
}))

// ── GET /api/orders/:orderId ──────────────────────────────────────────────────
router.get('/orders/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)

  const sql = isUuid 
    ? 'SELECT * FROM orders WHERE id = $1' 
    : 'SELECT * FROM orders WHERE order_number = $1'

  const result = await pool.query(sql, [orderId])

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  const details = await formatOrderDetails(result.rows[0])
  res.json(details)
}))

// ── Admin Endpoints ──

// GET /api/admin/orders
router.get('/admin/orders', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY placed_at DESC')
  const orders = await getOrdersDetailed(result.rows)
  res.json({
    success: true,
    orders
  })
}))

// GET /api/admin/orders/:id
router.get('/admin/orders/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  const details = await formatOrderDetails(result.rows[0])
  res.json(details)
}))

// PUT /api/admin/orders/:id/status
router.put('/admin/orders/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = updateStatusSchema.parse(req.body)

  const check = await pool.query('SELECT status FROM orders WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  let paymentStatusUpdate = ''
  if (status === 'delivered') {
    paymentStatusUpdate = ", payment_status = 'paid'"
  }
  
  await pool.query(`UPDATE orders SET status = $1 ${paymentStatusUpdate} WHERE id = $2`, [status, id])

  const now = new Date()
  if (status === 'packed') {
    await pool.query("UPDATE order_stages SET completed_at = $1 WHERE order_id = $2 AND stage_key IN ('confirmed', 'packed')", [now, id])
  } else if (status === 'out_for_delivery') {
    await pool.query("UPDATE order_stages SET completed_at = $1 WHERE order_id = $2 AND stage_key IN ('confirmed', 'packed', 'out_for_delivery')", [now, id])
  } else if (status === 'delivered') {
    await pool.query("UPDATE order_stages SET completed_at = $1 WHERE order_id = $2", [now, id])
  } else if (status === 'cancelled') {
    await pool.query("UPDATE order_stages SET completed_at = NULL WHERE order_id = $2 AND stage_key != 'confirmed'", [id])
  }

  const updatedOrder = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  const details = await formatOrderDetails(updatedOrder.rows[0])

  res.json({
    success: true,
    order: details
  })
}))

// PATCH /api/orders/:id/accept (admin accepts order)
router.patch('/orders/:id/accept', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params

  const check = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }

  const order = check.rows[0]

  // Update order status to 'accepted' (which represents accepted status)
  await pool.query("UPDATE orders SET status = 'accepted' WHERE id = $1", [id])

  // Fetch full details + items
  const details = await formatOrderDetails({ ...order, status: 'accepted' })

  // Send "Order Confirmed" email to customer with full bill
  let customerEmail = details.address?.email
  if (order.user_id) {
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [order.user_id])
    if (userRes.rows.length > 0) {
      customerEmail = userRes.rows[0].email
    }
  }

  if (customerEmail) {
    try {
      const emailHtml = orderConfirmedCustomer({
        orderRef: details.id,
        customerName: details.address?.name || 'Valued Customer',
        items: details.items,
        total: details.total,
        address: details.address,
        slot: details.deliverySlot || order.delivery_slot
      })
      await sendMail({
        to: customerEmail,
        subject: `✅ Your Order #${details.id} has been Confirmed!`,
        html: emailHtml
      })
    } catch (mailErr) {
      console.error('Failed to send order acceptance confirmation email:', mailErr)
    }
  }

  res.json({
    success: true,
    order: details
  })
}))

export default router

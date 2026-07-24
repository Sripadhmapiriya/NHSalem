import express from 'express'
// Trigger nodemon restart
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import pool from '../db/pool.js'
import { generateAdminToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import cloudinary from '../utils/cloudinary.js'

// Ensure uploads directory exists to prevent multer 500 errors
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({ storage: storage })

const router = express.Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase().trim()])
  const admin = result.rows[0]

  if (!admin) {
    return res.status(400).json({ success: false, message: 'Invalid credentials. Please check your email and security key.' })
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash)
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid credentials. Please check your email and security key.' })
  }

  const token = generateAdminToken(admin)

  res.json({
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    },
    token
  })
}))

router.get('/auth/me', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM admins WHERE id = $1', [req.admin.id])
  const admin = result.rows[0]
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' })
  }
  res.json({ success: true, admin })
}))

// Upload Image
router.post('/upload', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' })
  }
  
  // Directly save locally since Cloudinary is not configured yet
  const localUrl = `http://localhost:4000/uploads/${req.file.filename}`
  res.json({ success: true, url: localUrl })
}))

// Dashboard stats
router.get('/dashboard/stats', requireAdmin, asyncHandler(async (req, res) => {
  // Generate promises for all queries to run in parallel
  const kpiPromises = [
    pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE placed_at >= NOW() - INTERVAL '30 days' AND user_id IS NOT NULL`),
    pool.query(`
      SELECT oi.product_name as name, COALESCE(SUM(oi.quantity), 0) as sales, COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.placed_at >= NOW() - INTERVAL '7 days' AND o.status != 'cancelled'
      GROUP BY oi.product_name
      ORDER BY sales DESC
      LIMIT 5
    `),
    pool.query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
  ]

  // Add the 7 weekly stats queries (Today is index 0 in this loop when i=0, but pushed last)
  for (let i = 6; i >= 0; i--) {
    kpiPromises.push(
      pool.query(
        `SELECT 
           COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as total, 
           COUNT(*) as count 
         FROM orders 
         WHERE placed_at::date = CURRENT_DATE - $1::integer`,
        [i]
      )
    )
  }

  // Run all 10 queries concurrently
  const results = await Promise.all(kpiPromises)

  const activeCustomers = Number(results[0].rows[0].count)
  
  let topProducts = results[1].rows.map(r => ({
    name: r.name,
    sales: Number(r.sales),
    revenue: Number(r.revenue)
  }))

  const statusRows = results[2].rows
  const orderStatusBreakdown = {
    confirmed: 0,
    accepted: 0,
    packed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0
  }
  statusRows.forEach(row => {
    if (row.status in orderStatusBreakdown) {
      orderStatusBreakdown[row.status] = Number(row.count)
    }
  })

  // Calculate pending orders derived directly from the breakdown sum
  const pendingOrders = orderStatusBreakdown.confirmed + orderStatusBreakdown.accepted + orderStatusBreakdown.packed + orderStatusBreakdown.out_for_delivery

  // Extract weekly results (indexes 3 to 9)
  const weeklyResults = results.slice(3)
  const weeklyRevenue = weeklyResults.map(res => Number(res.rows[0].total))
  const weeklyOrders = weeklyResults.map(res => Number(res.rows[0].count))

  // Today's stats are exactly the last item in the weekly charts (i=0)
  const todayRevenue = weeklyRevenue[6]
  const todayOrders = weeklyOrders[6]

  res.json({
    success: true,
    todayRevenue,
    todayOrders,
    activeCustomers,
    pendingOrders,
    revenueGrowth: '+12.4%', // Placeholder
    orderGrowth: '+8.2%', // Placeholder
    customerGrowth: '+3.1%', // Placeholder
    pendingChange: '-2', // Placeholder
    weeklyRevenue,
    weeklyOrders,
    topProducts,
    orderStatusBreakdown
  })
}))

// Get list of all customers/users
router.get('/customers', requireAdmin, asyncHandler(async (req, res) => {
  // Let's get distinct customers and aggregate spent / orders
  const result = await pool.query(
    `SELECT 
       u.id::text as id, 
       u.name, 
       u.email, 
       COALESCE(u.phone, '') as phone, 
       'Bangalore' as city, 
       COUNT(o.id) as orders,
       COALESCE(SUM(o.total), 0) as "totalSpent",
       TO_CHAR(u.created_at, 'YYYY-MM-DD') as "joinedAt",
       COALESCE(u.status, 'active') as status,
       TO_CHAR(MAX(o.placed_at), 'YYYY-MM-DD') as "lastOrder",
       u.created_at as raw_joined
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id
     GROUP BY u.id, u.name, u.email, u.phone, u.status, u.created_at

     UNION ALL

     SELECT 
       'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) as id,
       COALESCE(address->>'name', 'Guest Customer') as name,
       COALESCE(address->>'email', '') as email,
       COALESCE(address->>'phone', '') as phone,
       COALESCE(address->>'city', 'Bangalore') as city,
       COUNT(o2.id) as orders,
       COALESCE(SUM(o2.total), 0) as "totalSpent",
       TO_CHAR(MIN(o2.placed_at), 'YYYY-MM-DD') as "joinedAt",
       'guest' as status,
       TO_CHAR(MAX(o2.placed_at), 'YYYY-MM-DD') as "lastOrder",
       MIN(o2.placed_at) as raw_joined
     FROM orders o2
     WHERE o2.user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.id = o2.user_id)
     GROUP BY address->>'name', address->>'email', address->>'phone', address->>'city'
     
     ORDER BY raw_joined DESC`
  )
  
  res.json({
    success: true,
    customers: result.rows.map(r => ({
      ...r,
      orders: Number(r.orders),
      totalSpent: Number(r.totalSpent)
    }))
  })
}))

// Helper function to get detailed orders for customer detail view
async function getCustomerOrdersDetailed(ordersRows) {
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

// GET /api/admin/customers/:id/orders
router.get('/customers/:id/orders', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  let customer
  let ordersRows = []
  let stats = { total_orders: 0, total_spent: 0, last_order_date: null }

  if (id.startsWith('guest-')) {
    // Guest Customer
    const ordersRes = await pool.query(
      `SELECT * FROM orders 
       WHERE (user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.id = orders.user_id))
         AND 'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) = $1
       ORDER BY placed_at DESC`,
      [id]
    )
    
    if (ordersRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }
    
    ordersRows = ordersRes.rows
    const firstOrder = ordersRows[0]
    const addressObj = typeof firstOrder.address === 'string' ? JSON.parse(firstOrder.address) : firstOrder.address
    
    // We can also get joinedAt from SQL query:
    const joinedAtRes = await pool.query(
      `SELECT TO_CHAR(MIN(placed_at), 'YYYY-MM-DD') as joined_at FROM orders 
       WHERE (user_id IS NULL OR NOT EXISTS (SELECT 1 FROM users u2 WHERE u2.id = orders.user_id))
         AND 'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) = $1`,
      [id]
    )
    const joinedAt = joinedAtRes.rows[0]?.joined_at || ''

    customer = {
      id,
      name: addressObj.name || 'Guest Customer',
      email: addressObj.email || '',
      phone: addressObj.phone || '',
      status: 'guest',
      joinedAt,
      subscription_plan: null,
      subscription_status: null
    }

    stats.total_orders = ordersRows.length
    stats.total_spent = ordersRows.reduce((sum, o) => sum + Number(o.total), 0)
    stats.last_order_date = firstOrder.placed_at
  } else {
    // Registered Customer
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUuid) {
      return res.status(400).json({ success: false, error: 'Invalid Customer ID' })
    }

    const customerRes = await pool.query(
      `SELECT u.id::text, u.name, u.email, COALESCE(u.phone, '') as phone, COALESCE(u.status, 'active') as status,
              TO_CHAR(u.created_at, 'YYYY-MM-DD') as "joinedAt",
              sp.name AS subscription_plan,
              s.status AS subscription_status
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       WHERE u.id = $1`,
      [id]
    )

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }

    customer = customerRes.rows[0]

    const ordersRes = await pool.query(
      `SELECT * FROM orders 
       WHERE user_id = $1 
       ORDER BY placed_at DESC`,
      [id]
    )
    ordersRows = ordersRes.rows

    const statsRes = await pool.query(
      `SELECT 
         COUNT(*) AS total_orders,
         COALESCE(SUM(total), 0) AS total_spent,
         MAX(placed_at) AS last_order_date
       FROM orders 
       WHERE user_id = $1`,
      [id]
    )
    stats = statsRes.rows[0]
  }

  const orders = await getCustomerOrdersDetailed(ordersRows)

  res.json({
    success: true,
    customer,
    orders,
    stats: {
      total_orders: Number(stats.total_orders),
      total_spent: Number(stats.total_spent),
      last_order_date: stats.last_order_date
    }
  })
}))

// PATCH /api/admin/customers/:id/status
router.patch('/customers/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (id.startsWith('guest-')) {
    return res.status(400).json({ success: false, error: 'Cannot change guest customer status' })
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  if (!isUuid) {
    return res.status(400).json({ success: false, error: 'Invalid Customer ID' })
  }

  const check = await pool.query('SELECT status FROM users WHERE id = $1', [id])
  if (check.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Customer not found' })
  }

  await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id])

  res.json({
    success: true,
    message: `Customer status updated to ${status}`
  })
}))

export default router

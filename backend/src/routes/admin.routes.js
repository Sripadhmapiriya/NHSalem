import express from 'express'
// Trigger nodemon restart
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import pool from '../db/pool.js'
import { generateAdminToken } from '../utils/jwt.js'
import { requireAdmin } from '../middleware/adminAuth.js'
import asyncHandler from '../utils/asyncHandler.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { sendMail } from '../utils/mailer.js'
import { passwordResetCustomer } from '../utils/emailTemplates.js'
import xlsx from 'xlsx'
import { generateUniqueSlug } from './products.routes.js'

// Ensure local uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Images are saved locally for development or local deployment
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'))
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

// Upload Image — saved directly to the local filesystem
router.post('/upload', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' })
  }

  try {
    // Return the local URL for the frontend to consume
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`
    
    res.json({ success: true, url: imageUrl })
  } catch (err) {
    console.error('Local upload failed:', err.message)
    res.status(500).json({
      success: false,
      message: 'Image upload failed on the server.',
    })
  }
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
    pool.query("SELECT status, COUNT(*) as count FROM orders GROUP BY status"),
    pool.query("SELECT COALESCE(cancelled_by, 'unknown') as actor, COALESCE(SUM(total), 0) as value, COUNT(*) as count FROM orders WHERE status = 'cancelled' GROUP BY cancelled_by"),
    pool.query("SELECT COALESCE(cancel_reason, 'No Reason given') as reason, COUNT(*) as count FROM orders WHERE status = 'cancelled' GROUP BY cancel_reason")
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

  // Run all 12 queries concurrently
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

  const cancelledByActor = results[3].rows.map(r => ({
    actor: r.actor,
    count: Number(r.count),
    value: Number(r.value)
  }))

  const cancelledCount = cancelledByActor.reduce((sum, row) => sum + row.count, 0)
  const cancelledValue = cancelledByActor.reduce((sum, row) => sum + row.value, 0)

  const cancelReasons = results[4].rows.map(r => ({
    reason: r.reason,
    count: Number(r.count)
  }))

  // Extract weekly results (indexes 5 to 11)
  const weeklyResults = results.slice(5)
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
    orderStatusBreakdown,
    cancelledOrders: {
      count: cancelledCount,
      value: cancelledValue,
      byActor: cancelledByActor,
      reasons: cancelReasons
    }
  })
}))

// Get list of all customers/users
router.get('/test-db', async (req, res) => {
  try {
    const q1 = await pool.query('SELECT * FROM users');
    const q2 = await pool.query('SELECT * FROM newsletter_subscribers');
    const q3 = await pool.query(`
      SELECT 
       'subscriber-' || id::text as id,
       'Newsletter Subscriber' as name,
       email as email,
       '' as phone,
       '-' as city,
       0 as orders,
       0 as "totalSpent",
       TO_CHAR(created_at, 'YYYY-MM-DD') as "joinedAt",
       'subscriber' as status,
       '-' as "lastOrder",
       created_at as raw_joined
     FROM newsletter_subscribers
    `);
    res.json({ users: q1.rows, subs: q2.rows, unionQuery: q3.rows });
  } catch (err) {
    res.json({ error: err.message, stack: err.stack });
  }
});

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
     
     UNION ALL

     SELECT 
       'subscriber-' || id::text as id,
       'Newsletter Subscriber' as name,
       LOWER(TRIM(email)) as email,
       '' as phone,
       '-' as city,
       0::bigint as orders,
       0::numeric as "totalSpent",
       TO_CHAR(created_at, 'YYYY-MM-DD') as "joinedAt",
       'subscriber' as status,
       '-' as "lastOrder",
       created_at as raw_joined
     FROM newsletter_subscribers
     WHERE NOT EXISTS (SELECT 1 FROM users u3 WHERE LOWER(TRIM(u3.email)) = LOWER(TRIM(newsletter_subscribers.email)))
       AND NOT EXISTS (SELECT 1 FROM orders o3 WHERE LOWER(TRIM(o3.address->>'email')) = LOWER(TRIM(newsletter_subscribers.email)))

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
      joinedAt
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
              TO_CHAR(u.created_at, 'YYYY-MM-DD') as "joinedAt"
       FROM users u
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

// GET /api/admin/customers/:id
router.get('/customers/:id', requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    console.log('Fetching customer:', id) // debug log

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let customer

    if (isUuid) {
      // Step 1: Get customer basic info
      const customerRes = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at
         FROM users u WHERE u.id = $1`,
        [id]
      )
      if (customerRes.rows.length) {
        customer = customerRes.rows[0]
      }
    }

    if (!customer) {
      // Check if it's a guest in orders
      let guestQuery
      if (isUuid) {
        guestQuery = `SELECT address->>'name' as name, address->>'email' as email, address->>'phone' as phone, MIN(placed_at) as created_at FROM orders WHERE user_id = $1 GROUP BY address->>'name', address->>'email', address->>'phone' LIMIT 1`
      } else {
        guestQuery = `SELECT address->>'name' as name, address->>'email' as email, address->>'phone' as phone, MIN(placed_at) as created_at FROM orders WHERE 'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) = $1 GROUP BY address->>'name', address->>'email', address->>'phone' LIMIT 1`
      }
      const ordersUser = await pool.query(guestQuery, [id])
      if (!ordersUser.rows.length) {
        return res.status(404).json({ error: 'Customer not found', id })
      }
      customer = {
        id,
        name: ordersUser.rows[0].name || 'Guest',
        email: ordersUser.rows[0].email || '',
        phone: ordersUser.rows[0].phone || '',
        status: 'guest',
        created_at: ordersUser.rows[0].created_at
      }
    }

    // Step 2: Get customer orders separately
    let ordersRows = []
    if (isUuid) {
      const ordersRes = await pool.query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC`,
        [id]
      )
      ordersRows = ordersRes.rows
    } else {
      const ordersRes = await pool.query(
        `SELECT * FROM orders WHERE 'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) = $1 ORDER BY placed_at DESC`,
        [id]
      )
      ordersRows = ordersRes.rows
    }

    const orders = await getCustomerOrdersDetailed(ordersRows)
    console.log(`Customer ${id} - ordersRows length: ${ordersRows.length}, processed orders length: ${orders.length}`)

    // Step 3: Get order stats
    let statsQuery
    if (isUuid) {
      statsQuery = `SELECT COUNT(*)::int AS order_count, COALESCE(SUM(total), 0)::numeric AS total_spent, MAX(placed_at) AS last_order_date FROM orders WHERE user_id = $1`
    } else {
      statsQuery = `SELECT COUNT(*)::int AS order_count, COALESCE(SUM(total), 0)::numeric AS total_spent, MAX(placed_at) AS last_order_date FROM orders WHERE 'guest-' || md5(COALESCE(address->>'email', address->>'name', '')) = $1`
    }
    const statsRes = await pool.query(statsQuery, [id])
    const stats = statsRes.rows[0]

    console.log(`Customer ${id} - stats:`, stats)

    res.json({
      customer: {
        ...customer,
        order_count: stats.order_count,
        total_spent: stats.total_spent,
        last_order_date: stats.last_order_date,
      },
      orders,
    })

  } catch (err) {
    console.error('Customer detail error:', err.message, err.stack)
    res.status(500).json({
      error: 'Failed to fetch customer',
      detail: err.message
    })
  }
}))

// Password Reset Flow
router.post('/auth/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' })

  const finalEmail = email.toLowerCase().trim()
  const result = await pool.query('SELECT id, name, email FROM admins WHERE email = $1', [finalEmail])
  const admin = result.rows[0]

  if (!admin) {
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = Date.now() + 15 * 60 * 1000 // 15 minutes

  await pool.query(
    'UPDATE admins SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
    [otp, expiry, admin.id]
  )

  const html = passwordResetCustomer({ customerName: admin.name, otp })
  await sendMail({ to: admin.email, subject: 'Admin Password Reset Verification Code', html })

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' })
}))

router.post('/auth/reset-password', asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  const finalEmail = email.toLowerCase().trim()
  const result = await pool.query('SELECT id, reset_token, reset_token_expiry FROM admins WHERE email = $1', [finalEmail])
  const admin = result.rows[0]

  if (!admin || admin.reset_token !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset code' })
  }

  if (Date.now() > admin.reset_token_expiry) {
    return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await pool.query(
    'UPDATE admins SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
    [passwordHash, admin.id]
  )

  res.json({ success: true, message: 'Password has been reset successfully. You can now login.' })
}))
// ── Thumbnails ──────────────────────────────────────────────────────────────
router.get('/thumbnails', requireAdmin, asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT name, image_url FROM product_thumbnails')
  const thumbnails = {}
  result.rows.forEach(row => {
    thumbnails[row.name] = row.image_url
  })
  res.json({ success: true, thumbnails })
}))

export default router

// ── Bulk Import Endpoints ───────────────────────────────────────────────────

// POST /api/admin/products/bulk-import/template
router.post('/products/bulk-import/template', requireAdmin, (req, res) => {
  const wsData = [
    [
      'Product Name',
      'Local/Regional Name',
      'Category',
      'Tagline',
      'Description',
      'Thumbnail Filename',
      'Photo 1 Filename',
      'Photo 2 Filename',
      'Weight Label',
      'MRP',
      'Online Price',
      'Stock Status'
    ],
    [
      'Premium Anchovy',
      'Nethili',
      'fish',
      'Small Fish, Big Nutrition',
      'Freshly caught anchovies.',
      'anchovy.jpg',
      '',
      '',
      '250g',
      '300',
      '250',
      'in_stock'
    ],
    [
      'Premium Anchovy',
      '',
      'fish',
      '',
      '',
      '',
      '',
      '',
      '500g',
      '600',
      '480',
      'in_stock'
    ]
  ]

  const ws = xlsx.utils.aoa_to_sheet(wsData)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'Template')
  
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
  
  res.setHeader('Content-Disposition', 'attachment; filename="bulk_import_template.xlsx"')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.send(buffer)
})

// POST /api/admin/products/bulk-import
router.post('/products/bulk-import', requireAdmin, upload.any(), async (req, res) => {
  try {
    const excelFile = req.files?.find(f => f.fieldname === 'file')
    const uploadedImages = req.files?.filter(f => f.fieldname === 'images') || []

    if (!excelFile) {
      return res.status(400).json({ success: false, message: 'No Excel file uploaded' })
    }

  // Create a map of originalname -> local URL
  const imageMap = {}
  uploadedImages.forEach(img => {
    imageMap[img.originalname] = `/uploads/${img.filename}`
  })

  // Fetch all categories for validation
  const catResult = await pool.query('SELECT slug FROM categories')
  const validCategories = new Set(catResult.rows.map(r => r.slug))

  let workbook
  try {
    const fileBuffer = fs.readFileSync(excelFile.path)
    workbook = xlsx.read(fileBuffer, { type: 'buffer' })
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid Excel file' })
  }

  const sheetName = workbook.SheetNames[0]
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

  const validProducts = {}
  const errors = []

  // Helper to map image filename to url
  const resolveImage = (val) => {
    const trimmed = String(val || '').trim()
    if (!trimmed) return ''
    return imageMap[trimmed] || trimmed
  }

  // Robust column lookup (ignores case, newlines, extra spaces)
  const getCol = (row, possibleNames) => {
    const key = Object.keys(row).find(k => {
      const normalizedKey = k.toLowerCase().replace(/[\n\r\s]+/g, ' ').trim()
      return possibleNames.some(pn => normalizedKey === pn.toLowerCase())
    })
    return key ? row[key] : undefined
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2 // +1 for 0-index, +1 for header
    const name = String(getCol(row, ['Product Name']) || '').trim()
    if (!name) {
      errors.push(`Row ${rowNum}: Product Name is required`)
      return
    }

    const category = String(getCol(row, ['Category']) || '').trim()
    if (!validProducts[name] && !category) {
      errors.push(`Row ${rowNum}: Category is required for new product "${name}"`)
      return
    }

    if (category && !validCategories.has(category)) {
      errors.push(`Row ${rowNum}: Invalid category "${category}" for product "${name}"`)
      return
    }

    const weightLabel = String(getCol(row, ['Weight Label']) || '').trim()
    const mrp = Number(getCol(row, ['MRP']))
    const onlinePrice = Number(getCol(row, ['Online Price']))

    if (!weightLabel) errors.push(`Row ${rowNum}: Weight Label is required`)
    if (isNaN(mrp) || mrp <= 0) errors.push(`Row ${rowNum}: Valid MRP is required`)
    if (isNaN(onlinePrice) || onlinePrice <= 0) errors.push(`Row ${rowNum}: Valid Online Price is required`)

    const warnings = []
    if (onlinePrice > mrp) {
      warnings.push('Online Price is greater than MRP')
    }

    if (!validProducts[name]) {
      validProducts[name] = {
        name,
        localName: String(getCol(row, ['Local/Regional Name', 'Local Name']) || '').trim(),
        category,
        tagline: String(getCol(row, ['Tagline']) || '').trim(),
        description: String(getCol(row, ['Description']) || '').trim(),
        image: resolveImage(getCol(row, ['Thumbnail URL', 'Thumbnail Filename', 'Thumbnail'])),
        gallery_image_1: resolveImage(getCol(row, ['Photo 1 URL', 'Photo 1 Filename', 'Photo 1'])),
        gallery_image_2: resolveImage(getCol(row, ['Photo 2 URL', 'Photo 2 Filename', 'Photo 2'])),
        stockStatus: String(getCol(row, ['Stock Status']) || '').trim() || 'in_stock',
        weights: [],
        rowErrors: [],
        rowWarnings: []
      }
    }

    if (warnings.length > 0) {
      validProducts[name].rowWarnings.push(`Row ${rowNum}: ${warnings.join(', ')}`)
    }

    if (weightLabel && !isNaN(mrp) && !isNaN(onlinePrice)) {
      validProducts[name].weights.push({
        label: weightLabel,
        value: parseInt(weightLabel) || 0,
        originalPrice: mrp,
        price: onlinePrice
      })
    }
  })

  const previewList = Object.values(validProducts).map(p => {
    if (!p.image && p.weights.length > 0) {
      p.rowErrors.push('Missing Thumbnail URL on first row')
    }
    return p
  })

  previewList.forEach(p => {
    if (p.rowErrors.length > 0) {
      errors.push(`Product "${p.name}": ${p.rowErrors.join(', ')}`)
    }
  })

    res.json({
      success: true,
      preview: {
        valid: previewList,
        errors: errors
      }
    })
  } catch (error) {
    console.error('CRASH IN BULK IMPORT:', error)
    res.status(500).json({ success: false, message: error.message, stack: error.stack })
  }
})

// POST /api/admin/products/bulk-import/confirm
router.post('/products/bulk-import/confirm', requireAdmin, asyncHandler(async (req, res) => {
  const { products } = req.body
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'No products provided' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let createdCount = 0
    let updatedCount = 0

    for (const p of products) {
      const existRes = await client.query('SELECT id FROM products WHERE name = $1', [p.name])
      
      const images = []
      if (p.gallery_image_1) images.push(p.gallery_image_1)
      if (p.gallery_image_2) images.push(p.gallery_image_2)

      if (existRes.rows.length > 0) {
        const id = existRes.rows[0].id
        await client.query(
          `UPDATE products SET 
            category = COALESCE($2, category),
            local_name = COALESCE($3, local_name),
            tagline = COALESCE($4, tagline),
            description = COALESCE($5, description),
            image = COALESCE($6, image),
            images = $7,
            gallery_image_1 = COALESCE($8, gallery_image_1),
            gallery_image_2 = COALESCE($9, gallery_image_2),
            weights = $10,
            variants = $10,
            stock_status = COALESCE($11, stock_status)
           WHERE id = $1`,
          [
            id, p.category || null, p.localName || null, p.tagline || null, p.description || null,
            p.image || null, JSON.stringify(images), p.gallery_image_1 || null, p.gallery_image_2 || null,
            JSON.stringify(p.weights), p.stockStatus || null
          ]
        )
        updatedCount++
      } else {
        const slug = await generateUniqueSlug(p.name)
        await client.query(
          `INSERT INTO products (
            slug, category, name, local_name, tagline, description, image, images, gallery_image_1, gallery_image_2, weights, variants, stock_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            slug, p.category, p.name, p.localName, p.tagline, p.description, p.image,
            JSON.stringify(images), p.gallery_image_1, p.gallery_image_2,
            JSON.stringify(p.weights), JSON.stringify(p.weights), p.stockStatus
          ]
        )
        createdCount++
      }
    }

    await client.query('COMMIT')
    res.json({ success: true, message: `Successfully processed ${products.length} products (${createdCount} created, ${updatedCount} updated).` })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Bulk import error:', err)
    res.status(500).json({ success: false, message: 'Transaction failed. All changes rolled back.', error: err.message })
  } finally {
    client.release()
  }
}))
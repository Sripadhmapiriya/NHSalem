import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import productRoutes from './routes/products.routes.js'
import promotionRoutes from './routes/promotions.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/orders.routes.js'
import paymentRoutes from './routes/payments.routes.js'
import wholesaleRoutes from './routes/wholesale.routes.js'
import recipeRoutes from './routes/recipes.routes.js'
import storeLocatorRoutes from './routes/storeLocator.routes.js'
import faqRoutes from './routes/faqs.routes.js'
import addressRoutes from './routes/addresses.routes.js'

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

// ── Image Copy Script (Runs on startup) ───────────────────────────────────────
function setupImages() {
  const baseDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/images');
  
  const crab = 'C:\\Users\\Windows\\.gemini\\antigravity-ide\\brain\\4b67d565-3752-4f97-9a37-d79a561e502c\\crab_image_1784547103819.png';
  const lobster = 'C:\\Users\\Windows\\.gemini\\antigravity-ide\\brain\\4b67d565-3752-4f97-9a37-d79a561e502c\\lobster_image_1784547121715.png';
  const dry_fish = 'C:\\Users\\Windows\\.gemini\\antigravity-ide\\brain\\4b67d565-3752-4f97-9a37-d79a561e502c\\dry_fish_image_1784547139856.png';

  const targets = [
    { src: dry_fish, dest: 'dry-fish/premium-dried-seerfish-heads.png' },
    { src: dry_fish, dest: 'dry-fish/premium-dried-sardines.jpg' },
    { src: dry_fish, dest: 'dry-fish/traditional-dried-mackerel.png' },
    { src: lobster, dest: 'lobster/premium-sand-lobster.png' },
    { src: lobster, dest: 'lobster/tiger-rock-lobster.png' },
    { src: lobster, dest: 'lobster/spiny-lobster-tails.png' },
    { src: lobster, dest: 'lobster/whole-rock-lobster.png' },
    { src: lobster, dest: 'lobster/bamboo-rock-lobster.png' },
    { src: crab, dest: 'crabs/red-claw-rock-crab.png' },
    { src: crab, dest: 'crabs/soft-shell-mangrove-crab.png' },
    { src: crab, dest: 'crabs/three-spot-crab.png' },
    { src: crab, dest: 'crabs/blue-swimmer-crab.jpg' },
    { src: crab, dest: 'crabs/lagoon-mud-crab.png' }
  ];

  targets.forEach(({ src, dest }) => {
    try {
      const fullDest = path.join(baseDir, dest);
      const destDir = path.dirname(fullDest);
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(src)) fs.copyFileSync(src, fullDest);
    } catch (e) {
      console.error('Failed to copy image', dest, e);
    }
  });
  console.log('✅ Generated images configured');
}
setupImages();

// ── Email config check (non-blocking) ─────────────────────────────────────────
function checkEmailConfig() {
  const required = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS', 'MAIL_FROM', 'SHOP_ADMIN_EMAIL']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.warn('⚠️  Email not fully configured. Missing:', missing.join(', '))
    console.warn('⚠️  Nodemailer will be in simulation mode until env vars are set.')
    return false
  }
  console.log('✅ Email configuration found — Nodemailer ready')
  return true
}
checkEmailConfig()

const app = express()
const PORT = process.env.PORT || 4000

// 1. Basic security and helper middlewares
app.use(helmet())
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.CORS_ORIGIN
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    const isAllowed = allowedOrigins.some(allowed => allowed === origin || allowed === '*') ||
                      origin.endsWith('.vercel.app')
    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(morgan('dev'))
app.use(compression())
app.use(express.json())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// ── Health check & root — must come BEFORE rate limiter and other routes ───────
app.get('/', (req, res) => {
  res.json({
    message: 'NH Salem Sea Foods API is running',
    version: '1.0.0',
    docs: '/api/health'
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'NH Salem Sea Foods API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Rate limiting
app.set('trust proxy', 1) // Required for express-rate-limit behind localtunnel/proxies
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// 2. Mount API Routers under /api
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)         // handles admin auth, dashboard stats, customers list
app.use('/api', productRoutes)             // handles /products and /admin/products
app.use('/api', promotionRoutes)           // handles /promotions and /admin/promotions
app.use('/api/cart', cartRoutes)           // handles /cart
app.use('/api', orderRoutes)               // handles /orders and /admin/orders
app.use('/api/payments', paymentRoutes)    // handles /payments
app.use('/api/payment', paymentRoutes)     // handles /payment
app.use('/api', wholesaleRoutes)           // handles /wholesale and /admin/wholesale
app.use('/api', recipeRoutes)              // handles /recipes and /admin/recipes
app.use('/api', storeLocatorRoutes)        // handles /cities and /admin/cities
app.use('/api/faqs', faqRoutes)            // handles /faqs
app.use('/api/addresses', addressRoutes)   // handles /addresses
app.use('/api/admin/reviews', productRoutes)

// 3. Centralized error handling
app.use(errorHandler)

// ── Startup DB verification (non-crashing) ─────────────────────────────────────
async function verifyDatabase(pool) {
  try {
    await pool.query('SELECT 1')
    console.log('✅ Database connection verified')

    // Safe schema additions — these use IF NOT EXISTS / IF NOT EXISTS so they are idempotent
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'`)

    await pool.query(`
      INSERT INTO categories (id, slug, name)
      VALUES
        ('combos', 'combos', 'Combos'),
        ('dried-fish', 'dried-fish', 'Dried Fish')
      ON CONFLICT (id) DO NOTHING
    `)

    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'
    `)

    // Create cities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        pincode VARCHAR(20),
        status VARCHAR(20) DEFAULT 'live',
        slots JSONB DEFAULT '[]',
        stores INTEGER DEFAULT 0
      )
    `)

    // Fix user_addresses: drop old SERIAL version and recreate with UUID FK matching users table
    // This is safe because we use CREATE TABLE IF NOT EXISTS — only creates if absent
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        label        VARCHAR(50) DEFAULT 'Home',
        name         VARCHAR(100),
        phone        VARCHAR(15),
        pincode      VARCHAR(10),
        line1        TEXT,
        city         VARCHAR(100),
        state        VARCHAR(100),
        is_default   BOOLEAN DEFAULT FALSE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Unique constraints — ignore errors if they already exist
    try {
      await pool.query(`ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)`)
      console.log('Unique constraint added: users_email_unique')
    } catch (_) {
      // Already exists — ignore
    }
    try {
      await pool.query(`ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone)`)
      console.log('Unique constraint added: users_phone_unique')
    } catch (_) {
      // Already exists — ignore
    }

    console.log('✅ Startup DB Verification complete')
  } catch (err) {
    // Log but DO NOT crash the server
    console.error('⚠️  Startup DB Verification warning:', err.message)
  }
}

// ── Global process error handlers — prevent Render from crashing on stray errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Do NOT exit — keep server running
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  // Do NOT exit for non-critical errors
})

app.listen(PORT, async () => {
  console.log(`NH Salem Sea Foods Server is running on port ${PORT}`)
  const poolModule = await import('./db/pool.js')
  const pool = poolModule.default
  await verifyDatabase(pool)

  // Graceful shutdown on SIGTERM (Render sends this before stopping container)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down gracefully')
    try { await pool.end() } catch (_) {}
    process.exit(0)
  })
})

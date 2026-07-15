import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'




import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import productRoutes from './routes/products.routes.js'
import promotionRoutes from './routes/promotions.routes.js'
import subscriptionRoutes from './routes/subscriptions.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/orders.routes.js'
import paymentRoutes from './routes/payments.routes.js'
import wholesaleRoutes from './routes/wholesale.routes.js'
import recipeRoutes from './routes/recipes.routes.js'
import storeLocatorRoutes from './routes/storeLocator.routes.js'
import faqRoutes from './routes/faqs.routes.js'
import newsletterRoutes from './routes/newsletter.routes.js'

dotenv.config()

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' }
})
app.use('/api', limiter)

// 2. Mount API Routers under /api
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes) // handles admin auth, dashboard stats, customers list
app.use('/api', productRoutes) // handles /products and /admin/products
app.use('/api', promotionRoutes) // handles /promotions and /admin/promotions
app.use('/api', subscriptionRoutes) // handles /subscriptions and /admin/subscriptions/plans
app.use('/api/cart', cartRoutes) // handles /cart
app.use('/api', orderRoutes) // handles /orders and /admin/orders
app.use('/api/payments', paymentRoutes) // handles /payments
app.use('/api/payment', paymentRoutes) // handles /payment
app.use('/api', wholesaleRoutes) // handles /wholesale and /admin/wholesale
app.use('/api', recipeRoutes) // handles /recipes and /admin/recipes
app.use('/api', storeLocatorRoutes) // handles /cities and /admin/cities
app.use('/api/faqs', faqRoutes) // handles /faqs
app.use('/api/newsletter', newsletterRoutes) // handles /newsletter
app.use('/api/admin/reviews', productRoutes) // we can mount review admin paths or put them in productRoutes

// 3. Centralized error handling
app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`NH Salem Sea Foods Server is running on port ${PORT}`)
  try {
    const poolModule = await import('./db/pool.js');
    const pool = poolModule.default;
    console.log('Startup DB Verification: Checking variants column and category additions...');
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]';
    `);
    await pool.query(`
      INSERT INTO categories (id, slug, name) 
      VALUES 
        ('combos', 'combos', 'Combos'),
        ('dried-fish', 'dried-fish', 'Dried Fish')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Verify orders table columns
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
    `);

    // Add unique constraints to users table
    try {
      await pool.query(`
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
      `);
      console.log('Unique constraint added: users_email_unique');
    } catch (dbErr) {
      console.log('Unique constraint users_email_unique already exists or could not be added.');
    }

    try {
      await pool.query(`
        ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
      `);
      console.log('Unique constraint added: users_phone_unique');
    } catch (dbErr) {
      console.log('Unique constraint users_phone_unique already exists or could not be added.');
    }

    console.log('Startup DB Verification: Completed.');
  } catch (err) {
    console.error('Startup DB Verification failed:', err.message);
  }
})

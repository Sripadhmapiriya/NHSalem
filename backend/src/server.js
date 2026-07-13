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
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
app.use('/api', wholesaleRoutes) // handles /wholesale and /admin/wholesale
app.use('/api', recipeRoutes) // handles /recipes and /admin/recipes
app.use('/api', storeLocatorRoutes) // handles /cities and /admin/cities
app.use('/api/faqs', faqRoutes) // handles /faqs
app.use('/api/newsletter', newsletterRoutes) // handles /newsletter
app.use('/api/admin/reviews', productRoutes) // we can mount review admin paths or put them in productRoutes

// 3. Centralized error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`NH Salem Sea Foods Server is running on port ${PORT}`)
})

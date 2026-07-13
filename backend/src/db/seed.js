import pg from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Import mock data directly from frontend
import { PRODUCTS } from '../../../frontend/src/mock/products.js'
import { COUPONS } from '../../../frontend/src/mock/coupons.js'
import { SUBSCRIPTION_PLANS } from '../../../frontend/src/mock/subscriptions.js'
import { CITIES } from '../../../frontend/src/mock/cities.js'
import { FAQS } from '../../../frontend/src/mock/faqs.js'
import { RECIPES } from '../../../frontend/src/mock/recipes.js'
import { ADMIN_REVIEWS, ADMIN_WHOLESALE, ADMIN_ORDERS, ADMIN_CUSTOMERS, ADMIN_PROMOTIONS } from '../../../frontend/src/mock/adminData.js'

dotenv.config()

const { Client } = pg

async function runSeed() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL or DATABASE_URL_UNPOOLED must be set')
    process.exit(1)
  }

  console.log('Connecting to database for seeding...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Seeding transaction started...')
    await client.query('BEGIN')

    console.log('Clearing existing data (truncating)...')
    await client.query(
      `TRUNCATE TABLE 
        order_stages, order_items, orders, cart_items, 
        subscriptions, subscription_plans, promotions, 
        reviews, products, categories, admins, users, 
        wholesale_inquiries, recipes, cities, faqs, 
        newsletter_subscribers 
       CASCADE`
    )

    // 1. Seed Admins
    console.log('Seeding admins...')
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    await client.query(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Super Admin', 'admin@nhsalem.com', adminPasswordHash, 'super_admin']
    )

    // 2. Seed Users
    console.log('Seeding users...')
    const userPasswordHash = await bcrypt.hash('password123', 10)
    
    // Seed main test user
    await client.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['NH Salem User', 'user@nhsalem.com', '9876500000', userPasswordHash]
    )

    // Seed mock customers
    for (const c of ADMIN_CUSTOMERS) {
      // Clean phone number format for storage
      const phone = c.phone.replace(/[^0-9]/g, '').slice(-10) // get 10-digit number
      await client.query(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [c.name, c.email, phone || null, userPasswordHash]
      )
    }

    // Get user id mappings for linking reviews/orders
    const usersRes = await client.query('SELECT id, email FROM users')
    const userMap = {}
    usersRes.rows.forEach(u => {
      userMap[u.email] = u.id
    })

    // 3. Seed Categories
    console.log('Seeding categories...')
    const categories = [
      { id: 'fish', slug: 'fish', name: 'Fish' },
      { id: 'prawns-shrimp', slug: 'prawns-shrimp', name: 'Prawns & Shrimp' },
      { id: 'crabs', slug: 'crabs', name: 'Crabs' },
      { id: 'lobster', slug: 'lobster', name: 'Lobster' },
      { id: 'dry-fish', slug: 'dry-fish', name: 'Dry Fish' },
      { id: 'combos', slug: 'combos', name: 'Combos' }
    ]
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, slug, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.slug, cat.name]
      )
    }

    // 4. Seed Products
    console.log('Seeding products...')
    for (const p of PRODUCTS) {
      const categoryId = p.category.toLowerCase()
      // Ensure category exists
      await client.query(
        `INSERT INTO categories (id, slug, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [categoryId, categoryId, categoryId.charAt(0).toUpperCase() + categoryId.slice(1)]
      )

      await client.query(
        `INSERT INTO products (
          slug, category, name, tagline, description, how_to_cook, image, images, badges, weights, base_price, rating, review_count, is_bestseller, catch_time, freshness_score, nutrition, unit, stock_qty, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (slug) DO NOTHING`,
        [
          p.slug,
          categoryId,
          p.name,
          p.tagline || null,
          p.description || null,
          p.howToCook || null,
          p.image || null,
          JSON.stringify(p.images || []),
          JSON.stringify(p.badges || []),
          JSON.stringify(p.weights || []),
          p.basePrice || 0,
          p.rating || 0,
          p.reviewCount || 0,
          p.isBestSeller || false,
          p.catchTime || null,
          p.freshnessScore || 90,
          JSON.stringify(p.nutritionPer100g || {}),
          p.unit || null,
          p.stock_qty ?? 100,
          p.is_active ?? true
        ]
      )
    }

    // Get product UUID mappings
    const productsRes = await client.query('SELECT id, slug FROM products')
    const productMap = {}
    productsRes.rows.forEach(p => {
      productMap[p.slug] = p.id
    })

    // 5. Seed Promotions (Coupons)
    console.log('Seeding promotions...')
    // Merge COUPONS (public object) and ADMIN_PROMOTIONS (extended array)
    const processedCodes = new Set()
    for (const p of ADMIN_PROMOTIONS) {
      processedCodes.add(p.code.toUpperCase())
      await client.query(
        `INSERT INTO promotions (code, type, discount_value, min_order, description, status, expires_at, usage_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO NOTHING`,
        [
          p.code.toUpperCase(),
          p.type,
          p.value,
          p.minOrder || 0,
          p.description || null,
          p.status || 'active',
          p.expiresAt || null,
          p.limit || null
        ]
      )
    }

    // Add any remaining COUPONS not in ADMIN_PROMOTIONS
    for (const [code, details] of Object.entries(COUPONS)) {
      const codeUpper = code.toUpperCase()
      if (!processedCodes.has(codeUpper)) {
        await client.query(
          `INSERT INTO promotions (code, type, discount_value, min_order, description, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (code) DO NOTHING`,
          [
            codeUpper,
            details.type,
            details.discount,
            details.minOrder || 0,
            details.description || null,
            'active'
          ]
        )
      }
    }

    // 6. Seed Subscription Plans
    console.log('Seeding subscription plans...')
    for (const plan of SUBSCRIPTION_PLANS) {
      await client.query(
        `INSERT INTO subscription_plans (slug, name, tagline, price, period, savings, highlights, color, badge, is_popular, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (slug) DO NOTHING`,
        [
          plan.id,
          plan.name,
          plan.tagline || null,
          plan.price,
          plan.period || 'week',
          plan.savings || null,
          JSON.stringify(plan.highlights || []),
          plan.color || null,
          plan.badge || null,
          plan.isPopular || false,
          plan.status || 'active'
        ]
      )
    }

    // Get subscription plan UUID mappings
    const plansRes = await client.query('SELECT id, slug FROM subscription_plans')
    const planMap = {}
    plansRes.rows.forEach(p => {
      planMap[p.slug] = p.id
    })

    // 7. Seed Cities
    console.log('Seeding cities...')
    for (const city of CITIES) {
      await client.query(
        `INSERT INTO cities (id, name, pincode, status, slots, stores)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          city.id,
          city.name,
          city.pincode || null,
          city.status || 'live',
          JSON.stringify(city.slots || []),
          city.stores || 0
        ]
      )
    }

    // 8. Seed FAQs
    console.log('Seeding FAQs...')
    for (const faq of FAQS) {
      await client.query(
        `INSERT INTO faqs (id, title, content, category)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [faq.id, faq.title, faq.content, faq.category || 'general']
      )
    }

    // 9. Seed Recipes
    console.log('Seeding recipes...')
    for (const r of RECIPES) {
      await client.query(
        `INSERT INTO recipes (id, slug, title, category, tags, time, servings, difficulty, image, description, ingredients, steps, chef_tip, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [
          r.id,
          r.slug,
          r.title,
          r.category || null,
          JSON.stringify(r.tags || []),
          r.time || null,
          r.servings || null,
          r.difficulty || null,
          r.image || null,
          r.description || null,
          JSON.stringify(r.ingredients || []),
          JSON.stringify(r.steps || []),
          r.chefTip || null,
          'published'
        ]
      )
    }

    // 10. Seed Reviews
    console.log('Seeding reviews...')
    for (const rv of ADMIN_REVIEWS) {
      // Find matching product UUID
      // Some mock products might have different names, let's find by name or match slugs
      // Let's do a basic mapping
      let productUuid = null
      if (rv.product === 'Jumbo Tiger Prawns') {
        productUuid = productMap['jumbo-tiger-prawns']
      } else if (rv.product === 'Premium Atlantic Salmon') {
        productUuid = productMap['premium-atlantic-salmon']
      } else if (rv.product === 'Blue Swimmer Crab') {
        productUuid = productMap['blue-swimmer-crab']
      } else if (rv.product === 'Silver Pomfret') {
        productUuid = productMap['silver-pomfret']
      } else if (rv.product === 'Premium Seer Fish (Vanjaram)') {
        productUuid = productMap['seer-fish-vanjaram']
      } else {
        // fall back to first product or skip
        productUuid = Object.values(productMap)[0]
      }

      const userUuid = userMap[rv.author === 'Anjali Sharma' ? 'anjali@example.com' : rv.author === 'Karthik Rajan' ? 'karthik@example.com' : 'user@nhsalem.com']

      if (productUuid) {
        await client.query(
          `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            productUuid,
            userUuid || null,
            rv.author,
            rv.rating,
            rv.title,
            rv.body,
            rv.status === 'published' ? 'approved' : rv.status === 'flagged' ? 'rejected' : 'pending',
            rv.date ? new Date(rv.date) : new Date()
          ]
        )
      }
    }

    // 11. Seed Wholesale Inquiries
    console.log('Seeding wholesale inquiries...')
    for (const w of ADMIN_WHOLESALE) {
      await client.query(
        `INSERT INTO wholesale_inquiries (business_name, contact_name, email, phone, industry, qty, specifications, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          w.businessName,
          w.contact,
          w.email,
          w.phone || '9876543210',
          w.industry,
          w.qty || null,
          w.notes || null,
          w.status || 'new',
          w.enquiryDate ? new Date(w.enquiryDate) : new Date()
        ]
      )
    }

    // 12. Seed Orders & Stages
    console.log('Seeding orders...')
    for (const o of ADMIN_ORDERS) {
      const userUuid = userMap[o.customer.email]
      const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Insert Order
      const res = await client.query(
        `INSERT INTO orders (
          order_number, user_id, status, address, delivery_slot, payment_method, payment_status, subtotal, discount, shipping, total, freshness_score, catch_time, placed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [
          o.id,
          userUuid || null,
          o.status,
          JSON.stringify({
            name: o.customer.name,
            phone: o.customer.phone,
            email: o.customer.email,
            flat: '123, Sea Breeze Villa',
            street: 'Marina Road',
            pincode: o.city === 'Bangalore' ? '560001' : '600001',
            city: o.city
          }),
          '7–9 AM',
          o.paymentMethod === 'UPI' ? 'razorpay' : 'cod',
          o.paymentStatus === 'paid' ? 'paid' : 'pending',
          o.total, // subtotal
          0, // discount
          0, // shipping
          o.total,
          95,
          '2h ago',
          o.placedAt ? new Date(o.placedAt) : new Date()
        ]
      )

      const dbOrderId = res.rows[0].id

      // Seed order stages
      const stages = [
        { key: 'confirmed', label: 'Confirmed', icon: 'check_circle', completed: true },
        { key: 'packed', label: 'Packed on Ice', icon: 'ac_unit', completed: o.status !== 'confirmed' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'local_shipping', completed: o.status === 'out_for_delivery' || o.status === 'delivered' },
        { key: 'delivered', label: 'Delivered', icon: 'home', completed: o.status === 'delivered' }
      ]

      for (const st of stages) {
        await client.query(
          `INSERT INTO order_stages (order_id, stage_key, label, icon, completed_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            dbOrderId,
            st.key,
            st.label,
            st.icon,
            st.completed ? new Date() : null
          ]
        )
      }

      // Seed a dummy order item
      // Get first product
      const productUuid = Object.values(productMap)[0]
      const productName = Object.keys(productMap)[0]
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, weight, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          dbOrderId,
          productUuid,
          productName,
          '1kg',
          o.total / o.items,
          o.items
        ]
      )
    }

    await client.query('COMMIT')
    console.log('Database successfully seeded!')
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch (e) {
      // Ignore rollback failure if transaction didn't start
    }
    console.error('Seeding transaction failed, rolled back.', err)
    process.exit(1)
  } finally {
    try {
      await client.end()
    } catch (e) {}
  }
}

runSeed()

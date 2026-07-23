-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,

  category VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  local_name VARCHAR(255),
  tagline VARCHAR(255),
  description TEXT,
  how_to_cook TEXT,
  image VARCHAR(255),
  images JSONB NOT NULL DEFAULT '[]',
  badges JSONB NOT NULL DEFAULT '[]',
  weights JSONB NOT NULL DEFAULT '[]',
  base_price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  catch_time VARCHAR(100),
  freshness_score INT NOT NULL DEFAULT 90,
  nutrition JSONB DEFAULT '{}',
  unit VARCHAR(50),
  stock_qty INT NOT NULL DEFAULT 100,
  stock_status VARCHAR(50) NOT NULL DEFAULT 'in_stock',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'flat' | 'percent'
  discount_value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  start_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  applicable_product_ids JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' | 'inactive' | 'expired' | 'paused' | 'scheduled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 8. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id, weight)
);

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for Guest Checkout
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  address JSONB NOT NULL,
  delivery_slot VARCHAR(100) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'razorpay' | 'cod'
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code VARCHAR(100),
  freshness_score INT NOT NULL DEFAULT 95,
  catch_time VARCHAR(100) DEFAULT '2h ago',
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_delivery TIMESTAMPTZ
);

-- 10. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  weight VARCHAR(100) NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL
);

-- 11. Order Stages Table
CREATE TABLE IF NOT EXISTS order_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage_key VARCHAR(100) NOT NULL, -- 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered'
  label VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(order_id, stage_key)
);

-- 12. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'approved', -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Wholesale Inquiries Table
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  qty VARCHAR(255),
  specifications TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new' | 'contacted' | 'negotiating' | 'converted' | 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  tags JSONB NOT NULL DEFAULT '[]',
  time VARCHAR(100),
  servings INT,
  difficulty VARCHAR(50),
  image VARCHAR(255),
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  chef_tip TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'published', -- 'published' | 'draft'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pincode VARCHAR(50) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'live', -- 'live' | 'coming_soon'
  slots JSONB NOT NULL DEFAULT '[]',
  stores INT NOT NULL DEFAULT 0
);

-- 16. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100)
);


-- 18. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. City Launch Notifications Table
CREATE TABLE IF NOT EXISTS city_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  city_id VARCHAR(100) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, city_id)
);


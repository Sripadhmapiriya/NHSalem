import { pool } from '../src/db/pool.js';

async function main() {
  try {
    console.log('Altering products table...');
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS how_to_cook TEXT,
      ADD COLUMN IF NOT EXISTS catch_time VARCHAR(100),
      ADD COLUMN IF NOT EXISTS variants JSONB,
      ADD COLUMN IF NOT EXISTS gallery_image_1 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS gallery_image_2 VARCHAR(255);
    `);

    console.log('Altering categories table...');
    await pool.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS category_thumbnail VARCHAR(255);
    `);

    console.log('Altering orders table...');
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50);
    `);

    console.log('Creating whatsapp_messages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_phone VARCHAR(50) NOT NULL,
        message_text TEXT,
        direction VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'delivered',
        timestamp VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Altering reviews table...');
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS admin_reply TEXT,
      ADD COLUMN IF NOT EXISTS reply_at TIMESTAMPTZ;
    `);

    console.log('Schema update complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();

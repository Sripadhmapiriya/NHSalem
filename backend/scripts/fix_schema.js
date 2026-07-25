import { pool } from '../src/db/pool.js';

async function main() {
  try {
    console.log('Altering products table...');
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS how_to_cook TEXT,
      ADD COLUMN IF NOT EXISTS catch_time VARCHAR(100);
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

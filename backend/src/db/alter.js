import pg from 'pg'
import dotenv from 'dotenv'

import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })
const { Client } = pg

async function alter() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS local_name VARCHAR(255);`)
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'in_stock';`)
    // Fix: Add missing status column to users table (was causing admin Customers page to crash)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active';`)
    console.log('Altered tables successfully')
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}
alter()

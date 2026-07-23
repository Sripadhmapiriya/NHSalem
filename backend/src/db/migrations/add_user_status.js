import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../../.env') })

const { Client } = pg

async function migrate() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Add status column to users table if missing
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'active'
    `)
    console.log('✅ users.status column added (or already exists)')

    // Backfill any existing rows
    await client.query(`UPDATE users SET status = 'active' WHERE status IS NULL`)
    console.log('✅ Backfilled existing users with status = active')

  } catch (err) {
    console.error('Migration error:', err.message)
  } finally {
    await client.end()
    console.log('Done.')
  }
}

migrate()

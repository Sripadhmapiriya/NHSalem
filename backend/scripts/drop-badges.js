import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })
const { Client } = pg

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to database.')
    await client.query('ALTER TABLE products DROP COLUMN IF EXISTS badges;')
    console.log('Dropped badges column successfully.')
  } catch (err) {
    console.error('Failed to drop column:', err)
  } finally {
    await client.end()
  }
}

run()

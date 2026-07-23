import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../../.env') })
const { Client } = pg

async function truncateReviews() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is missing.')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to DB. Truncating reviews table...')

    await client.query('TRUNCATE TABLE reviews CASCADE;')

    console.log('Successfully wiped all artificial reviews from database!')
  } catch (err) {
    console.error('Truncate failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

truncateReviews()

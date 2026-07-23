import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../../.env') })
const { Client } = pg

async function dropTables() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL_UNPOOLED or DATABASE_URL environment variable is missing.')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL database. Dropping subscription and newsletter tables...')

    await client.query(`
      DROP TABLE IF EXISTS subscriptions CASCADE;
      DROP TABLE IF EXISTS subscription_plans CASCADE;
      DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
    `)

    console.log('Successfully dropped subscriptions, subscription_plans, and newsletter_subscribers tables!')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

dropTables()

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Client } = pg

async function runMigration() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set')
    process.exit(1)
  }

  console.log('Connecting to Neon database for migration...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    const sqlPath = path.join(__dirname, 'schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('Running schema.sql migration...')
    await client.query(sql)
    console.log('Migration completed successfully!')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()

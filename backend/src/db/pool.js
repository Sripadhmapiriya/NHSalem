import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set in environment!')
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString ? {
    rejectUnauthorized: false
  } : false
})

export default pool

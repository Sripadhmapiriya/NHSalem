import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

let connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('⚠️  WARNING: DATABASE_URL is not set in environment!')
}

// Neon requires sslmode=verify-full to avoid the SSL alias security warning.
// If the URL doesn't already specify sslmode, append it.
if (connectionString && !connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?'
  connectionString = `${connectionString}${separator}sslmode=verify-full`
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
})

export default pool

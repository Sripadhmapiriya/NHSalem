import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
})

async function cleanup() {
  console.log('Connecting to database for cleanup...')
  try {
    const keepEmails = ['admin@nhsalem.com', 'user@nhsalem.com', 'carenhsalem@gmail.com']
    
    // Check total users
    const beforeCount = await pool.query('SELECT COUNT(*) FROM users')
    console.log(`Total users before cleanup: ${beforeCount.rows[0].count}`)

    const res = await pool.query(
      'DELETE FROM users WHERE email NOT IN ($1, $2, $3) AND NOT email ILIKE $4 RETURNING id, email',
      ['admin@nhsalem.com', 'user@nhsalem.com', 'carenhsalem@gmail.com', '%admin%']
    )
    
    console.log(`Successfully deleted ${res.rowCount} users.`)
    console.log('Deleted emails:', res.rows.map(r => r.email).join(', '))

    const afterCount = await pool.query('SELECT COUNT(*) FROM users')
    console.log(`Total users after cleanup: ${afterCount.rows[0].count}`)

  } catch (err) {
    console.error('Error during cleanup:', err)
  } finally {
    await pool.end()
    console.log('Cleanup complete.')
  }
}

cleanup()

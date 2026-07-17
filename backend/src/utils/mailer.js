import nodemailer from 'nodemailer'
import pool from '../db/pool.js'
import { productOfferUpdate } from './emailTemplates.js'
import dotenv from 'dotenv'

dotenv.config()

const MAIL_HOST = process.env.MAIL_HOST
const MAIL_PORT = process.env.MAIL_PORT
const MAIL_USER = process.env.MAIL_USER
const MAIL_PASS = process.env.MAIL_PASS
const MAIL_FROM = process.env.MAIL_FROM

// ── Check if email is properly configured ─────────────────────────────────────
export const isConfigured = !!(MAIL_HOST && MAIL_USER && MAIL_PASS)

let transporter = null
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parseInt(MAIL_PORT || '587'),
    secure: MAIL_PORT === '465',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  // Verify connection on startup — non-blocking
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email server connection failed:', error.message)
    } else {
      console.log('✅ Email server connected and ready')
    }
  })
} else {
  console.warn('⚠️  Nodemailer: SMTP credentials missing (MAIL_USER or MAIL_PASS). Email sending will be simulated.')
}

// ── sendMail — never throws, never blocks the caller ──────────────────────────
export async function sendMail({ to, subject, html }) {
  if (!isConfigured || !transporter) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`)
    return { skipped: true, message: 'SMTP transporter not configured' }
  }
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM || '"NH Salem Sea Foods" <noreply@nhsalem.com>',
      to,
      subject,
      html
    })
    console.log(`✅ Email sent to ${to}: ${subject} (MessageID: ${info.messageId})`)
    return { success: true, info }
  } catch (error) {
    // Log the error but DO NOT throw — email failures must never break orders/registrations
    console.error(`❌ Email failed to ${to}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// ── broadcastToSubscribers — used by admin promotion broadcasts ───────────────
export async function broadcastToSubscribers({ updateType, subject, content }) {
  try {
    // 1. Fetch newsletter subscribers
    const res1 = await pool.query('SELECT email FROM newsletter_subscribers')
    const subs = res1.rows.map(r => r.email.toLowerCase().trim())

    // 2. Fetch users who placed at least one order
    const res2 = await pool.query(`
      SELECT DISTINCT LOWER(TRIM(u.email)) as email
      FROM users u
      JOIN orders o ON u.id = o.user_id
    `)
    const customers = res2.rows.map(r => r.email)

    // 3. Merge lists, remove duplicates, filter out mock domains
    const allEmails = Array.from(new Set([...subs, ...customers]))
      .filter(email => email && !email.endsWith('@example.com') && !email.endsWith('@nhsalem.com'))

    console.log(`Starting broadcast of type ${updateType} to ${allEmails.length} recipients...`)

    let sentCount = 0
    for (const email of allEmails) {
      const unsubscribeUrl = `${process.env.VITE_API_URL || 'https://nhsalem-backend.onrender.com'}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
      const html = productOfferUpdate({ updateType, subject, content, unsubscribeUrl })

      // Fire-and-forget per recipient so one failure doesn't stop the rest
      const res = await sendMail({ to: email, subject, html })
      if (res.success) sentCount++
    }

    console.log(`Broadcast completed. Sent to ${sentCount}/${allEmails.length} recipients.`)
    return { sent: sentCount, total: allEmails.length }
  } catch (error) {
    console.error('Error during broadcastToSubscribers:', error)
    return { sent: 0, total: 0, error }
  }
}

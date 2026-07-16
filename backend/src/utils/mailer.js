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

let transporter = null
if (MAIL_USER && MAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(MAIL_PORT || '587'),
    secure: MAIL_PORT === '465',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
  })
} else {
  console.warn('Nodemailer: SMTP credentials missing (MAIL_USER or MAIL_PASS). Email sending will be simulated.')
}

export async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject} | (transporter config missing)`)
    return { success: false, message: 'SMTP transporter not configured' }
  }
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM || '"NH Salem Sea Foods" <sripadhmapiriya12@gmail.com>',
      to,
      subject,
      html
    })
    console.log(`[Email Sent] MessageID: ${info.messageId} | To: ${to} | Subject: ${subject}`)
    return { success: true, info }
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${to}:`, error)
    return { success: false, error }
  }
}

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

    // 3. Merge lists, remove duplicates, and filter out mock domains to prevent bounce-backs
    const allEmails = Array.from(new Set([...subs, ...customers]))
      .filter(email => email && !email.endsWith('@example.com') && !email.endsWith('@nhsalem.com'))
    
    console.log(`Starting broadcast of type ${updateType} to ${allEmails.length} recipients...`)
    
    let sentCount = 0
    for (const email of allEmails) {
      // Build unsubscribe link
      const unsubscribeUrl = `${process.env.VITE_API_URL || 'https://nhsalem-backend.onrender.com'}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
      
      // Generate email HTML
      const html = productOfferUpdate({
        updateType,
        subject,
        content,
        unsubscribeUrl
      })

      // Send mail (wrapped in try/catch to not block other recipients on failure)
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

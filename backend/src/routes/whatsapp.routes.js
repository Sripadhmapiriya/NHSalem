import express from 'express';
import { pool } from '../db/pool.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import axios from 'axios';

const router = express.Router();

// Webhook Verification (Meta calls this once when registering the webhook)
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Webhook for receiving actual messages
router.post('/', async (req, res) => {
  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message) {
      const customerPhone = message.from;
      const messageText = message.text?.body;
      const timestamp = message.timestamp;

      if (customerPhone && messageText) {
        await pool.query(
          `INSERT INTO whatsapp_messages (customer_phone, message_text, direction, timestamp)
           VALUES ($1, $2, 'inbound', $3)`,
          [customerPhone, messageText, timestamp]
        );
      }
    }
    // Must respond 200 quickly to acknowledge receipt
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.sendStatus(500);
  }
});

// Admin: Get all conversations
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT customer_phone, message_text, direction, status, timestamp, created_at 
       FROM whatsapp_messages 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Send a message
router.post('/messages', requireAdmin, async (req, res) => {
  const { toPhone, text } = req.body;
  if (!toPhone || !text) {
    return res.status(400).json({ error: 'toPhone and text are required' });
  }

  try {
    // Call Meta Cloud API
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: text },
      },
      { 
        headers: { 
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` 
        } 
      }
    );

    // Save to DB
    const { rows } = await pool.query(
      `INSERT INTO whatsapp_messages (customer_phone, message_text, direction)
       VALUES ($1, $2, 'outbound') RETURNING *`,
      [toPhone, text]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;

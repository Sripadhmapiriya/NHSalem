import express from 'express';
import { pool } from '../db/pool.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category thumbnail (Admin only)
router.patch('/:id/thumbnail', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category_thumbnail } = req.body;

    const { rows } = await pool.query(
      `UPDATE categories 
       SET category_thumbnail = $1 
       WHERE id = $2 
       RETURNING *`,
      [category_thumbnail, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category thumbnail:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

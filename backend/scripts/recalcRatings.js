import { pool } from '../src/db/pool.js';

async function main() {
  try {
    console.log('Recalculating ratings for all products...');
    await pool.query(`
      UPDATE products p SET
        rating = (
          SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.status = 'published'
        ),
        review_count = (
          SELECT COUNT(*) FROM reviews r 
          WHERE r.product_id = p.id AND r.status = 'published'
        )
    `);

    console.log('Ratings recalculation complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();

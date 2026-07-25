import pool from './src/db/pool.js';
async function test() {
  try {
    const res = await pool.query('SELECT * FROM products LIMIT 1');
    if (res.rows.length > 0) {
      console.log('Columns in products table:');
      console.log(Object.keys(res.rows[0]));
    } else {
      console.log('No products found, checking columns another way');
      const res2 = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `);
      console.log(res2.rows.map(r => r.column_name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();

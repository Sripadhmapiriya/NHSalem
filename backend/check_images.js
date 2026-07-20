import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const { rows } = await pool.query('SELECT slug, images FROM products');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
})();

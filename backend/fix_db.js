import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const { rows } = await pool.query('SELECT * FROM products');

  for (const p of rows) {
    let changed = false;
    
    let weights = p.weights;
    if (weights) {
      if (typeof weights === 'string') weights = JSON.parse(weights);
      weights.forEach(w => {
        if (w.label) {
          const newLabel = w.label.replace(/(\d+)\s*g/gi, '$1 g');
          if (w.label !== newLabel) {
            w.label = newLabel;
            changed = true;
          }
        }
      });
    }

    let tagline = p.tagline;
    if (tagline) {
      tagline = tagline.replace(/^["“”]+|["“”]+$/g, '');
      if (tagline.toLowerCase() === 'authentic kerala') {
        tagline = 'Authentic Kerala';
      }
      if (p.tagline !== tagline) {
        changed = true;
      }
    }

    let name = p.name;
    let image = p.image;
    let images = p.images;
    if (typeof images === 'string') images = JSON.parse(images);

    if (name) {
      if (name === "NH Salem's special sardine" || name.toLowerCase() === "nh salem's special sardine") {
        name = "NH Salem's Special Sardine";
        changed = true;
      }

      if (name === "Indian Spiny Loach" || name.toLowerCase().includes("spiny loach")) {
        image = 'http://localhost:4000/uploads/spiny_loach.png';
        if (images && images.length > 0) {
          images[0] = image;
        }
        changed = true;
      }
    }

    let badges = p.badges;
    if (badges) {
      if (typeof badges === 'string') badges = JSON.parse(badges);
      const newBadges = badges.filter(b => !b.label.includes('% OFF') && !b.label.includes('% off'));
      if (newBadges.length !== badges.length) {
        badges = newBadges;
        changed = true;
      }
    }

    if (changed) {
      await pool.query(`
        UPDATE products 
        SET weights = $1, tagline = $2, name = $3, badges = $4, image = $5, images = $6
        WHERE id = $7
      `, [JSON.stringify(weights), tagline, name, JSON.stringify(badges), image, JSON.stringify(images), p.id]);
      console.log('Updated:', name);
    }
  }

  console.log('Done');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

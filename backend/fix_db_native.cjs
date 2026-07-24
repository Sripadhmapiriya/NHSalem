const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('nhsalem');
    const products = db.collection('products');
    
    const cursor = products.find({});
    while (await cursor.hasNext()) {
      const p = await cursor.next();
      let changed = false;
      
      // 1. Weight label formatting ("250g" -> "250 g")
      if (p.weights) {
        p.weights.forEach(w => {
          if (w.label) {
            const newLabel = w.label.replace(/(\d+)\s*g/gi, '$1 g');
            if (w.label !== newLabel) {
              w.label = newLabel;
              changed = true;
            }
          }
        });
      }

      // 2 & 3. Tagline quote formatting and capitalization
      if (p.tagline) {
        let newTagline = p.tagline.replace(/^["“”]+|["“”]+$/g, ''); // remove double quotes
        if (newTagline.toLowerCase() === 'authentic kerala') {
          newTagline = 'Authentic Kerala';
        }
        if (p.tagline !== newTagline) {
          p.tagline = newTagline;
          changed = true;
        }
      }

      // 4. Title capitalization and image
      if (p.name) {
        let newName = p.name;
        if (newName === "NH Salem's special sardine" || newName.toLowerCase() === "nh salem's special sardine") {
          newName = "NH Salem's Special Sardine";
        }
        if (p.name !== newName) {
          p.name = newName;
          changed = true;
        }

        if (newName === "Indian Spiny Loach" || newName.toLowerCase().includes("spiny loach")) {
          p.image = 'http://localhost:4000/uploads/spiny_loach.png';
          if (p.images && p.images.length > 0) {
            p.images[0] = p.image;
          }
          changed = true;
        }
      }

      // Remove hardcoded discount badges
      if (p.badges) {
        const newBadges = p.badges.filter(b => !b.label.includes('% OFF') && !b.label.includes('% off'));
        if (newBadges.length !== p.badges.length) {
          p.badges = newBadges;
          changed = true;
        }
      }

      if (changed) {
        await products.updateOne({ _id: p._id }, { $set: {
          weights: p.weights,
          tagline: p.tagline,
          name: p.name,
          badges: p.badges,
          image: p.image,
          images: p.images
        }});
        console.log('Updated:', p.name);
      }
    }

  } finally {
    await client.close();
  }
}

main().catch(console.error);

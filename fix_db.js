const mongoose = require('./backend/node_modules/mongoose');
mongoose.connect('mongodb://localhost:27017/nhsalem').then(async () => {
  const products = await mongoose.connection.collection('products').find({}).toArray();
  
  for (const p of products) {
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
      let newTagline = p.tagline.replace(/^"+|"+$/g, ''); // remove double quotes
      if (newTagline.toLowerCase() === 'authentic kerala') {
        newTagline = 'Authentic Kerala';
      }
      if (p.tagline !== newTagline) {
        p.tagline = newTagline;
        changed = true;
      }
    }

    // 4. Title capitalization
    if (p.name) {
      let newName = p.name;
      if (newName === "NH Salem's special sardine") {
        newName = "NH Salem's Special Sardine";
      }
      if (p.name !== newName) {
        p.name = newName;
        changed = true;
      }
    }

    // Remove hardcoded discount badges
    if (p.badges) {
      const newBadges = p.badges.filter(b => !b.label.includes('% OFF'));
      if (newBadges.length !== p.badges.length) {
        p.badges = newBadges;
        changed = true;
      }
    }

    if (changed) {
      await mongoose.connection.collection('products').updateOne({ _id: p._id }, { $set: {
        weights: p.weights,
        tagline: p.tagline,
        name: p.name,
        badges: p.badges
      }});
      console.log('Updated:', p.name);
    }
  }

  console.log('Done');
  process.exit(0);
});

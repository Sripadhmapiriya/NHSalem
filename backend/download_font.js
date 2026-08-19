const https = require('https');
const fs = require('fs');
const path = require('path');

const cssUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  }
};

https.get(cssUrl, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find the URL for woff2
    const match = data.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (match && match[1]) {
      const woff2Url = match[1];
      console.log('Found WOFF2 URL:', woff2Url);
      
      const dir = path.join(__dirname, '..', 'frontend', 'public', 'fonts');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const dest = path.join(dir, 'material-symbols-outlined.woff2');
      const file = fs.createWriteStream(dest);
      
      https.get(woff2Url, (res2) => {
        res2.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Downloaded successfully to', dest);
          
          // Save the full CSS snippet to a text file for reference
          fs.writeFileSync(path.join(__dirname, 'font_css.txt'), data);
        });
      });
    } else {
      console.error('No WOFF2 URL found in CSS');
      console.log(data);
    }
  });
}).on('error', err => console.error(err));

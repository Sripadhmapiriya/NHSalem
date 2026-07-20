const https = require('https');
https.get('https://d72eb27025ca0a.lhr.life/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`DATA: ${data.substring(0, 200)}`);
    process.exit(0);
  });
}).on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});

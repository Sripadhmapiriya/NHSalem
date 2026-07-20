const http = require('http');
http.get('http://127.0.0.1:4000/api/products', (res) => {
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

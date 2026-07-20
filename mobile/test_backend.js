const http = require('http');
http.get('http://127.0.0.1:4000', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  process.exit(0);
}).on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});

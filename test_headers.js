const http = require('http');

http.get('http://localhost:4000/uploads/c4cb17b851c5b04c61a1e2cb2198a192', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  console.log('CORP Header:', res.headers['cross-origin-resource-policy']);
  console.log('Content-Type:', res.headers['content-type']);
}).on('error', (e) => {
  console.error(e);
});

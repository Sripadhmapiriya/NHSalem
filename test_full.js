const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  form.append('image', fs.createReadStream('package.json'));

  const req = http.request('http://localhost:4000/api/admin/upload', {
    method: 'POST',
    headers: { ...form.getHeaders(), 'Authorization': 'Bearer test' }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Upload Response:', data);
      const url = JSON.parse(data).url;
      console.log('Fetching URL:', url);
      
      http.get(url, (imgRes) => {
        console.log('Status Code:', imgRes.statusCode);
        console.log('CORP Header:', imgRes.headers['cross-origin-resource-policy']);
      });
    });
  });

  form.pipe(req);
}
test();

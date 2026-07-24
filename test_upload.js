const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function run() {
  const form = new FormData();
  form.append('image', fs.createReadStream(path.join(__dirname, 'backend', 'package.json')));
  
  const loginRes = await fetch('http://localhost:4000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nhsalem.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }

  const res = await fetch('http://localhost:4000/api/admin/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: form,
    duplex: 'half' // Required for node native fetch with streams
  });

  const text = await res.text();
  console.log('Upload Status:', res.status);
  console.log('Upload Response:', text);
}
run();

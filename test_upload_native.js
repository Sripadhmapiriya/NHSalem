const fs = require('fs');
const path = require('path');
const { Blob } = require('buffer');

async function run() {
  const fileData = fs.readFileSync(path.join(__dirname, 'backend', 'package.json'));
  const blob = new Blob([fileData], { type: 'application/json' });
  
  const form = new FormData();
  form.append('image', blob, 'package.json');
  
  const loginRes = await fetch('http://localhost:4000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nhsalem.com', password: 'admin123' })
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
  });

  const text = await res.text();
  console.log('Upload Status:', res.status);
  console.log('Upload Response:', text);
}
run().catch(console.error);

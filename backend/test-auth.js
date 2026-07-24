import fetch from 'node-fetch';

async function test() {
  // Try logging in
  console.log("Logging in...");
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sripadhmapiriya12@gmail.com', password: 'password123' })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed!", await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Got token:", token);
  
  // Verify
  console.log("Verifying token...");
  const verifyRes = await fetch('http://localhost:4000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log("Verify status:", verifyRes.status);
  console.log("Verify body:", await verifyRes.text());
}

test();

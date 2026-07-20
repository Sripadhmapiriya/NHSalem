const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://little-knives-train.loca.lt/api/auth/login', {
      email: 'user@nhsalem.com',
      password: 'password123'
    }, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    });
    console.log('Customer Login Success:', res.data);
  } catch (e) {
    console.error('Customer Login Error:', e.response?.data || e.message);
  }

  try {
    const res = await axios.post('https://little-knives-train.loca.lt/api/admin/auth/login', {
      email: 'admin@nhsalem.com',
      password: 'admin123'
    }, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    });
    console.log('Admin Login Success:', res.data);
  } catch (e) {
    console.error('Admin Login Error:', e.response?.data || e.message);
  }
}
test();

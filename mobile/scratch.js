const fs = require('fs');
const { networkInterfaces } = require('os');
const path = require('path');

const nets = networkInterfaces();
let ipAddress = '127.0.0.1';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      ipAddress = net.address;
      break;
    }
  }
}

const envContent = `EXPO_PUBLIC_API_URL=http://${ipAddress}:4000\n`;
fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('Successfully created .env with IP: ' + ipAddress);

const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

(async () => {
  const randomId = Math.floor(Math.random() * 100000);
  const tunnel = await localtunnel({ port: 4000, local_host: '127.0.0.1', subdomain: `nhsalem-dev-${randomId}` });
  
  console.log(`Tunnel created at: ${tunnel.url}`);
  
  const envContent = `EXPO_PUBLIC_API_URL=${tunnel.url}\n`;
  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('Successfully updated .env with Tunnel URL');
  
  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
})();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Cloudflare Tunnel for API (Port 4000)...');
const cf = spawn('.\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:4000']);

cf.stderr.on('data', (data) => {
  const output = data.toString();
  
  // Cloudflare prints the URL in the logs
  const match = output.match(/https:\/\/([a-zA-Z0-9-]+\.trycloudflare\.com)/);
  if (match) {
    const tunnelUrl = `https://${match[1]}`;
    console.log(`\n\n========================================`);
    console.log(`🎉 API Tunnel created at:`);
    console.log(tunnelUrl);
    console.log(`========================================\n\n`);
    
    // Update .env with the new Cloudflare URL
    const envContent = `EXPO_PUBLIC_API_URL=${tunnelUrl}\n`;
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Successfully updated .env with Cloudflare Tunnel URL');
  }
});

cf.on('close', (code) => {
  console.log(`Cloudflare tunnel process exited with code ${code}`);
});

const { spawn } = require('child_process');

console.log('Starting Cloudflare Tunnel for Expo (Port 8081)...');
const cf = spawn('.\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:8081']);

cf.stderr.on('data', (data) => {
  const output = data.toString();
  const match = output.match(/https:\/\/([a-zA-Z0-9-]+\.trycloudflare\.com)/);
  if (match) {
    console.log(`\n\n========================================`);
    console.log(`🎉 Expo Tunnel created at:`);
    console.log(`exps://${match[1]}`);
    console.log(`========================================\n`);
    console.log(`1. Keep this running.`);
    console.log(`2. Open the Expo Go app.`);
    console.log(`3. Tap "Enter URL manually"`);
    console.log(`4. Type EXACTLY: exps://${match[1]}\n\n`);
  }
});

const { spawn } = require('child_process');

console.log('Starting Cloudflare Tunnel for Expo...');
const cf = spawn('.\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:8081']);

// cloudflared outputs its logs to stderr, not stdout
cf.stderr.on('data', (data) => {
  const output = data.toString();
  const match = output.match(/https:\/\/([a-zA-Z0-9-]+\.trycloudflare\.com)/);
  if (match) {
    console.log(`\n\n========================================`);
    console.log(`🎉 NEW EXPO URL (Cloudflare):`);
    console.log(`exp://${match[1]}:80`);
    console.log(`========================================\n\n`);
  }
});

const { spawn } = require('child_process');

console.log('Starting Pinggy Tunnel for Expo...');
const ssh = spawn('ssh', ['-p', '443', '-R0:localhost:8081', 'qr@a.pinggy.io']);

ssh.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  const match = output.match(/https?:\/\/([a-zA-Z0-9-]+\.a\.free\.pinggy\.link)/);
  if (match) {
    console.log(`\n\n========================================`);
    console.log(`ENTER THIS URL IN EXPO GO:`);
    console.log(`exp://${match[1]}:80`);
    console.log(`========================================\n\n`);
  }
});

ssh.stderr.on('data', (data) => {
  console.error(data.toString());
});

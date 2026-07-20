const { spawn } = require('child_process');

console.log('Starting Metro tunnel...');
const ssh = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-o', 'ServerAliveInterval=60', '-R', '80:localhost:8081', 'nokey@localhost.run']);

ssh.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  const match = output.match(/([a-zA-Z0-9-]+\.lhr\.life)/);
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

ssh.on('close', (code) => {
  console.log(`SSH tunnel exited with code ${code}`);
});

const { spawn } = require('child_process');

console.log('Starting Metro tunnel...');
const ssh = spawn('ssh', ['-R', '80:localhost:8081', 'nokey@localhost.run']);

ssh.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  const match = output.match(/([a-zA-Z0-9-]+\.lhr\.life)/);
  if (match) {
    console.log(`\n\n========================================`);
    console.log(`METRO BUNDLER URL: exp://${match[1]}`);
    console.log(`========================================\n\n`);
  }
});

ssh.stderr.on('data', (data) => {
  console.error(data.toString());
});

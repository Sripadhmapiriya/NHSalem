const fs = require('fs');
const path = require('path');

// Test if multer directory exists and is writable
const uploadDir = path.join(__dirname, 'backend', 'public', 'uploads');
console.log('Upload dir exists:', fs.existsSync(uploadDir));
try {
  const testFile = path.join(uploadDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('Upload dir is writable');
} catch (e) {
  console.error('Upload dir is NOT writable:', e.message);
}

// See if there is a server crash on the upload endpoint by mocking a request
async function testUpload() {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('image', fs.createReadStream(path.join(__dirname, 'backend', 'package.json')));

  try {
    // We need to bypass auth for testing, or we need to get a token.
    // Instead, let's just make a dummy file and try the route logic.
    console.log('Test logic done');
  } catch (e) {
    console.error(e);
  }
}
testUpload();

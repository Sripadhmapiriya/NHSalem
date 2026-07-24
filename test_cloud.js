const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'demo',
  api_key: 'api_key',
  api_secret: 'api_secret'
});

async function test() {
  try {
    const testFile = path.join(__dirname, 'backend', 'package.json');
    console.log('Uploading...', testFile);
    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'nhsalem/products'
    });
    console.log('Success:', result.secure_url);
  } catch (error) {
    console.error('Caught error:', error.message);
  }
}
test();

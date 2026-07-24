const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'backend', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('Created:', uploadDir);

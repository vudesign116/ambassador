/**
 * Generate Admin Password Hash
 * Run: node generate-hash.js
 */

const crypto = require('crypto');

function generatePasswordHash(password) {
  const salt = 'MAmbassador_Salt_2024';
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return hash;
}

// Generate hash for default password
const defaultPassword = 'abc123!#';
const hash = generatePasswordHash(defaultPassword);

console.log('\n🔐 Admin Password Hash Generator\n');
console.log('Password:', defaultPassword);
console.log('Hash:', hash);
console.log('\n✅ Copy this hash and update ADMIN_PASSWORD_HASH in AdminLoginPage.js\n');

// To generate hash for a different password, uncomment and run:
// const customPassword = 'your_new_password_here';
// const customHash = generatePasswordHash(customPassword);
// console.log('Custom Password:', customPassword);
// console.log('Custom Hash:', customHash);

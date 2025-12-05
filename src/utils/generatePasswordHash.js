/**
 * Utility to generate password hash for admin login
 * 
 * Usage:
 * 1. Open browser console
 * 2. Copy and paste this function
 * 3. Run: generatePasswordHash('your_new_password')
 * 4. Copy the hash output and update ADMIN_PASSWORD_HASH in AdminLoginPage.js
 */

const generatePasswordHash = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'MAmbassador_Salt_2024'); // Same salt as in AdminLoginPage
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Password Hash:', hashHex);
  return hashHex;
};

// Example usage (uncomment to test):
// generatePasswordHash('abc123!#').then(hash => {
//   console.log('Generated Hash:', hash);
// });

export default generatePasswordHash;

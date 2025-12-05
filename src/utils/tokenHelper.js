/**
 * Token Helper - Obfuscation Layer
 * 
 * ⚠️ WARNING: This is NOT truly secure!
 * This only makes it HARDER to read the token, not impossible.
 * 
 * Purpose:
 * - Delay casual attackers
 * - Avoid plain text token in code
 * - Buy time for proper security implementation
 */

/**
 * Simple XOR encryption/decryption
 * @param {string} input - String to encrypt/decrypt
 * @param {string} key - Encryption key
 * @returns {string} - Encrypted/decrypted string
 */
function xorEncryptDecrypt(input, key) {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return output;
}

/**
 * Convert string to hex
 */
function stringToHex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Convert hex to string
 */
function hexToString(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

/**
 * Get API token (obfuscated)
 * 
 * Token is stored in multiple encrypted parts to avoid plain text
 */
export function getApiToken() {
  // Obfuscation key (change this to something unique)
  const key = 'MerapLion2025Ambassador';
  
  // Token split into parts and encrypted
  // Original token (for reference, remove after encoding):
  // eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ
  
  // Encrypted parts (hex encoded)
  const parts = [
    '281c385115142806215b7a7963703c0b2d303909062811242a1b2b391913265f7c5978',
    '0c6f081b2b42105332162a7f0919281a23003b387b497d61185f2b08041a053c211e2e',
    '084709121b3c06215b7a7c602b24572f192a08282c3821003a201903032a5d7c4a6701',
    '0e3927533e092417261f210d1622397a243b0d007d76783b223638093e395441212922',
    '0628397a44172458437179791d14261c29203e060b29211008187d1f373e5a784a5832',
    '1a54223822'
  ];
  
  // Decode and combine
  const encrypted = parts.join('');
  const decrypted = hexToString(encrypted);
  const token = xorEncryptDecrypt(decrypted, key);
  
  return token;
}

/**
 * Helper function to encode a new token (for admin use)
 * Run this in browser console to encode a new token
 */
export function encodeToken(token) {
  const key = 'MerapLion2025Ambassador';
  const encrypted = xorEncryptDecrypt(token, key);
  const hex = stringToHex(encrypted);
  
  // Split into parts (each part ~70 chars)
  const parts = [];
  for (let i = 0; i < hex.length; i += 70) {
    parts.push(hex.substr(i, 70));
  }
  
  console.log('Encoded token parts:');
  console.log(JSON.stringify(parts, null, 2));
  
  return parts;
}

// For admin use: Encode the current token
// Uncomment and run in console, then copy the output
// encodeToken('YOUR_TOKEN_HERE');

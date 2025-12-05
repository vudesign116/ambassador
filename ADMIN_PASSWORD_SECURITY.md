# 🔐 Admin Password Security

## Overview
Admin password security has been enhanced with SHA-256 hashing and salt to prevent plain text exposure.

## Security Implementation

### 1. Password Hashing
- **Algorithm**: SHA-256 with custom salt
- **Salt**: `MAmbassador_Salt_2024`
- **Storage**: Only hash is stored in code, never plain text password
- **Comparison**: Input password is hashed before comparison

### 2. Session Management
- **Storage**: Session stored in localStorage
- **Expiry**: 8 hours from login time
- **Auto-logout**: Expired sessions automatically cleared
- **Timestamp**: Login time tracked for expiry check

### 3. Current Admin Credentials
- **Username**: `mr_admin`
- **Password**: `abc123!#` (for initial setup)
- **Hash**: `dc1b84dd50fbc8a9e508bf84063adaa8b9e63b2e2306a5110a02be603a383220`

## How to Change Admin Password

### Method 1: Using Node.js Script (Recommended)

1. Edit `generate-hash.js`:
   ```javascript
   const customPassword = 'your_new_strong_password';
   const customHash = generatePasswordHash(customPassword);
   console.log('Custom Hash:', customHash);
   ```

2. Run the script:
   ```bash
   node generate-hash.js
   ```

3. Copy the generated hash

4. Update `src/pages/AdminLoginPage.js`:
   ```javascript
   const ADMIN_PASSWORD_HASH = 'your_generated_hash_here';
   ```

5. Build and deploy

### Method 2: Using HTML Tool

1. Open `generate-admin-hash.html` in browser
2. Enter your new password
3. Click "Generate Hash"
4. Copy the hash and update AdminLoginPage.js
5. Build and deploy

### Method 3: Using Browser Console

1. Open browser console
2. Run:
   ```javascript
   const crypto = window.crypto || window.msCrypto;
   async function hash(pwd) {
     const encoder = new TextEncoder();
     const data = encoder.encode(pwd + 'MAmbassador_Salt_2024');
     const buffer = await crypto.subtle.digest('SHA-256', data);
     const array = Array.from(new Uint8Array(buffer));
     return array.map(b => b.toString(16).padStart(2, '0')).join('');
   }
   hash('your_new_password').then(console.log);
   ```
3. Copy the hash output
4. Update AdminLoginPage.js
5. Build and deploy

## Security Best Practices

### ✅ DO:
- Change default password immediately in production
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Keep `generate-hash.js` and `generate-admin-hash.html` secure
- Regularly rotate passwords (every 90 days)
- Use different passwords for different environments (dev, staging, prod)

### ❌ DON'T:
- Commit plain text passwords to git
- Share password hashes publicly
- Reuse passwords across different systems
- Store passwords in Google Sheets or other external systems
- Use simple/common passwords

## Files Modified for Security

1. **src/pages/AdminLoginPage.js**
   - Added `hashPassword()` function with SHA-256 and salt
   - Changed password comparison to hash comparison
   - Added session timestamp for expiry tracking

2. **src/components/ProtectedRoute.js**
   - Added session expiry check (8 hours)
   - Auto-logout on expired sessions
   - Session cleanup on logout

3. **generate-hash.js** (NEW)
   - Node.js script to generate password hashes
   - Easy to use for password changes

4. **generate-admin-hash.html** (NEW)
   - Web-based password hash generator
   - User-friendly interface for admins

5. **src/utils/generatePasswordHash.js** (NEW)
   - Reusable utility function
   - Can be imported in other admin features if needed

## Additional Security Recommendations

### For Production:
1. **Environment Variables**: Move admin credentials to environment variables
2. **Backend Authentication**: Implement server-side authentication with JWT
3. **Rate Limiting**: Add login attempt limiting (3-5 attempts per 15 minutes)
4. **2FA**: Consider adding two-factor authentication
5. **Audit Logs**: Log all admin login attempts and actions
6. **HTTPS Only**: Ensure site runs on HTTPS only
7. **Password Policy**: Enforce strong password requirements

### For Google Sheets Integration:
- Never store admin passwords in Google Sheets
- Use service account for Firebase/Sheets API
- Restrict service account permissions to minimum required
- Regularly rotate service account keys

## Session Security

### Current Implementation:
- **Duration**: 8 hours (28,800,000 ms)
- **Storage**: localStorage (client-side)
- **Validation**: On every protected route access
- **Cleanup**: Automatic on expiry or logout

### To Change Session Duration:
Edit `src/components/ProtectedRoute.js`:
```javascript
// Change 8 to desired hours
const SESSION_DURATION = 8 * 60 * 60 * 1000;
```

## Testing

### Test Login with Hash:
1. Build the app: `npm run build`
2. Serve locally: `npx serve -s build`
3. Navigate to `/admin/login`
4. Enter credentials:
   - Username: `mr_admin`
   - Password: `abc123!#` (or your new password)
5. Verify successful login and redirect to admin dashboard

### Test Session Expiry:
1. Login to admin panel
2. In browser console, set old timestamp:
   ```javascript
   localStorage.setItem('adminLoginTime', Date.now() - (9 * 60 * 60 * 1000));
   ```
3. Navigate to any admin page
4. Should redirect to login (session expired)

## Emergency Access

If you forget the password:
1. Generate new hash using any method above
2. Update `ADMIN_PASSWORD_HASH` in AdminLoginPage.js
3. Rebuild and deploy
4. Login with new password

## Notes

- **Salt is public**: Salt `MAmbassador_Salt_2024` is in source code. This is acceptable as the password itself is never exposed.
- **Client-side hashing**: Current implementation hashes on client. For maximum security, consider server-side authentication.
- **No password recovery**: There's no "forgot password" feature. Admin must rebuild/deploy to change password.
- **Single admin**: Current system supports one admin account. For multiple admins, implement user database.

## Version History

- **v7.2** (2024-12-05): Added SHA-256 password hashing with salt
- **v7.2** (2024-12-05): Added 8-hour session expiry
- **v7.2** (2024-12-05): Created password hash generation tools

---

**Last Updated**: December 5, 2024  
**Security Level**: Enhanced (Client-side hashing with salt)  
**Recommended Next Step**: Implement server-side authentication with backend API

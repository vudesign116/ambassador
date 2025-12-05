# Admin Route Protection

## 🔒 Security Implementation

**Date:** October 16, 2025  
**Feature:** Protected Admin Routes with Authentication

---

## 📋 Overview

All admin routes (`/admin/*`) are now protected and require authentication. Users attempting to access admin pages without logging in will be automatically redirected to the admin login page.

---

## 🛡️ Implementation Details

### **1. ProtectedRoute Component**

**File:** `src/components/ProtectedRoute.js`

```javascript
const ProtectedRoute = ({ children }) => {
  // Check localStorage for authentication
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminUsername = localStorage.getItem('adminUsername');

  // Redirect to login if not authenticated
  if (!isAdminLoggedIn || !adminUsername) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render protected content if authenticated
  return children;
};
```

### **2. App.js Route Configuration**

```javascript
{/* Admin Routes */}
<Route path="/admin/login" element={<AdminLogin />} />

{/* Protected Admin Routes */}
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route index element={<AdminDashboard />} />
  <Route path="minigames" element={<AdminMiniGames />} />
  <Route path="login-page" element={<AdminLoginPageConfig />} />
  {/* ... other admin routes */}
</Route>
```

### **3. Authentication Flow**

#### **Login (AdminLoginPage.js)**
```javascript
// On successful login
localStorage.setItem('adminLoggedIn', 'true');
localStorage.setItem('adminUsername', values.username);
navigate('/admin');
```

#### **Logout (AdminLayout.js)**
```javascript
// On logout
localStorage.removeItem('adminLoggedIn');
localStorage.removeItem('adminUsername');
navigate('/admin/login');
```

---

## 🔑 Authentication Keys

**localStorage Keys:**
- `adminLoggedIn`: `'true'` | `null` - Authentication status
- `adminUsername`: `string` | `null` - Logged-in admin username

---

## 🚦 Access Control

### **Public Routes (No Authentication Required)**
```
✅ /                      - User login
✅ /login                 - User login
✅ /admin/login           - Admin login
✅ /500                   - Error page
✅ /503                   - Error page
```

### **Protected Admin Routes (Authentication Required)**
```
🔒 /admin                 - Admin dashboard
🔒 /admin/minigames       - Mini games management
🔒 /admin/login-page      - Login page config
🔒 /admin/introduction    - Introduction config
🔒 /admin/scoring-rules   - Scoring rules config
🔒 /admin/dashboard-config - Dashboard config
🔒 /admin/general-config  - General config
🔒 /admin/notification    - Notification config
🔒 /admin/surveys         - Surveys list
🔒 /admin/surveys/create  - Create survey
🔒 /admin/surveys/:id/edit - Edit survey
🔒 /admin/surveys/:id/responses - Survey responses
```

---

## 🧪 Testing Guide

### **Test 1: Unauthorized Access**
```
1. Open browser (incognito mode)
2. Visit: https://ambassador-7849e.web.app/admin
3. Expected: Redirected to /admin/login
4. Console: ⚠️ Unauthorized admin access attempt - redirecting to login
```

### **Test 2: Successful Login**
```
1. Visit: https://ambassador-7849e.web.app/admin/login
2. Enter credentials:
   - Username: admin
   - Password: [admin password]
3. Click "Đăng nhập"
4. Expected: Redirected to /admin (dashboard)
5. Console: ✅ Admin authenticated - access granted to: admin
```

### **Test 3: Authenticated Access**
```
1. After logging in, try to access:
   - /admin
   - /admin/minigames
   - /admin/general-config
2. Expected: All pages load successfully
3. No redirect to login
```

### **Test 4: Logout**
```
1. While logged in, click user dropdown (top right)
2. Click "Đăng xuất"
3. Expected: Redirected to /admin/login
4. Console: 👋 Admin logged out
5. Try accessing /admin again
6. Expected: Redirected to /admin/login (not authenticated)
```

### **Test 5: Direct URL Access**
```
1. Logout first
2. Try accessing directly:
   https://ambassador-7849e.web.app/admin/surveys
3. Expected: Redirected to /admin/login
4. After login, manually navigate to /admin/surveys
5. Expected: Page loads successfully
```

---

## 🔍 Security Features

### **Client-Side Protection**
✅ Immediate redirect on unauthorized access  
✅ localStorage-based session management  
✅ Automatic logout functionality  
✅ Console logging for debugging  

### **What's Protected**
✅ All admin configuration pages  
✅ Survey management  
✅ Mini-games management  
✅ General settings  

### **What's NOT Protected (by design)**
✅ User-facing pages (login, dashboard, documents)  
✅ Error pages (404, 500)  
✅ Admin login page itself  

---

## ⚠️ Security Considerations

### **Current Implementation (Client-Side)**
- ✅ **Good for:** Preventing accidental access
- ✅ **Good for:** Basic authorization flow
- ⚠️ **Not sufficient for:** Preventing determined attackers

### **Limitations**
1. **localStorage can be manipulated** - Users can set `adminLoggedIn` to `'true'` in browser DevTools
2. **No server-side validation** - API calls are not validated against admin status
3. **No token expiration** - Session persists until manual logout or cache clear

### **Recommended Improvements for Production**

#### **1. Add Session Expiration**
```javascript
// On login
const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
localStorage.setItem('adminExpiresAt', expiresAt.toString());

// In ProtectedRoute
const expiresAt = localStorage.getItem('adminExpiresAt');
if (!expiresAt || Date.now() > parseInt(expiresAt)) {
  // Session expired
  return <Navigate to="/admin/login" replace />;
}
```

#### **2. Use JWT Tokens**
```javascript
// Store JWT token from backend
localStorage.setItem('adminToken', jwtToken);

// Validate token with backend on each route change
const validateToken = async (token) => {
  const response = await fetch('/api/validate-token', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.ok;
};
```

#### **3. Server-Side API Protection**
```javascript
// All admin API calls should validate token
const response = await fetch('/api/admin/config', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'X-Admin-User': adminUsername
  }
});

// Backend should return 401/403 if invalid
```

#### **4. Add CSRF Protection**
```javascript
// Generate CSRF token on login
const csrfToken = generateToken();
localStorage.setItem('csrfToken', csrfToken);

// Include in all POST/PUT/DELETE requests
headers: {
  'X-CSRF-Token': csrfToken
}
```

---

## 📊 File Changes Summary

### **New Files:**
```
✅ src/components/ProtectedRoute.js - Authentication guard component
✅ ADMIN_ROUTE_PROTECTION.md - This documentation
```

### **Modified Files:**
```
✅ src/App.js - Added ProtectedRoute wrapper to admin routes
✅ src/layouts/AdminLayout.js - Enhanced logout to clear all auth data
```

### **Code Statistics:**
- **Lines Added:** ~50
- **Files Created:** 2
- **Security Level:** Basic (Client-side only)

---

## 🎯 Usage Examples

### **For Developers: Adding New Protected Routes**

```javascript
// In App.js

// ❌ WRONG - Not protected
<Route path="/admin/new-feature" element={<NewFeature />} />

// ✅ CORRECT - Protected (inside admin layout)
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route path="new-feature" element={<NewFeature />} />
</Route>

// ✅ ALSO CORRECT - Protected separately
<Route path="/admin/standalone-feature" element={
  <ProtectedRoute>
    <StandaloneFeature />
  </ProtectedRoute>
} />
```

### **For Developers: Custom Protection Logic**

```javascript
// src/components/ProtectedRoute.js

// Example: Add role-based access
const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminRole = localStorage.getItem('adminRole'); // 'admin' | 'editor' | 'viewer'
  
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check role
  if (requiredRole && adminRole !== requiredRole) {
    return <Navigate to="/admin/forbidden" replace />;
  }
  
  return children;
};

// Usage
<Route path="/admin/super-admin" element={
  <ProtectedRoute requiredRole="super-admin">
    <SuperAdminPage />
  </ProtectedRoute>
} />
```

---

## 🚀 Deployment Status

### **Production URL:**
```
https://ambassador-7849e.web.app
```

### **Test Admin Access:**
```
1. Visit: https://ambassador-7849e.web.app/admin
2. Should redirect to: https://ambassador-7849e.web.app/admin/login
3. After login, can access all admin routes
```

### **Verification:**
✅ Deployed: October 16, 2025  
✅ Status: Active  
✅ Protection: Enabled  
✅ Tested: All routes protected  

---

## 📞 Support

**Issues to Report:**
- Admin routes accessible without login
- Logout not working properly
- Redirect loop issues
- Session persistence problems

**Debug Commands:**
```javascript
// Check authentication status in browser console
console.log('Admin Logged In:', localStorage.getItem('adminLoggedIn'));
console.log('Admin Username:', localStorage.getItem('adminUsername'));

// Manual logout (for testing)
localStorage.removeItem('adminLoggedIn');
localStorage.removeItem('adminUsername');
window.location.href = '/admin/login';

// Manual login (for testing - NOT SECURE)
localStorage.setItem('adminLoggedIn', 'true');
localStorage.setItem('adminUsername', 'test-admin');
window.location.href = '/admin';
```

---

**Status:** ✅ Implemented & Deployed  
**Version:** 6.6  
**Security Level:** Basic (Client-side)  
**Next Steps:** Consider server-side validation for production

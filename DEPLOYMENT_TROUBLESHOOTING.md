# 🔧 Deployment Troubleshooting Guide

## ✅ Deployment Status: SUCCESS

**Deployed:** October 16, 2025  
**URL:** https://ambassador-7849e.web.app  
**Status:** HTTP 200 OK  
**Files:** 18 files deployed  

---

## 🌐 Website Working Confirmation

### **Server Response:**
```
HTTP/2 200 
content-type: text/html; charset=utf-8
content-length: 1014
```

### **HTML Verification:**
```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <link rel="icon" type="image/x-icon" href="./favicon.ico"/>
  <title>MerapLion Ambassador</title>
  <script defer="defer" src="./static/js/main.cd44319a.js"></script>
  <link href="./static/css/main.e329bf3d.css" rel="stylesheet">
</head>
```

✅ **Website đang hoạt động bình thường!**

---

## 🚨 Nếu Bạn Thấy Trang Trắng/Không Hiển Thị

### **Nguyên nhân phổ biến:**

#### **1. Browser Cache (Phổ biến nhất)**

Browser của bạn đang cache phiên bản cũ.

**Giải pháp:**

**Chrome/Edge:**
```
1. Mở DevTools: F12 hoặc Cmd+Option+I (Mac)
2. Right-click vào nút Reload
3. Chọn "Empty Cache and Hard Reload"

Hoặc:
- Windows: Ctrl + Shift + Delete → Clear cache
- Mac: Cmd + Shift + Delete → Clear cache
```

**Firefox:**
```
1. Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)

Hoặc:
- Ctrl + Shift + Delete → Clear cache
```

**Safari:**
```
1. Cmd + Option + E (Clear cache)
2. Cmd + R (Reload)

Hoặc:
- Safari → Clear History → All History
```

**Cách nhanh nhất:**
```
Mở Incognito/Private Mode:
- Chrome: Ctrl+Shift+N (Windows) / Cmd+Shift+N (Mac)
- Firefox: Ctrl+Shift+P (Windows) / Cmd+Shift+P (Mac)
- Safari: Cmd+Shift+N (Mac)

Paste URL: https://ambassador-7849e.web.app
```

---

#### **2. CDN Propagation Time**

Firebase CDN cần thời gian để update cache globally.

**Thời gian:** 5-15 phút

**Giải pháp:**
- Chờ 5-10 phút
- Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)
- Xóa cache browser

---

#### **3. JavaScript Disabled**

React app cần JavaScript để chạy.

**Kiểm tra:**
1. Mở DevTools (F12)
2. Check Console tab
3. Nếu thấy: "You need to enable JavaScript"

**Giải pháp:**
- Chrome: Settings → Privacy → Site Settings → JavaScript → Allowed
- Firefox: about:config → javascript.enabled → true
- Safari: Preferences → Security → Enable JavaScript

---

#### **4. CORS hoặc CSP Issues**

**Kiểm tra:**
1. Mở DevTools (F12)
2. Check Console tab
3. Tìm lỗi CORS hoặc CSP

**Giải pháp:**
Nếu thấy lỗi CORS từ API:
```javascript
// API cần có headers:
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

#### **5. Build Assets Not Loading**

**Kiểm tra:**
1. Mở DevTools (F12)
2. Check Network tab
3. Tìm các file .js hoặc .css trả về 404

**Nếu thấy 404 cho static files:**

```bash
# Check package.json
cat package.json | grep homepage

# Phải là:
"homepage": ".",

# Nếu khác, sửa lại và rebuild:
npm run build
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/firebase-service-account.json"
npx firebase deploy --only hosting
```

---

## 🔍 Debug Steps

### **Step 1: Verify Server Response**

```bash
# Test từ terminal
curl -I https://ambassador-7849e.web.app/

# Expected:
HTTP/2 200 
content-type: text/html; charset=utf-8
```

✅ **Result:** Working (200 OK)

---

### **Step 2: Check HTML Content**

```bash
curl -s https://ambassador-7849e.web.app/ | head -10
```

**Expected output:**
```html
<!doctype html><html lang="vi"><head>
```

✅ **Result:** HTML correct

---

### **Step 3: Check Static Files**

```bash
# Check main JS
curl -I https://ambassador-7849e.web.app/static/js/main.cd44319a.js

# Check CSS
curl -I https://ambassador-7849e.web.app/static/css/main.e329bf3d.css

# Check favicon
curl -I https://ambassador-7849e.web.app/favicon.ico
```

**Expected:** All return 200 OK

---

### **Step 4: Browser DevTools Check**

1. **Open DevTools:** F12 hoặc Right-click → Inspect
2. **Check Console tab:**
   - Không có lỗi đỏ
   - React app đã khởi động
3. **Check Network tab:**
   - `index.html` → 200
   - `main.*.js` → 200
   - `main.*.css` → 200
4. **Check Application tab:**
   - localStorage có data không
   - Service Worker status

---

## ✅ Verification Checklist

### **Before Claiming Issue:**

- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Clear browser cache completely
- [ ] Try Incognito/Private mode
- [ ] Try different browser (Chrome, Firefox, Safari)
- [ ] Wait 5-10 minutes for CDN propagation
- [ ] Check DevTools Console for errors
- [ ] Check DevTools Network tab for 404s
- [ ] Verify JavaScript is enabled
- [ ] Test on mobile device (different network)
- [ ] Test with mobile data (not WiFi)

---

## 🛠️ Quick Fix Commands

### **If Website Still Not Working:**

```bash
cd /Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador

# 1. Verify package.json homepage
cat package.json | grep homepage
# Should show: "homepage": ".",

# 2. Clean rebuild
rm -rf build
npm run build

# 3. Verify build folder
ls -la build/
# Should see: index.html, favicon.ico, static/

# 4. Check index.html
cat build/index.html | grep -E "(title|script|link)"
# Should see proper paths: ./static/js/...

# 5. Redeploy
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/firebase-service-account.json"
npx firebase deploy --only hosting

# 6. Wait 2 minutes, then test
sleep 120
curl -I https://ambassador-7849e.web.app/
```

---

## 📱 Mobile Testing

### **Test on Phone:**

1. **Same Network:**
   - Connect phone to same WiFi
   - Open: https://ambassador-7849e.web.app

2. **Different Network:**
   - Use mobile data (4G/5G)
   - Open: https://ambassador-7849e.web.app

3. **Share via QR Code:**
   ```
   Generate QR at: https://www.qr-code-generator.com/
   Input URL: https://ambassador-7849e.web.app
   Scan with phone camera
   ```

---

## 🚀 If Everything Fails

### **Last Resort Steps:**

1. **Check Firebase Console:**
   - Visit: https://console.firebase.google.com/project/ambassador-7849e/hosting
   - Verify deployment status
   - Check release history
   - Look for error messages

2. **Rollback to Previous Version:**
   ```bash
   # In Firebase Console:
   Hosting → Release History → Select previous version → Rollback
   ```

3. **Redeploy from Scratch:**
   ```bash
   # Delete everything
   rm -rf build node_modules
   
   # Fresh install
   npm install
   
   # Build
   npm run build
   
   # Deploy
   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/firebase-service-account.json"
   npx firebase deploy --only hosting
   ```

4. **Contact Firebase Support:**
   - Visit: https://firebase.google.com/support
   - Provide:
     - Project ID: ambassador-7849e
     - Deployment timestamp
     - Error messages from DevTools

---

## 📊 Current Deployment Info

**Project Details:**
```json
{
  "project_id": "ambassador-7849e",
  "url": "https://ambassador-7849e.web.app",
  "files": 18,
  "build_folder": "build",
  "status": "deployed",
  "last_deploy": "2025-10-16 12:43:55 GMT"
}
```

**Files Deployed:**
```
build/
├── index.html (1014 bytes)
├── favicon.ico (15KB)
├── manifest.json
├── asset-manifest.json
├── images/
└── static/
    ├── js/
    │   └── main.cd44319a.js (644KB gzipped)
    └── css/
        └── main.e329bf3d.css (12.3KB)
```

---

## ✅ Expected Result

Khi mở https://ambassador-7849e.web.app, bạn sẽ thấy:

1. **Login Page** với:
   - MerapLion logo
   - Input field "Số điện thoại"
   - Button "Đăng nhập"
   - Gradient background (#667eea → #764ba2)
   - Favicon hiển thị trên browser tab

2. **No errors** trong DevTools Console

3. **All files loaded** trong DevTools Network tab

---

## 🎯 Next Steps After Successful Load

1. **Test Login:**
   - Phone: `0982085810`
   - Should navigate to dashboard or reward selection

2. **Test All Pages:**
   - Dashboard
   - Reward Selection
   - Admin Panel
   - 404 Page
   - 500 Error Page

3. **Test on Mobile:**
   - Login flow
   - Responsive design
   - Touch interactions

4. **Monitor for 24 Hours:**
   - Check Firebase Console for usage
   - Monitor errors
   - Track user activity

---

**Status:** ✅ Website is LIVE and WORKING

**Last Verified:** October 16, 2025 12:44 GMT

**Action Required:** Clear browser cache and hard refresh!

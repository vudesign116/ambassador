# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## ⚠️ QUAN TRỌNG: Các bước PHẢI LÀM trước khi deploy production

### 1️⃣ **Tắt Test Mode trong API Helper**

**File:** `src/utils/apiHelper.js`

**Tìm và XÓA/COMMENT dòng này (khoảng line 13-16):**

```javascript
// 🧪 TEST MODE: Add ?test=1 to bypass business logic (remove this line in production)
if (!apiEndpoint.includes('?test=1')) {
  apiEndpoint += '?test=1';
  console.log('[API] 🧪 TEST MODE: Using test=1 parameter');
}
```

**HOẶC comment lại:**

```javascript
// PRODUCTION: Commented out test mode
// if (!apiEndpoint.includes('?test=1')) {
//   apiEndpoint += '?test=1';
//   console.log('[API] 🧪 TEST MODE: Using test=1 parameter');
// }
```

---

### 2️⃣ **Kiểm tra Environment Variables**

**File:** `.env` hoặc `.env.production`

```env
# Backend API (PRODUCTION)
REACT_APP_API_BASE_URL=https://bi.meraplion.com/local

# Google Apps Script (nếu có)
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_PRODUCTION_SCRIPT_ID/exec
REACT_APP_ADMIN_CONFIG_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ADMIN_CONFIG_SCRIPT_ID/exec

# Tracking
REACT_APP_TRACK_PAGE_VIEW=true
REACT_APP_PAGE_VIEW_DELAY=5000

# Debug (phải là false trong production)
REACT_APP_MAINTENANCE_DEBUG=false
```

---

### 3️⃣ **Kiểm tra Admin Config trong LocalStorage**

**API Endpoint phải đúng:**
- Dev/Test: `https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1`
- Production: `https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/`

**Kiểm tra trong console:**
```javascript
localStorage.getItem('app_sync_point_api_endpoint')
// Kết quả PHẢI KHÔNG có ?test=1
```

---

### 4️⃣ **Kiểm tra Console Logs**

Tìm và xóa/comment các console.log không cần thiết:

```javascript
// ❌ XÓA TRONG PRODUCTION
console.log('[API] 🧪 TEST MODE: Using test=1 parameter');
console.log('[DEBUG] Something...');

// ✅ GIỮ LẠI (quan trọng để debug production)
console.log('[API] Posting viewing history:', payload);
console.error('[API] POST failed:', error);
```

---

### 5️⃣ **Build Production**

```bash
# Clean old build
rm -rf build/

# Build production
npm run build

# Check build size
du -sh build/
```

---

### 6️⃣ **Test Production Build Locally**

```bash
# Serve production build
npx serve -s build -p 3000

# Mở browser: http://localhost:3000
# Kiểm tra:
# 1. Login thành công
# 2. Xem tài liệu 120s
# 3. API POST thành công (check Network tab)
# 4. KHÔNG thấy ?test=1 trong URL
```

---

### 7️⃣ **Deploy to Firebase (nếu dùng)**

```bash
# Login Firebase
firebase login

# Deploy
firebase deploy --only hosting

# Hoặc deploy all
firebase deploy
```

---

## 🔍 CHECKLIST SUMMARY

- [ ] ✅ Đã XÓA/COMMENT dòng `apiEndpoint += '?test=1'` trong `apiHelper.js`
- [ ] ✅ Đã kiểm tra `.env` production
- [ ] ✅ Đã xóa console.log không cần thiết
- [ ] ✅ Đã test build production locally
- [ ] ✅ Đã kiểm tra Network tab không có `?test=1`
- [ ] ✅ Đã test flow đầy đủ: Login → Xem tài liệu → Nhận điểm
- [ ] ✅ Đã deploy lên server/Firebase

---

## 🧪 So sánh TEST vs PRODUCTION

| Feature | TEST MODE | PRODUCTION MODE |
|---------|-----------|-----------------|
| API URL | `.../?test=1` | `...` (no params) |
| Business Logic | Bypassed | Active |
| Program Pause | Ignored | Enforced |
| Console Logs | Nhiều | Chỉ errors |
| Debug Info | Có | Tắt |

---

## 🆘 ROLLBACK (nếu có lỗi)

**Nếu production có lỗi, bật lại test mode tạm thời:**

```javascript
// Emergency: Temporarily enable test mode
if (!apiEndpoint.includes('?test=1')) {
  apiEndpoint += '?test=1';
  console.log('[EMERGENCY] Test mode enabled for debugging');
}
```

Sau khi fix xong, XÓA lại dòng này!

---

## 📞 LIÊN HỆ

Nếu có vấn đề, liên hệ:
- Developer: [Tên bạn]
- Backend Team: [Team backend]
- API Issues: Check API_DOCUMENTATION.md

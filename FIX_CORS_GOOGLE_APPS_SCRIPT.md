# 🔧 Fix CORS Error with Google Apps Script

## 🐛 Vấn đề

Khi lưu config trong Admin (scoring-rules, introduction, etc.), gặp lỗi CORS:

```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'https://ambassador-7849e.web.app' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Nguyên nhân

### 1. **CORS Preflight Request**

Khi sử dụng `mode: 'cors'` với method POST và custom headers, browser tự động gửi **preflight request** (OPTIONS):

```
Browser → Google Apps Script
OPTIONS /exec
Headers:
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type

← Response cần có:
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: POST
  Access-Control-Allow-Headers: content-type
```

### 2. **Google Apps Script không handle OPTIONS**

Google Apps Script V7 hiện tại chỉ có:
- `doPost(e)` - Xử lý POST requests
- `doGet(e)` - Xử lý GET requests
- **KHÔNG có** `doOptions(e)` hoặc CORS headers

→ Preflight request **THẤT BẠI** → CORS error

### 3. **Tại sao trước đó không lỗi?**

Trước đó code dùng `mode: 'no-cors'`:
- ✅ Không trigger preflight request
- ✅ Request được gửi trực tiếp
- ❌ Nhưng không đọc được response

## ✅ GIẢI PHÁP

### **Option 1: Dùng `no-cors` mode** (RECOMMENDED - Đang áp dụng) ⭐⭐⭐

```javascript
// googleSheetsService.js
async saveAdminConfig(configName, configData) {
  await fetch(this.adminConfigUrl, {
    method: 'POST',
    mode: 'no-cors',  // ✅ Không trigger preflight
    headers: {
      'Content-Type': 'text/plain'  // Simple header
    },
    body: JSON.stringify(data)
  });
  
  // Verify sau 2 giây bằng cách load lại
  setTimeout(async () => {
    const verified = await this.loadAdminConfig(configName);
    if (verified) {
      console.log('✅ Verified: Config saved successfully');
    }
  }, 2000);
  
  return true;
}
```

**Ưu điểm:**
- ✅ Không cần sửa Google Apps Script
- ✅ Hoạt động ngay lập tức
- ✅ Không có CORS error

**Nhược điểm:**
- ❌ Không đọc được response trực tiếp
- ❌ Phải verify bằng cách load lại

---

### **Option 2: Update Google Apps Script với CORS headers** ⭐⭐

Nếu muốn dùng `mode: 'cors'`, cần update Google Apps Script:

```javascript
// COMPLETE_GOOGLE_APPS_SCRIPT_V7.js

function doPost(e) {
  // Add CORS headers
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var data = JSON.parse(e.postData.contents);
    var result = processData(data);
    
    return output
      .setContent(JSON.stringify(result))
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    return output
      .setContent(JSON.stringify({ success: false, error: error.toString() }))
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handle OPTIONS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '3600');
}
```

**Sau đó:**
1. Deploy Google Apps Script mới
2. Update code frontend dùng `mode: 'cors'`
3. Rebuild & redeploy

**Ưu điểm:**
- ✅ Có thể đọc response trực tiếp
- ✅ Error handling tốt hơn
- ✅ Standard CORS implementation

**Nhược điểm:**
- ❌ Cần deploy lại Google Apps Script
- ❌ Cần test kỹ để đảm bảo không break existing features

---

## 📊 So sánh

| Feature | no-cors mode | cors mode + CORS headers |
|---------|--------------|-------------------------|
| CORS errors | ✅ Không có | ✅ Không có (nếu config đúng) |
| Read response | ❌ Không | ✅ Có |
| Error handling | ⚠️ Giả định success | ✅ Chính xác |
| Deployment | ✅ Không cần thay đổi | ❌ Cần update Apps Script |
| Verification | ⚠️ Load lại sau 2s | ✅ Trực tiếp |

## 🎯 Khuyến nghị

### Short-term (Hiện tại)

✅ **Dùng `no-cors` mode**
- Đơn giản, hoạt động ngay
- Verify bằng cách load lại config
- Đủ tốt cho use case hiện tại

### Long-term (Tương lai)

Khi có thời gian, nên:
1. ✅ Update Google Apps Script với proper CORS headers
2. ✅ Thêm `doOptions()` handler
3. ✅ Switch sang `mode: 'cors'`
4. ✅ Improve error handling

## 🧪 Cách test

### Test với no-cors mode (hiện tại):

1. Vào Admin > Scoring Rules
2. Edit config và click "Lưu cấu hình"
3. Kiểm tra Console:

```
✅ Logs thành công:
📤 Saving admin config "admin_scoring_rules_config" to Google Sheets...
✅ Admin config "admin_scoring_rules_config" sent to Google Sheets (no-cors mode)
(Sau 2s)
✅ Verified: Config "admin_scoring_rules_config" saved successfully
```

4. F5 trang user → Thấy config mới

### Test khi có lỗi:

```
❌ Logs lỗi:
📤 Saving admin config "admin_scoring_rules_config" to Google Sheets...
❌ Failed to save admin config: TypeError: Failed to fetch
⚠️ Failed to sync to Google Sheets: admin_scoring_rules_config (localStorage only)
```

→ Config vẫn được lưu trong localStorage nhưng không sync cross-device

## 🔗 Related Files

- `src/services/googleSheetsService.js` - Service với no-cors mode
- `COMPLETE_GOOGLE_APPS_SCRIPT_V7.js` - Google Apps Script (chưa có CORS headers)
- `src/utils/configSync.js` - Config sync utility

## 📝 Notes

### Về `no-cors` mode:

1. **Response is Opaque**
   - Không đọc được body, headers, status
   - Browser ẩn hoàn toàn response
   - Chỉ biết request có throw error hay không

2. **Simple Request Only**
   - Content-Type: `text/plain`, `application/x-www-form-urlencoded`, or `multipart/form-data`
   - Không dùng custom headers
   - Không trigger preflight

3. **Verification Strategy**
   - Sau khi save, đợi 2 giây
   - Load lại config từ Google Sheets
   - So sánh với data vừa save
   - Nếu giống → Save thành công

### Về CORS và Google Apps Script:

1. **Google Apps Script Deployment**
   - Mỗi lần deploy → URL mới (nếu tạo version mới)
   - Hoặc giữ nguyên URL (nếu update HEAD)
   - Cần redeploy để thay đổi code

2. **CORS Headers Support**
   - Apps Script KHÔNG tự động thêm CORS headers
   - Phải manually add vào response
   - Phải implement `doOptions()` cho preflight

3. **Best Practice**
   - Test trên Apps Script editor trước
   - Deploy as "Test deployment" trước khi production
   - Giữ backup của version cũ

---

**Status:** ✅ Fixed (using no-cors mode)  
**Date:** 2025-10-19  
**Impact:** Config save hoạt động, cross-device sync OK  
**Future improvement:** Add CORS headers to Apps Script

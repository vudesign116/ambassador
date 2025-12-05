# 🔍 Debug: Scoring Rules Data Not Persisting

## 🐛 Vấn đề

- Save config trong Admin → Hiện "✅ Đã lưu cấu hình!"
- F5 trang user → Data vẫn như cũ
- Data không được lưu vào Google Sheets

## 🧪 Các bước debug

### Step 1: Kiểm tra Console khi Save (Admin Page)

Mở Admin > Scoring Rules, mở Console (F12), sau đó click "Lưu cấu hình".

**Logs mong đợi:**

```javascript
// Khi click Save:
📤 Saving admin config "admin_scoring_rules_config" to Google Sheets...
💾 Saved to localStorage: admin_scoring_rules_config
✅ Admin config "admin_scoring_rules_config" sent to Google Sheets (no-cors mode)

// Sau 2 giây (verification):
📥 Loading admin config "admin_scoring_rules_config" from Google Sheets...
✅ Admin config "admin_scoring_rules_config" loaded from Google Sheets: {bannerImage: "...", rulesContent: "..."}
✅ Verified: Config "admin_scoring_rules_config" saved successfully
```

**Nếu thấy lỗi:**

```javascript
❌ Failed to save admin config: TypeError: Failed to fetch
⚠️ Failed to sync to Google Sheets: admin_scoring_rules_config (localStorage only)
```

→ **Request không đến Google Sheets**

---

### Step 2: Kiểm tra Console khi Load (User Page)

F5 trang Scoring Rules, mở Console:

**Logs mong đợi:**

```javascript
✅ Scoring rules loaded from localStorage (instant)
🔄 Fetching latest scoring rules from Google Sheets...
📥 Loading admin config "admin_scoring_rules_config" from Google Sheets...
✅ Admin config "admin_scoring_rules_config" loaded from Google Sheets: {bannerImage: "...", rulesContent: "..."}
✅ Scoring rules updated from Google Sheets
```

**Nếu thấy:**

```javascript
❌ Failed to load admin config: [Error details]
ℹ️ No scoring rules config found in Google Sheets
```

→ **Data không có trong Google Sheets**

---

### Step 3: Kiểm tra Google Sheets trực tiếp

1. Mở Google Sheets được link với Apps Script
2. Tìm sheet tên **"AdminConfigs"**
3. Kiểm tra có row nào với `configName` = `admin_scoring_rules_config` không?

**Nếu KHÔNG có:**
→ Data không được save vào Sheets (vấn đề ở `saveAdminConfig`)

**Nếu CÓ nhưng data CŨ:**
→ Save request không đến hoặc bị reject

**Nếu CÓ và data MỚI:**
→ Vấn đề ở load (vấn đề ở `loadAdminConfig`)

---

### Step 4: Test Apps Script URL trực tiếp

#### Test Save (POST):

Mở Postman hoặc browser console:

```javascript
fetch('https://script.google.com/macros/s/AKfycbxwPeiuyLrjZsYoPepkwH5gcQxkZFGyf_EDiaY_-DH41iIgYIPdjzMCC1YB6zymWjWZ/exec', {
  method: 'POST',
  mode: 'no-cors',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: JSON.stringify({
    type: 'admin_config',
    data: {
      configName: 'test_config',
      configData: { message: 'Hello from test' },
      updatedBy: 'Test User',
      timestamp: new Date().toISOString()
    }
  })
})
.then(() => console.log('✅ Request sent'))
.catch(err => console.error('❌ Error:', err));
```

Sau đó kiểm tra Google Sheets → Có row `test_config` không?

#### Test Load (GET):

```javascript
fetch('https://script.google.com/macros/s/AKfycbxwPeiuyLrjZsYoPepkwH5gcQxkZFGyf_EDiaY_-DH41iIgYIPdjzMCC1YB6zymWjWZ/exec?action=getConfig&name=admin_scoring_rules_config')
  .then(res => res.json())
  .then(data => console.log('✅ Loaded:', data))
  .catch(err => console.error('❌ Error:', err));
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "config": {
    "bannerImage": "...",
    "rulesContent": "..."
  },
  "updatedBy": "Admin",
  "timestamp": "2025-10-19T..."
}
```

---

## 🔧 Các fix có thể

### Fix 1: Google Apps Script chưa được deploy đúng

**Vấn đề:** Script chưa được deploy hoặc deploy sai version

**Giải pháp:**
1. Mở Google Apps Script Editor
2. Click **Deploy** → **Manage deployments**
3. Kiểm tra:
   - ✅ Web app deployment tồn tại
   - ✅ Execute as: **Me**
   - ✅ Who has access: **Anyone**
4. Nếu sai → Edit → **Deploy** lại
5. Copy URL mới → Update `.env`

---

### Fix 2: Apps Script có lỗi

**Vấn đề:** Script có bug, throw error khi save

**Debug:**
1. Mở Apps Script Editor
2. Click **Executions** (menu trái)
3. Tìm execution logs gần đây
4. Xem có error không?

**Common errors:**
- `ReferenceError: saveAdminConfig is not defined`
- `TypeError: Cannot read property '0' of undefined`
- `Exception: The coordinates or dimensions of the range are invalid`

---

### Fix 3: URL của Apps Script sai

**Kiểm tra `.env`:**

```bash
REACT_APP_ADMIN_CONFIG_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

**Test URL:**
1. Copy URL từ `.env`
2. Paste vào browser
3. Thêm `?action=getConfig&name=test`
4. Kết quả: Phải return JSON, không phải HTML error page

---

### Fix 4: Không có quyền access Google Sheets

**Vấn đề:** Apps Script không có quyền write vào Sheets

**Giải pháp:**
1. Mở Apps Script Editor
2. Run function `saveAdminConfig` manually
3. Authorize nếu được hỏi
4. Test lại

---

### Fix 5: Sheet "AdminConfigs" chưa tồn tại

**Kiểm tra:**
1. Mở Google Sheets
2. Tìm sheet tab tên "AdminConfigs"
3. Nếu không có → Script sẽ tạo tự động

**Nếu không tự tạo:**
```javascript
// Trong Apps Script, chạy function này manually:
function createAdminConfigsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet('AdminConfigs');
  sheet.appendRow(['configName', 'configData', 'updatedBy', 'timestamp']);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  Logger.log('✅ AdminConfigs sheet created');
}
```

---

## 🎯 Quick Fix: Manual Verification

Nếu không tìm ra vấn đề, thử cách này:

### 1. Clear localStorage trước khi test

```javascript
// Trong Console của admin page:
localStorage.removeItem('admin_scoring_rules_config');
console.log('✅ Cleared cache');
```

### 2. Save lại config

Click "Lưu cấu hình" → Đợi 5 giây

### 3. Check Google Sheets

Mở Sheets → Xem có data mới không?

### 4. Test load từ Sheets

```javascript
// Trong Console của user page:
localStorage.removeItem('admin_scoring_rules_config');
location.reload(); // F5
// → Nếu data mới xuất hiện → Save đã OK, chỉ cache bị cũ
```

---

## 📝 Debugging Checklist

- [ ] Console có logs khi save?
- [ ] Console có logs khi load?
- [ ] Google Sheets có sheet "AdminConfigs"?
- [ ] Sheet có row `admin_scoring_rules_config`?
- [ ] Row có timestamp mới nhất?
- [ ] Data trong row đúng với data vừa save?
- [ ] Apps Script URL trong `.env` đúng?
- [ ] Test Apps Script URL trực tiếp → return JSON?
- [ ] Executions log có error không?
- [ ] Clear cache → F5 → Thấy data mới?

---

## 🆘 Nếu vẫn không work

Thử **temporary workaround**:

```javascript
// src/pages/AdminScoringRulesConfig.js
const handleSave = async () => {
  setLoading(true);
  try {
    const configToSave = {
      bannerImage: config.bannerImage || '',
      rulesContent: config.rulesContent || ''
    };
    
    // TEMP: Chỉ lưu localStorage, bỏ qua Google Sheets
    localStorage.setItem('admin_scoring_rules_config', JSON.stringify(configToSave));
    
    console.log('✅ Saved to localStorage only (temp fix)');
    message.success('✅ Đã lưu cấu hình! (Local only)');
    
    setLoading(false);
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
    message.error('Lỗi khi lưu cấu hình!');
  }
};
```

**Lưu ý:** Cách này **không sync cross-device**, chỉ dùng tạm!

---

**Created:** 2025-10-19  
**Status:** Debugging in progress

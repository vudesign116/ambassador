# Fix Scoring Rules Config Sync Issue

## 🐛 Vấn đề
Khi edit config trong Admin > Scoring Rules, dữ liệu hiển thị ngay trên màn hình user, nhưng sau khi F5 (refresh) thì data quay về như cũ, không thấy thay đổi trong admin.

## 🔍 Nguyên nhân

### 1. **Vấn đề về CORS Mode trong Google Sheets Service**
- **saveAdminConfig** sử dụng `mode: 'no-cors'` → Không thể kiểm tra response thành công hay thất bại
- **loadAdminConfig** sử dụng `mode: 'cors'` → Không nhất quán
- Với `mode: 'no-cors'`, response luôn là opaque, nghĩa là:
  - Không thể đọc response body
  - Không thể kiểm tra status code
  - Không biết request có thành công hay không
  - **Code nghĩ là đã save nhưng thực tế có thể thất bại**

### 2. **Thiếu Cache Busting**
- Khi load config từ Google Sheets, browser có thể cache response cũ
- Không có timestamp hoặc query parameter để force fresh data

### 3. **Thiếu Error Handling**
- Không có log chi tiết khi save/load config
- Không có validation xem request có thực sự thành công

### 4. **Build không có Environment Variables**
- File `.env` chỉ hoạt động trong development
- Khi build production, biến môi trường cần được embed vào bundle
- Nếu không rebuild sau khi thay đổi `.env`, ứng dụng sẽ không có `REACT_APP_ADMIN_CONFIG_SCRIPT_URL`

## ✅ Giải pháp đã áp dụng

### 1. **Sửa CORS Mode trong `googleSheetsService.js`**

#### Trước (Lỗi):
```javascript
// saveAdminConfig
const response = await fetch(this.adminConfigUrl, {
  method: 'POST',
  mode: 'no-cors',  // ❌ Không kiểm tra được response
  headers: {
    'Content-Type': 'text/plain'
  },
  body: JSON.stringify(data)
});

console.log(`✅ Admin config "${configName}" saved`);
return true;  // ❌ Luôn return true dù có thể thất bại
```

#### Sau (Fixed):
```javascript
// saveAdminConfig
const response = await fetch(this.adminConfigUrl, {
  method: 'POST',
  mode: 'cors',  // ✅ Kiểm tra được response
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const result = await response.json();

if (result.success) {
  console.log(`✅ Admin config "${configName}" saved successfully`);
  return true;
} else {
  console.error(`❌ Failed to save:`, result.error);
  return false;
}
```

### 2. **Thêm Cache Busting cho `loadAdminConfig`**

#### Trước:
```javascript
const response = await fetch(
  this.adminConfigUrl + `?action=getConfig&name=${configName}`,
  { method: 'GET', mode: 'cors' }
);
```

#### Sau:
```javascript
const cacheBuster = Date.now();
const response = await fetch(
  `${this.adminConfigUrl}?action=getConfig&name=${configName}&_=${cacheBuster}`,
  {
    method: 'GET',
    mode: 'cors',
    cache: 'no-store'  // ✅ Không dùng cache
  }
);
```

### 3. **Cải thiện ScoringRulesPage.js**

#### Thay đổi:
- **Trước**: Load từ localStorage → Background load từ Sheets (có thể im lặng thất bại)
- **Sau**: Load từ localStorage → **Always** load từ Sheets → Update UI & cache

```javascript
useEffect(() => {
  const loadConfig = async () => {
    try {
      // Fast path: Show cached data first
      const cachedConfig = localStorage.getItem('admin_scoring_rules_config');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        if (config.bannerImage) setBannerImage(config.bannerImage);
        if (config.rulesContent) setRulesContent(config.rulesContent);
        console.log('✅ Loaded from localStorage (instant)');
      }
      
      // Always fetch fresh data from Google Sheets
      console.log('🔄 Fetching latest from Google Sheets...');
      const sheetConfig = await googleSheetsService.loadAdminConfig('admin_scoring_rules_config');
      
      if (sheetConfig) {
        console.log('✅ Updated from Google Sheets:', sheetConfig);
        
        // Update UI with fresh data
        if (sheetConfig.bannerImage) setBannerImage(sheetConfig.bannerImage);
        if (sheetConfig.rulesContent) setRulesContent(sheetConfig.rulesContent);
        
        // Update cache
        localStorage.setItem('admin_scoring_rules_config', JSON.stringify(sheetConfig));
      }
    } catch (error) {
      console.error('❌ Failed to load config:', error);
    }
  };
  
  loadConfig();
}, []);
```

### 4. **Rebuild & Redeploy**

Để các biến môi trường trong `.env` được nhúng vào production build:

```bash
# 1. Build với environment variables
npm run build

# 2. Deploy lên Firebase
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
npx firebase-tools deploy --only hosting --project ambassador-7849e
```

## 🧪 Cách kiểm tra

### 1. **Kiểm tra trong Console (Chrome DevTools)**

Sau khi save config trong admin, mở Console và kiểm tra:

```
✅ Logs khi SAVE thành công:
📤 Saving admin config "admin_scoring_rules_config" to Google Sheets...
✅ Admin config "admin_scoring_rules_config" saved successfully

❌ Logs khi SAVE thất bại:
📤 Saving admin config "admin_scoring_rules_config" to Google Sheets...
❌ Failed to save admin config "admin_scoring_rules_config": [error message]
```

### 2. **Kiểm tra khi LOAD (F5)**

Sau khi refresh trang user:

```
✅ Logs khi LOAD thành công:
✅ Loaded from localStorage (instant)
🔄 Fetching latest from Google Sheets...
📥 Loading admin config "admin_scoring_rules_config" from Google Sheets...
✅ Admin config "admin_scoring_rules_config" loaded: {bannerImage: "...", rulesContent: "..."}
✅ Updated from Google Sheets
```

### 3. **Kiểm tra Google Sheets**

1. Mở Google Sheets linked với Apps Script
2. Tìm sheet **"AdminConfigs"**
3. Kiểm tra row có `configName` = `admin_scoring_rules_config`
4. Cột `configData` phải chứa JSON của config vừa save
5. Cột `timestamp` phải là thời gian mới nhất

## 🚀 Deployment Workflow

Mỗi lần thay đổi code hoặc environment variables:

```bash
# 1. Kiểm tra file .env có đầy đủ không
cat .env | grep ADMIN_CONFIG

# 2. Build production
npm run build

# 3. Deploy
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
npx firebase-tools deploy --only hosting --project ambassador-7849e
```

## 📝 Notes quan trọng

1. **File `.env` chỉ hoạt động trong development**
   - `npm start` → Đọc từ `.env`
   - `npm run build` → Embed vào bundle
   - Production → Không đọc `.env` nữa

2. **CORS Mode quan trọng**
   - `mode: 'no-cors'` → Không kiểm tra được response (không dùng cho API calls)
   - `mode: 'cors'` → Có thể kiểm tra response và handle errors

3. **Cache Busting**
   - Luôn thêm timestamp query parameter khi fetch data quan trọng
   - Dùng `cache: 'no-store'` để tránh browser cache

4. **Error Handling**
   - Luôn check `response.ok` và parse JSON
   - Log chi tiết để debug

## 🔗 Related Files

- `src/services/googleSheetsService.js` - Service để gọi Google Sheets API
- `src/pages/AdminScoringRulesConfig.js` - Admin page để edit config
- `src/pages/ScoringRulesPage.js` - User page để hiển thị config
- `COMPLETE_GOOGLE_APPS_SCRIPT_V7.js` - Google Apps Script backend
- `.env` - Environment variables (không commit vào Git)

## ✨ Kết quả

Sau khi fix:
- ✅ Save config trong admin → Lưu thành công vào Google Sheets
- ✅ User F5 → Load data mới nhất từ Google Sheets
- ✅ Sync cross-device → Mọi thiết bị đều thấy data mới
- ✅ Error handling → Biết rõ khi nào save/load thất bại
- ✅ Logging chi tiết → Dễ debug

---

**Date**: 2025-10-19  
**Fixed by**: GitHub Copilot  
**Status**: ✅ Resolved & Deployed

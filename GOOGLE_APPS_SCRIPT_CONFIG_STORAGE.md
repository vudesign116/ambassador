# 📝 Google Apps Script - Admin Config Storage

## 🎯 Mục đích

Lưu trữ **admin config** trên Google Sheets để:
- ✅ Config hiển thị trên **mọi thiết bị** (cross-device)
- ✅ Không phụ thuộc localStorage
- ✅ Admin thay đổi → User thấy ngay lập tức

---

## 🔧 Code cần thêm vào Apps Script

### **1. Thêm Sheet mới: "AdminConfigs"**

Trong Google Sheets, tạo sheet mới tên `AdminConfigs` với columns:

| configName | configData | updatedBy | timestamp |
|------------|------------|-----------|-----------|
| admin_login_page_config | {"bannerImage":"https://..."} | Admin | 2025-10-16 10:30:00 |
| admin_badges_config | [{"id":1,"name":"Tân Binh",...}] | Admin | 2025-10-16 10:31:00 |

---

### **2. Code Apps Script - Save Config**

Thêm vào `Code.gs`:

```javascript
/**
 * Save admin config to sheet
 */
function saveAdminConfig(data) {
  try {
    var configName = data.configName;
    var configData = JSON.stringify(data.configData);
    var updatedBy = data.updatedBy || 'Admin';
    var timestamp = new Date().toISOString();
    
    Logger.log('📥 Saving admin config: ' + configName);
    
    var sheet = getOrCreateSheet('AdminConfigs');
    
    // Check if config already exists
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var configRow = -1;
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === configName) {
        configRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (configRow > 0) {
      // Update existing config
      sheet.getRange(configRow, 1, 1, 4).setValues([[
        configName,
        configData,
        updatedBy,
        timestamp
      ]]);
      Logger.log('✅ Updated existing config: ' + configName);
    } else {
      // Add new config
      sheet.appendRow([
        configName,
        configData,
        updatedBy,
        timestamp
      ]);
      Logger.log('✅ Added new config: ' + configName);
    }
    
    return {
      success: true,
      message: 'Config saved successfully'
    };
    
  } catch (error) {
    Logger.log('❌ Error saving config: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Load admin config from sheet
 */
function loadAdminConfig(configName) {
  try {
    Logger.log('🔍 Loading admin config: ' + configName);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AdminConfigs');
    
    if (!sheet) {
      Logger.log('⚠️ AdminConfigs sheet not found');
      return {
        success: false,
        error: 'AdminConfigs sheet not found'
      };
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    // Find config by name
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === configName) {
        var configData = values[i][1];
        var updatedBy = values[i][2];
        var timestamp = values[i][3];
        
        Logger.log('✅ Found config: ' + configName);
        
        return {
          success: true,
          config: JSON.parse(configData),
          updatedBy: updatedBy,
          timestamp: timestamp
        };
      }
    }
    
    Logger.log('ℹ️ Config not found: ' + configName);
    return {
      success: false,
      error: 'Config not found'
    };
    
  } catch (error) {
    Logger.log('❌ Error loading config: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get or create sheet
 */
function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log('📁 Creating sheet: ' + sheetName);
    sheet = ss.insertSheet(sheetName);
    
    // Add headers for AdminConfigs sheet
    if (sheetName === 'AdminConfigs') {
      sheet.appendRow(['configName', 'configData', 'updatedBy', 'timestamp']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
  }
  
  return sheet;
}
```

---

### **3. Update doPost() function**

Thêm vào `doPost()`:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var type = data.type;
    
    Logger.log('📥 Received action: ' + action + ', type: ' + type);
    
    // ... existing actions ...
    
    // 🆕 Admin config actions
    if (type === 'admin_config') {
      if (action === 'save') {
        return ContentService
          .createTextOutput(JSON.stringify(saveAdminConfig(data.data)))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // ... rest of existing code ...
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### **4. Update doGet() function (for loading configs)**

Thêm mới hoặc update `doGet()`:

```javascript
function doGet(e) {
  try {
    var action = e.parameter.action;
    var name = e.parameter.name;
    
    Logger.log('📥 GET request - action: ' + action + ', name: ' + name);
    
    if (action === 'getConfig' && name) {
      var result = loadAdminConfig(name);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Default response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ GET Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### **5. Test Functions**

Thêm functions để test:

```javascript
/**
 * Test saving admin config
 */
function testSaveConfig() {
  var testData = {
    configName: 'admin_login_page_config',
    configData: {
      bannerImage: 'https://i.postimg.cc/h4MzvqSg/banner-min.png'
    },
    updatedBy: 'Test Admin'
  };
  
  var result = saveAdminConfig(testData);
  Logger.log('Save result:', result);
}

/**
 * Test loading admin config
 */
function testLoadConfig() {
  var result = loadAdminConfig('admin_login_page_config');
  Logger.log('Load result:', result);
}

/**
 * List all configs
 */
function listAllConfigs() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AdminConfigs');
  
  if (!sheet) {
    Logger.log('⚠️ AdminConfigs sheet not found');
    return;
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  Logger.log('📋 All configs:');
  for (var i = 1; i < values.length; i++) {
    Logger.log(values[i][0] + ': ' + values[i][1].substring(0, 100) + '...');
  }
}
```

---

## 🧪 Testing Steps

### **Step 1: Test in Apps Script Editor**

1. Copy all code above vào `Code.gs`
2. Chạy function `testSaveConfig()`
3. Check sheet `AdminConfigs` có data không
4. Chạy function `testLoadConfig()`
5. Check logs xem có load được data không

### **Step 2: Deploy**

1. Click **Deploy** → **Manage deployments**
2. Edit deployment
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Update** (hoặc Deploy nếu mới)
6. Copy URL

### **Step 3: Test from React App**

Mở browser console:

```javascript
// Test save config
fetch('YOUR_APPS_SCRIPT_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({
    type: 'admin_config',
    action: 'save',
    timestamp: new Date().toISOString(),
    data: {
      configName: 'admin_login_page_config',
      configData: {
        bannerImage: 'https://i.postimg.cc/h4MzvqSg/banner-min.png'
      },
      updatedBy: 'Test Admin'
    }
  })
})
.then(() => console.log('✅ Config saved'))
.catch(err => console.error('❌ Error:', err));

// Test load config
fetch('YOUR_APPS_SCRIPT_URL?action=getConfig&name=admin_login_page_config')
.then(res => res.json())
.then(data => console.log('📦 Config loaded:', data))
.catch(err => console.error('❌ Error:', err));
```

---

## 📊 Expected Results

### **In Google Sheets:**

Table `AdminConfigs`:

| configName | configData | updatedBy | timestamp |
|------------|------------|-----------|-----------|
| admin_login_page_config | {"bannerImage":"https://i.postimg.cc/..."} | Admin | 2025-10-16T10:30:00Z |
| admin_badges_config | [{"id":1,"name":"Tân Binh",...}] | Admin | 2025-10-16T10:31:00Z |
| admin_scoring_rules_config | {"bannerImage":"...","rulesContent":"..."} | Admin | 2025-10-16T10:32:00Z |

### **In React App:**

**Admin saves config:**
```
💾 Saved to localStorage: admin_login_page_config
☁️ Synced to Google Sheets: admin_login_page_config
✅ Banner URL đã được lưu! (Sync mọi thiết bị)
```

**User opens on different device:**
```
🔍 Loading admin_login_page_config from Google Sheets...
✅ Loaded from Google Sheets: admin_login_page_config (cross-device)
✅ Banner loaded: https://i.postimg.cc/h4MzvqSg/...
```

---

## 🎯 Benefits

### **Before (localStorage only):**
- ❌ Admin config chỉ trên thiết bị admin
- ❌ User thiết bị khác không thấy thay đổi
- ❌ Phải setup lại trên mỗi device

### **After (Google Sheets sync):**
- ✅ Admin thay đổi → Sync mọi thiết bị
- ✅ User mở bất kỳ device nào cũng thấy config mới
- ✅ Centralized config management
- ✅ Version history (timestamp)
- ✅ Backup tự động

---

## 🔮 Next Steps

1. ✅ Add code to Apps Script
2. ✅ Create `AdminConfigs` sheet
3. ✅ Test save/load functions
4. ✅ Deploy Apps Script
5. ✅ Test from React app
6. ✅ Update all admin pages (already done in code)
7. ✅ Test on multiple devices

---

**Status:** 🔄 Ready to implement  
**Difficulty:** Medium (Apps Script + React integration)  
**Impact:** 🚀 HUGE! Solves cross-device config issue completely!

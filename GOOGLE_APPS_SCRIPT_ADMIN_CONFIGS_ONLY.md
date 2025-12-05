# 🎯 Google Apps Script - Admin Configs Storage ONLY

## 📋 Mục đích

Script này **CHỈ** lưu trữ admin configs (banner images, text content, etc.) để sync cross-device.

**KHÔNG** động đến survey/activity/reward data (đã có sheet riêng).

---

## 🔧 Script hoàn chỉnh

Copy toàn bộ script này vào Apps Script của sheet mới:

```javascript
/**
 * Google Apps Script - Admin Configs Storage
 * 
 * Purpose: Store admin panel configurations for cross-device sync
 * - Login page banner
 * - Dashboard badges
 * - Introduction gifts
 * - Scoring rules
 * - Notification configs
 * - Survey banners
 * - Mini game thumbnails
 * 
 * Version: 1.0
 * Last Updated: 2025-10-16
 */

/**
 * Handle POST requests - Save admin config
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type;
    
    Logger.log('📥 Received request - type: ' + type);
    
    if (type === 'admin_config') {
      const configData = data.data;
      const result = saveAdminConfig(configData);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Unknown type
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Unknown type: ' + type
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('❌ POST Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests - Load admin config
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const name = e.parameter.name;
    
    Logger.log('📥 GET request - action: ' + action + ', name: ' + name);
    
    if (action === 'getConfig' && name) {
      const result = loadAdminConfig(name);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Invalid request
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid request. Use: ?action=getConfig&name=CONFIG_NAME'
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

/**
 * Save admin config
 * Creates or updates config in AdminConfigs sheet
 */
function saveAdminConfig(data) {
  try {
    const configName = data.configName;
    const configData = JSON.stringify(data.configData);
    const updatedBy = data.updatedBy || 'Admin';
    const timestamp = new Date().toISOString();
    
    Logger.log('💾 Saving config: ' + configName);
    
    // Get or create sheet
    const sheet = getOrCreateAdminConfigsSheet();
    
    // Find existing config row
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let configRow = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === configName) {
        configRow = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    // Update or insert
    if (configRow > 0) {
      // Update existing
      sheet.getRange(configRow, 1, 1, 4).setValues([[
        configName,
        configData,
        updatedBy,
        timestamp
      ]]);
      Logger.log('✅ Updated config: ' + configName);
    } else {
      // Insert new
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
      message: 'Config saved successfully',
      configName: configName,
      timestamp: timestamp
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
 * Load admin config
 * Retrieves config from AdminConfigs sheet by name
 */
function loadAdminConfig(configName) {
  try {
    Logger.log('🔍 Loading config: ' + configName);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('AdminConfigs');
    
    if (!sheet) {
      Logger.log('⚠️ AdminConfigs sheet not found');
      return {
        success: false,
        error: 'AdminConfigs sheet not found'
      };
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Search for config
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === configName) {
        const configData = values[i][1];
        const updatedBy = values[i][2];
        const timestamp = values[i][3];
        
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
      error: 'Config not found: ' + configName
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
 * Get or create AdminConfigs sheet
 * Creates sheet with proper headers if not exists
 */
function getOrCreateAdminConfigsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('AdminConfigs');
  
  if (!sheet) {
    Logger.log('📁 Creating AdminConfigs sheet...');
    sheet = ss.insertSheet('AdminConfigs');
    
    // Set headers
    const headers = ['configName', 'configData', 'updatedBy', 'timestamp'];
    sheet.getRange(1, 1, 1, 4).setValues([headers]);
    
    // Style headers
    sheet.getRange(1, 1, 1, 4)
      .setBackground('#ff6b6b')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Set column widths
    sheet.setColumnWidth(1, 250);  // configName
    sheet.setColumnWidth(2, 600);  // configData (wider for JSON)
    sheet.setColumnWidth(3, 150);  // updatedBy
    sheet.setColumnWidth(4, 180);  // timestamp
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    Logger.log('✅ AdminConfigs sheet created');
  }
  
  return sheet;
}

/**
 * Test function - Run this to test the script
 */
function testSaveConfig() {
  const testData = {
    configName: 'admin_login_page_config',
    configData: {
      bannerImage: 'https://example.com/banner.jpg'
    },
    updatedBy: 'Test User'
  };
  
  const result = saveAdminConfig(testData);
  Logger.log('Test result: ' + JSON.stringify(result));
}

/**
 * Test function - Run this to test loading
 */
function testLoadConfig() {
  const result = loadAdminConfig('admin_login_page_config');
  Logger.log('Load result: ' + JSON.stringify(result));
}
```

---

## 🚀 Deployment Steps

### **1. Paste script vào Apps Script Editor**
- Extensions → Apps Script
- Xóa code mặc định
- Paste script trên vào
- Save (Ctrl+S)

### **2. Test script (Optional)**
Chạy test để đảm bảo script hoạt động:

```javascript
// Run: testSaveConfig
// Expected: Tạo sheet "AdminConfigs" và thêm 1 row
```

### **3. Deploy as Web App**
1. **Deploy** → **New deployment**
2. **Type**: Web app
3. **Description**: "Admin Configs API v1"
4. **Execute as**: Me (your email)
5. **Who has access**: Anyone
6. Click **Deploy**
7. **Copy URL** → Gửi cho tôi!

---

## 📊 Cấu trúc Sheet

Sau khi deploy và có request đầu tiên, sheet sẽ tự tạo:

| configName | configData | updatedBy | timestamp |
|------------|------------|-----------|-----------|
| admin_login_page_config | {"bannerImage":"https://..."} | Admin | 2025-10-16T10:30:00Z |
| admin_badges_config | [{"id":1,"name":"Tân Binh"...}] | Admin | 2025-10-16T10:31:00Z |
| admin_introduction_config | {"gifts":[...]} | Admin | 2025-10-16T10:32:00Z |

---

## 🎯 Configs sẽ lưu

Script này sẽ lưu **7 loại config**:

1. **admin_login_page_config** - Login banner
2. **admin_badges_config** - Dashboard badges (5 levels)
3. **admin_introduction_config** - Gifts
4. **admin_mini_games_config** - Game thumbnails
5. **admin_scoring_rules_config** - Scoring rules banner
6. **admin_notification_config** - Notification images
7. **admin_survey_config** - Survey banners

---

## ✅ Sau khi deploy

**Gửi cho tôi:**
```
URL Apps Script: https://script.google.com/macros/s/AKfycbxxx.../exec
```

Tôi sẽ:
1. ✅ Update React app với URL mới
2. ✅ Build & deploy
3. ✅ Test cross-device
4. ✅ Confirm hoạt động!

---

## 🔒 Bảo mật

- ✅ Script chỉ có 2 functions: `doPost` (save) và `doGet` (load)
- ✅ Không xóa data
- ✅ Chỉ update/insert configs
- ✅ Log đầy đủ trong Executions tab

---

## 📞 Support

**Nếu gặp lỗi:**
1. Check **Executions** tab để xem logs
2. Check **AdminConfigs** sheet có tạo chưa
3. Test bằng `testSaveConfig()` function

**Ready to deploy?** 🚀

# Google Apps Script - Survey Support Update

## 📋 Overview
Cập nhật Google Apps Script để lưu trữ và quản lý surveys trong Google Sheets.

## 🎯 Mục đích
- Lưu survey definitions (câu hỏi, tiêu đề, mô tả) vào Google Sheets
- Đọc danh sách surveys
- Update/Delete surveys
- Lưu survey responses (câu trả lời của user)

---

## 📝 CÁC BƯỚC CẬP NHẬT

### BƯỚC 1: Mở Google Apps Script
1. Vào Google Sheets của bạn (URL từ REACT_APP_GOOGLE_SCRIPT_URL)
2. Click **Extensions** → **Apps Script**
3. Mở file `Code.gs`

### BƯỚC 2: THÊM functions sau vào cuối file (trước dòng cuối):

```javascript
// =============================================
// SURVEY MANAGEMENT
// =============================================

/**
 * Save survey to "Surveys" sheet
 */
function saveSurvey(surveyData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Surveys');
  
  // Create sheet if doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet('Surveys');
    sheet.appendRow([
      'Survey ID',
      'Title',
      'Description',
      'Start Date',
      'End Date',
      'Is Active',
      'Questions (JSON)',
      'Banner URL',
      'Created At',
      'Updated At'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Check if survey exists (by ID)
  var data = sheet.getDataRange().getValues();
  var surveyRow = -1;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === surveyData.id) {
      surveyRow = i + 1; // +1 because rows are 1-indexed
      break;
    }
  }
  
  // Prepare row data
  var rowData = [
    surveyData.id || '',
    surveyData.title || '',
    surveyData.description || '',
    surveyData.startDate || '',
    surveyData.endDate || '',
    surveyData.isActive !== undefined ? surveyData.isActive : true,
    JSON.stringify(surveyData.questions || []),
    surveyData.bannerUrl || '',
    surveyData.createdAt || new Date().toISOString(),
    new Date().toISOString() // updatedAt
  ];
  
  if (surveyRow > 0) {
    // Update existing survey
    sheet.getRange(surveyRow, 1, 1, 10).setValues([rowData]);
    Logger.log('✅ Updated survey: ' + surveyData.id);
  } else {
    // Add new survey
    sheet.appendRow(rowData);
    Logger.log('✅ Created survey: ' + surveyData.id);
  }
  
  return { success: true, id: surveyData.id };
}

/**
 * Get all surveys from "Surveys" sheet
 */
function getAllSurveys() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Surveys');
  
  if (!sheet) {
    Logger.log('ℹ️ Surveys sheet not found');
    return { success: true, data: [] };
  }
  
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    Logger.log('ℹ️ No surveys found');
    return { success: true, data: [] };
  }
  
  var surveys = [];
  
  // Skip header row (index 0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    
    // Skip empty rows
    if (!row[0]) continue;
    
    try {
      surveys.push({
        id: row[0],
        title: row[1],
        description: row[2],
        startDate: row[3],
        endDate: row[4],
        isActive: row[5],
        questions: JSON.parse(row[6] || '[]'),
        bannerUrl: row[7],
        createdAt: row[8],
        updatedAt: row[9]
      });
    } catch (e) {
      Logger.log('⚠️ Error parsing survey row ' + i + ': ' + e);
    }
  }
  
  Logger.log('✅ Loaded ' + surveys.length + ' surveys');
  return { success: true, data: surveys };
}

/**
 * Delete survey by ID
 */
function deleteSurvey(surveyId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Surveys');
  
  if (!sheet) {
    Logger.log('ℹ️ Surveys sheet not found');
    return { success: false, error: 'Surveys sheet not found' };
  }
  
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === surveyId) {
      sheet.deleteRow(i + 1); // +1 because rows are 1-indexed
      Logger.log('✅ Deleted survey: ' + surveyId);
      return { success: true };
    }
  }
  
  Logger.log('⚠️ Survey not found: ' + surveyId);
  return { success: false, error: 'Survey not found' };
}
```

### BƯỚC 3: CẬP NHẬT hàm `doPost()` để handle survey data:

Tìm function `doPost(e)` và thêm case cho survey:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var type = data.type;
    
    // ... existing cases ...
    
    // ✅ ADD THIS CASE:
    else if (type === 'survey') {
      // Save survey definition
      var result = saveSurvey(data.data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    else if (type === 'delete_survey') {
      // Delete survey
      var result = deleteSurvey(data.data.surveyId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... rest of function ...
  } catch (error) {
    Logger.log('❌ Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### BƯỚC 4: CẬP NHẬT hàm `doGet()` để return surveys:

Tìm function `doGet(e)` và thêm:

```javascript
function doGet(e) {
  try {
    var action = e.parameter.action;
    
    // ... existing actions ...
    
    // ✅ ADD THIS:
    if (action === 'getSurveys') {
      var result = getAllSurveys();
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... rest of function ...
  } catch (error) {
    Logger.log('❌ Error in doGet: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### BƯỚC 5: DEPLOY

1. Click **Deploy** → **New deployment**
2. Click ⚙️ icon → Select **Web app**
3. Description: `Added survey management`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Copy the **Web app URL** (should be same as before)
8. Click **Done**

---

## ✅ KẾT QUẢ

Sau khi deploy, Google Sheets sẽ có:

### Sheet "Surveys":
| Survey ID | Title | Description | Start Date | End Date | Is Active | Questions (JSON) | Banner URL | Created At | Updated At |
|-----------|-------|-------------|------------|----------|-----------|------------------|------------|------------|------------|
| survey_123 | Khảo sát Q1 | Mô tả... | 2025-01-01 | 2025-03-31 | TRUE | [...] | https://... | 2025-01-16 | 2025-01-16 |

---

## 🧪 TEST

1. **Tạo survey mới** trong admin panel
2. Check Google Sheets → Sheet "Surveys" → Survey xuất hiện
3. **Xem survey** trên phone → Survey hiển thị đúng
4. **Update survey** → Row trong sheet được update
5. **Delete survey** → Row bị xóa khỏi sheet

---

## 📌 LƯU Ý

- Survey responses vẫn lưu vào sheet "Survey Responses" (đã có sẵn)
- Survey definitions lưu vào sheet "Surveys" (mới)
- Nếu Google Sheets fail → Fallback sang Firebase (backup)
- Questions được lưu dưới dạng JSON string để giữ cấu trúc phức tạp

---

## 🔗 LIÊN QUAN

- `src/services/surveyService.js` - Updated to use Google Sheets
- `src/services/googleSheetsService.js` - Added survey management functions
- Survey responses vẫn dùng existing `syncSurveyResponse()`

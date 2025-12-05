/**
 * Google Apps Script V7 - Complete with Survey Management
 * 
 * Features:
 * - Dynamic columns per survey (1-10+ questions)
 * - Survey Definition Storage (questions, title, description)
 * - Survey Response Tracking
 * - Activity tracking (category_viewed, document_viewed, etc.)
 * - Reward selections tracking
 * - Admin configs cross-device sync
 * 
 * Version: 7.0
 * Last Updated: 2025-01-16
 */

// =============================================
// MAIN HANDLERS
// =============================================

/**
 * Return local ISO-like string without trailing Z.
 * Examples: 2025-10-09T15:41:35.773
 * Accepts optional input timestamp (ISO string) or Date.
 */
function formatLocalISOString(inputTimestamp) {
  var date = inputTimestamp ? new Date(String(inputTimestamp).replace('Z', '')) : new Date();
  // Adjust to UTC+7 (Vietnam)
  date.setHours(date.getHours() + 7);

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var day = String(date.getDate()).padStart(2, '0');
  var hours = String(date.getHours()).padStart(2, '0');
  var minutes = String(date.getMinutes()).padStart(2, '0');
  var seconds = String(date.getSeconds()).padStart(2, '0');
  var ms = String(date.getMilliseconds()).padStart(3, '0');

  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + ms;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var syncType = data.type || data.syncType;
    var action = data.action;
    
    Logger.log('📥 Received sync: ' + syncType + ', action: ' + action);
    
    // Handle different types
    if (syncType === 'survey_response') {
      return handleSurveyResponse(data);
    }
    else if (syncType === 'survey') {
      // Survey definition (questions, title, description)
      return handleSaveSurvey(data);
    }
    else if (syncType === 'delete_survey') {
      return handleDeleteSurvey(data);
    }
    else if (syncType === 'activity') {
      return handleActivity(data);
    }
    else if (syncType === 'reward_selection') {
      return handleRewardSelection(data);
    }
    else if (syncType === 'admin_config') {
      // Admin config save
      return ContentService
        .createTextOutput(JSON.stringify(saveAdminConfig(data.data)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unknown sync type: ' + syncType
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('❌ Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    var name = e.parameter.name;
    
    Logger.log('📥 GET request - action: ' + action);
    
    if (action === 'getConfig' && name) {
      // Load admin config
      var result = loadAdminConfig(name);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    else if (action === 'getSurveys') {
      // Get all surveys
      var result = getAllSurveys();
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
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

// =============================================
// SURVEY MANAGEMENT
// =============================================

/**
 * Save survey definition to "Surveys" sheet
 */
function handleSaveSurvey(data) {
  try {
    var surveyData = data.data;
    var result = saveSurvey(surveyData);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('❌ Error saving survey: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
    sheet.getRange(1, 1, 1, 10)
      .setBackground('#722ed1')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Set column widths
    sheet.setColumnWidth(1, 150);  // Survey ID
    sheet.setColumnWidth(2, 200);  // Title
    sheet.setColumnWidth(3, 300);  // Description
    sheet.setColumnWidth(4, 150);  // Start Date
    sheet.setColumnWidth(5, 150);  // End Date
    sheet.setColumnWidth(6, 100);  // Is Active
    sheet.setColumnWidth(7, 400);  // Questions (JSON)
    sheet.setColumnWidth(8, 300);  // Banner URL
    sheet.setColumnWidth(9, 150);  // Created At
    sheet.setColumnWidth(10, 150); // Updated At
  }
  
  // Check if survey exists (by ID)
  var data = sheet.getDataRange().getValues();
  var surveyRow = -1;
  
  // Convert both IDs to string for comparison (handle number vs string mismatch)
  var searchId = String(surveyData.id);
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === searchId) {
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
    surveyData.createdAt || formatLocalISOString(),
    formatLocalISOString() // updatedAt
  ];
  
  if (surveyRow > 0) {
    // Update existing survey
    sheet.getRange(surveyRow, 1, 1, 10).setValues([rowData]);
    Logger.log('✅ Updated survey: ' + surveyData.id);
  } else {
    // Add new survey
    sheet.appendRow(rowData);
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 10)
      .setBorder(true, true, true, true, true, true);
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
      // Convert ID to number if it's a valid number string
      var surveyId = row[0];
      if (typeof surveyId === 'string' && !isNaN(surveyId)) {
        surveyId = Number(surveyId);
      }
      
      surveys.push({
        id: surveyId,
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
function handleDeleteSurvey(data) {
  try {
    var surveyId = data.data.surveyId;
    var result = deleteSurvey(surveyId);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('❌ Error deleting survey: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteSurvey(surveyId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Surveys');
  
  if (!sheet) {
    Logger.log('ℹ️ Surveys sheet not found');
    return { success: false, error: 'Surveys sheet not found' };
  }
  
  var data = sheet.getDataRange().getValues();
  var searchId = String(surveyId);
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === searchId) {
      sheet.deleteRow(i + 1); // +1 because rows are 1-indexed
      Logger.log('✅ Deleted survey: ' + surveyId);
      return { success: true };
    }
  }
  
  Logger.log('⚠️ Survey not found: ' + surveyId);
  return { success: false, error: 'Survey not found' };
}

// =============================================
// SURVEY RESPONSES (Dynamic Columns)
// =============================================

/**
 * Handle Survey Response - Dynamic columns per survey
 * Each survey gets its own tab/sheet
 */
function handleSurveyResponse(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseData = data.data || data;
  var questions = responseData.questions || [];
  
  // Create sheet name from survey title or ID
  var surveyTitle = responseData.surveyTitle || 'Survey';
  var surveyId = responseData.surveyId || Date.now();
  
  // Clean sheet name (remove special chars, max 100 chars)
  var sheetName = surveyTitle
    .replace(/[\/\\\?\*\[\]]/g, '') // Remove invalid chars
    .substring(0, 100);
  
  // Add ID suffix if sheet name exists
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || isNewSurvey(sheet, questions)) {
    // Try with ID suffix if exists
    sheetName = sheetName + '_' + surveyId.toString().slice(-6);
    sheet = ss.getSheetByName(sheetName);
  }
  
  // Create sheet if not exists
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Build dynamic headers based on questions
    var headers = [
      'STT',
      'Mã DMS (thêm)',
      'Số điện thoại',
      'Thời gian'
    ];
    
    // Add question columns dynamically
    questions.forEach(function(q, index) {
      var questionText = q.question || q.text || q.title || ('Câu ' + (index + 1));
      headers.push('Câu ' + (index + 1) + ': ' + questionText);
    });
    
    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1890ff')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    // Set column widths dynamically
    sheet.setColumnWidth(1, 50);   // STT
    sheet.setColumnWidth(2, 150);  // Mã DMS
    sheet.setColumnWidth(3, 120);  // Phone
    sheet.setColumnWidth(4, 180);  // Thời gian
    
    // Question columns - wider
    for (var i = 5; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 250);
    }
    
    sheet.setFrozenRows(1);
  }
  
  // Get answers
  var answers = responseData.answers || {};
  
  // Convert answers to readable format
  var readableAnswers = convertAnswersToReadable(answers, questions);
  
  // Format timestamp to Vietnam timezone in ISO-like format without trailing Z
  var formattedTime = '';
  try {
  var timestamp = responseData.submittedAt || data.timestamp || new Date().toISOString();
  formattedTime = formatLocalISOString(timestamp);
  } catch (error) {
    formattedTime = formatLocalISOString();
  }
  
  // Get next STT
  var lastRow = sheet.getLastRow();
  var stt = lastRow;
  
  // Prepare row data with dynamic columns
  var rowData = [
    stt,
    "'" + String(responseData.userId || responseData.ma_kh_dms || ''), // ✅ Force string with prefix quote
    "'" + (responseData.phoneNumber || ''),
    formattedTime
  ];
  
  // Add all answers dynamically
  readableAnswers.forEach(function(answer) {
    rowData.push(answer || '-');
  });
  
  // Append row
  sheet.appendRow(rowData);
  
  // Format new row
  var newRow = sheet.getLastRow();
  sheet.getRange(newRow, 1, 1, rowData.length)
    .setHorizontalAlignment('left')
    .setBorder(true, true, true, true, true, true);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Survey response synced',
    sheetName: sheetName,
    questionCount: questions.length,
    timestamp: formattedTime
  })).setMimeType(ContentService.MimeType.JSON);
}

function isNewSurvey(sheet, newQuestions) {
  if (!sheet) return true;
  
  try {
    var lastCol = sheet.getLastColumn();
    var expectedCols = 4 + newQuestions.length;
    return lastCol !== expectedCols;
  } catch (e) {
    return true;
  }
}

function convertAnswersToReadable(answers, questions) {
  var readable = [];
  
  questions.forEach(function(question) {
    var answer = answers[question.id];
    
    if (answer === undefined || answer === null) {
      readable.push('-');
      return;
    }
    
    switch(question.type) {
      case 'rating':
        readable.push(String(answer) + ' ⭐');
        break;
        
      case 'single-choice':
        try {
          var cleanAnswer = answer;
          if (typeof answer === 'string') {
            // Remove array brackets and quotes: ["Có"] -> Có
            cleanAnswer = answer.replace(/^\["|"\]$/g, '').replace(/\\"/g, '"');
          }
          
          // If array, take first item
          if (Array.isArray(answer) && answer.length > 0) {
            cleanAnswer = answer[0];
          }
          
          if (question.options && Array.isArray(question.options)) {
            var singleOption = question.options.find(function(opt) { 
              return opt && opt.value === cleanAnswer; 
            });
            readable.push(singleOption && singleOption.label ? singleOption.label : String(cleanAnswer));
          } else {
            readable.push(String(cleanAnswer));
          }
        } catch (e) {
          readable.push(String(answer));
        }
        break;
        
      case 'multiple-choice':
        try {
          var answerArray = answer;
          
          if (typeof answer === 'string') {
            try {
              answerArray = JSON.parse(answer);
            } catch (parseError) {
              answerArray = [answer];
            }
          }
          
          if (Array.isArray(answerArray) && question.options && Array.isArray(question.options)) {
            var labels = [];
            answerArray.forEach(function(val) {
              var cleanVal = String(val).replace(/^["']|["']$/g, '');
              var opt = question.options.find(function(o) { 
                return o && o.value === cleanVal; 
              });
              labels.push(opt && opt.label ? opt.label : cleanVal);
            });
            readable.push(labels.join(', '));
          } else {
            var cleanStr = String(answer).replace(/^\["|"\]$/g, '').replace(/\\"/g, '"');
            readable.push(cleanStr);
          }
        } catch (e) {
          readable.push(String(answer));
        }
        break;
        
      case 'text':
      case 'textarea':
        readable.push(String(answer));
        break;
        
      default:
        try {
          if (typeof answer === 'object') {
            readable.push(JSON.stringify(answer));
          } else {
            readable.push(String(answer));
          }
        } catch (e) {
          readable.push(String(answer));
        }
    }
  });
  
  return readable;
}

// =============================================
// ACTIVITY TRACKING
// =============================================

function handleActivity(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Activities');
  
  if (!sheet) {
    sheet = ss.insertSheet('Activities');
    
    var headers = [
      'Activity ID',
      'Mã DMS',
      'Phone',
      'User Name',
      'Activity Type',
      'Description',
      'Page',
      'Duration (seconds)',
      'Timestamp',
      'Metadata'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#52c41a')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 150);
    sheet.setColumnWidth(6, 300);
    sheet.setColumnWidth(7, 150);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 180);
    sheet.setColumnWidth(10, 300);
    
    sheet.setFrozenRows(1);
  }
  
  var activityData = data.data || data;
  
  var formattedTime = '';
  try {
  var timestamp = activityData.timestamp || new Date().toISOString();
  formattedTime = formatLocalISOString(timestamp);
  } catch (error) {
    formattedTime = formatLocalISOString();
  }
  
  var rowData = [
    activityData.activityId || '',
    activityData.userId || '',
    "'" + (activityData.phoneNumber || ''),
    activityData.userName || '',
    activityData.activityType || '',
    activityData.description || '',
    activityData.page || '',
    activityData.duration || 0,
    formattedTime,
    JSON.stringify(activityData.metadata || {})
  ];
  
  sheet.appendRow(rowData);
  
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, rowData.length)
    .setHorizontalAlignment('left')
    .setBorder(true, true, true, true, true, true);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Activity synced'
  })).setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// REWARD SELECTIONS
// =============================================

function handleRewardSelection(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Reward Selections');
  
  if (!sheet) {
    sheet = ss.insertSheet('Reward Selections');
    
    var headers = [
      'Mã DMS',
      'SĐT', 
      'Tên',
      'Quà tháng (value)',
      'Quà DGCC (value1)',
      'Quà CGSP (value2)',
      'Thời gian'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4CAF50')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 300);
    sheet.setColumnWidth(5, 300);
    sheet.setColumnWidth(6, 300);
    sheet.setColumnWidth(7, 180);
    
    sheet.setFrozenRows(1);
  }
  
  var formattedTime = '';
  try {
  var dateStr = data.inserted_at || new Date().toISOString();
  formattedTime = formatLocalISOString(dateStr);
  } catch (error) {
    formattedTime = formatLocalISOString();
  }
  
  var rowData = [
    data.ma_kh_dms || '',
    "'" + (data.phone || ''),
    data.user_name || '',
    data.value || '',
    data.value1 || '',
    data.value2 || '',
    formattedTime
  ];
  
  sheet.appendRow(rowData);
  
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, rowData.length)
    .setHorizontalAlignment('left')
    .setBorder(true, true, true, true, true, true);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Reward selection synced',
    timestamp: formattedTime
  })).setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// ADMIN CONFIGS
// =============================================

function saveAdminConfig(data) {
  try {
    var configName = data.configName;
    var configData = JSON.stringify(data.configData);
    var updatedBy = data.updatedBy || 'Admin';
  var timestamp = new Date().toISOString();
    
    Logger.log('📥 Saving admin config: ' + configName);
    
    var sheet = getOrCreateSheet('AdminConfigs');
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var configRow = -1;
    
    for (var i = 1; i < values.length; i++) {
      if (values[i][0] === configName) {
        configRow = i + 1;
        break;
      }
    }
    
    if (configRow > 0) {
      sheet.getRange(configRow, 1, 1, 4).setValues([[
        configName,
        configData,
        updatedBy,
        formatLocalISOString(timestamp)
      ]]);
      Logger.log('✅ Updated existing config: ' + configName);
    } else {
      sheet.appendRow([
        configName,
        configData,
        updatedBy,
        formatLocalISOString(timestamp)
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

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log('📁 Creating sheet: ' + sheetName);
    sheet = ss.insertSheet(sheetName);
    
    if (sheetName === 'AdminConfigs') {
      sheet.appendRow(['configName', 'configData', 'updatedBy', 'timestamp']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
  }
  
  return sheet;
}

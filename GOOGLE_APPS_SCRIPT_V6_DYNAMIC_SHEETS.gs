/**
 * Google Apps Script V6 - Dynamic Survey Sheets + Activity Tracking
 * 
 * Features:
 * - Dynamic columns per survey (1-10+ questions)
 * - Each survey gets its own sheet/tab
 * - Activity tracking (category_viewed, document_viewed, etc.)
 * - Reward selections tracking
 * 
 * Version: 6.0
 * Last Updated: 2025-10-15
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const syncType = data.type || data.syncType;
    
    Logger.log('Received sync: ' + syncType);
    
    switch(syncType) {
      case 'survey_response':
        return handleSurveyResponse(data);
      case 'activity':
        return handleActivity(data);
      case 'reward_selection':
        return handleRewardSelection(data);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Unknown sync type: ' + syncType
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle Survey Response - Dynamic columns per survey
 * Each survey gets its own tab/sheet
 */
function handleSurveyResponse(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responseData = data.data || data;
  const questions = responseData.questions || [];
  
  // Create sheet name from survey title or ID
  const surveyTitle = responseData.surveyTitle || 'Survey';
  const surveyId = responseData.surveyId || Date.now();
  
  // Clean sheet name (remove special chars, max 100 chars)
  let sheetName = surveyTitle
    .replace(/[\/\\\?\*\[\]]/g, '') // Remove invalid chars
    .substring(0, 100);
  
  // Add ID suffix if sheet name exists
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet || isNewSurvey(sheet, questions)) {
    // Try with ID suffix if exists
    sheetName = sheetName + '_' + surveyId.toString().slice(-6);
    sheet = ss.getSheetByName(sheetName);
  }
  
  // Create sheet if not exists
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Build dynamic headers based on questions
    const headers = [
      'STT',
      'Mã DMS (thêm)',
      'Số điện thoại',
      'Thời gian'
    ];
    
    // Add question columns dynamically
    questions.forEach(function(q, index) {
      const questionText = q.question || q.text || q.title || ('Câu ' + (index + 1));
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
  
  // Get answers and questions (already declared above)
  const answers = responseData.answers || {};
  
  // Convert answers to readable format
  const readableAnswers = convertAnswersToReadable(answers, questions);
  
  // Format timestamp to Vietnam timezone
  let formattedTime = '';
  try {
    const timestamp = responseData.submittedAt || data.timestamp || new Date().toISOString();
    const date = new Date(timestamp.replace('Z', ''));
    date.setHours(date.getHours() + 7); // UTC+7
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Format: HH:mm:ss DD/MM/YYYY (matching Excel)
    formattedTime = hours + ':' + minutes + ':' + seconds + ' ' + day + '/' + month + '/' + year;
  } catch (error) {
    formattedTime = new Date().toLocaleString('vi-VN');
  }
  
  // Get next STT
  const lastRow = sheet.getLastRow();
  const stt = lastRow; // Row 1 is header, so lastRow is the STT
  
  // Prepare row data with dynamic columns
  const rowData = [
    stt,
    responseData.userId || responseData.ma_kh_dms || '',
    "'" + (responseData.phoneNumber || ''),
    formattedTime
  ];
  
  // Add all answers dynamically based on question count
  readableAnswers.forEach(function(answer) {
    rowData.push(answer || '-');
  });
  
  // Append row
  sheet.appendRow(rowData);
  
  // Format new row
  const newRow = sheet.getLastRow();
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

/**
 * Check if existing sheet matches current survey structure
 */
function isNewSurvey(sheet, newQuestions) {
  if (!sheet) return true;
  
  try {
    const lastCol = sheet.getLastColumn();
    const expectedCols = 4 + newQuestions.length; // STT + Mã DMS + Phone + Time + Questions
    
    // If column count different, it's a different survey
    return lastCol !== expectedCols;
  } catch (e) {
    return true;
  }
}

/**
 * Convert answers object to readable array
 */
function convertAnswersToReadable(answers, questions) {
  const readable = [];
  
  // Assuming questions are in order
  questions.forEach(function(question) {
    const answer = answers[question.id];
    
    if (answer === undefined || answer === null) {
      readable.push('-');
      return;
    }
    
    // Handle different question types
    switch(question.type) {
      case 'rating':
        // For rating (star), show number + star emoji
        readable.push(String(answer) + ' ⭐');
        break;
        
      case 'single-choice':
        // For single choice, find option label
        try {
          // Clean answer: remove brackets and quotes if present
          let cleanAnswer = answer;
          if (typeof answer === 'string') {
            // Remove ["..."] format
            cleanAnswer = answer.replace(/^\["?|"?\]$/g, '').replace(/\\"/g, '"');
          }
          
          if (question.options && Array.isArray(question.options)) {
            const singleOption = question.options.find(function(opt) { 
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
        // For multiple choice, join selected options
        try {
          let answerArray = answer;
          
          // If answer is string, try to parse it
          if (typeof answer === 'string') {
            try {
              answerArray = JSON.parse(answer);
            } catch (parseError) {
              // If parse fails, treat as single value
              answerArray = [answer];
            }
          }
          
          if (Array.isArray(answerArray) && question.options && Array.isArray(question.options)) {
            const labels = [];
            answerArray.forEach(function(val) {
              // Clean value: remove quotes if present
              const cleanVal = String(val).replace(/^["']|["']$/g, '');
              const opt = question.options.find(function(o) { 
                return o && o.value === cleanVal; 
              });
              labels.push(opt && opt.label ? opt.label : cleanVal);
            });
            readable.push(labels.join(', '));
          } else {
            // If not array, convert to string and clean
            const cleanStr = String(answer).replace(/^\["|"\]$/g, '').replace(/\\"/g, '"');
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
        // Safe conversion to string for any type
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

/**
 * Handle Activity Tracking
 * Supports: login, logout, page_view, survey_completed, game_played,
 *           category_viewed, document_viewed
 */
function handleActivity(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Activities');
  
  if (!sheet) {
    sheet = ss.insertSheet('Activities');
    
    const headers = [
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
    sheet.setColumnWidth(5, 150);  // Activity Type - wider for category_viewed
    sheet.setColumnWidth(6, 300);  // Description - wider
    sheet.setColumnWidth(7, 150);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 180);
    sheet.setColumnWidth(10, 300); // Metadata - wider
    
    sheet.setFrozenRows(1);
  }
  
  const activityData = data.data || data;
  
  let formattedTime = '';
  try {
    const timestamp = activityData.timestamp || new Date().toISOString();
    const date = new Date(timestamp.replace('Z', ''));
    date.setHours(date.getHours() + 7);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  } catch (error) {
    formattedTime = new Date().toLocaleString('vi-VN');
  }
  
  const rowData = [
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
  
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, rowData.length)
    .setHorizontalAlignment('left')
    .setBorder(true, true, true, true, true, true);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Activity synced'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle Reward Selection
 */
function handleRewardSelection(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Reward Selections');
  
  if (!sheet) {
    sheet = ss.insertSheet('Reward Selections');
    
    const headers = [
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
  
  let formattedTime = '';
  try {
    let dateStr = data.inserted_at || new Date().toISOString();
    dateStr = dateStr.replace('Z', '');
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 7);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  } catch (error) {
    formattedTime = new Date().toLocaleString('vi-VN');
  }
  
  const rowData = [
    data.ma_kh_dms || '',
    "'" + (data.phone || ''),
    data.user_name || '',
    data.value || '',
    data.value1 || '',
    data.value2 || '',
    formattedTime
  ];
  
  sheet.appendRow(rowData);
  
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, rowData.length)
    .setHorizontalAlignment('left')
    .setBorder(true, true, true, true, true, true);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Reward selection synced',
    timestamp: formattedTime
  })).setMimeType(ContentService.MimeType.JSON);
}

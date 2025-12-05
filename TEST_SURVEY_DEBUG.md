# Hướng dẫn Debug Survey không hiển thị

## Bước 1: Kiểm tra Cache
Mở **Developer Tools** (F12) → Tab **Console**, gõ:
```javascript
localStorage.removeItem('surveys_cache');
localStorage.removeItem('surveys_cache_timestamp');
location.reload();
```

## Bước 2: Kiểm tra Survey Data
Gõ trong Console:
```javascript
fetch(process.env.REACT_APP_GOOGLE_SCRIPT_URL + '?action=getSurveys')
  .then(r => r.json())
  .then(data => {
    console.table(data.data.map(s => ({
      id: s.id,
      title: s.title,
      isActive: s.isActive,
      startDate: s.startDate,
      endDate: s.endDate
    })));
  });
```

Hoặc đơn giản hơn:
```javascript
// Copy URL từ .env file
fetch('https://script.google.com/macros/s/AKfycbxaKVO6emsr6_hSuY6dxIZ7yHY4gINpL0h_OlNR7IyqaNmtGxUYWZAFSqTR_uv2znYV/exec?action=getSurveys')
  .then(r => r.json())
  .then(data => console.table(data.data));
```

## Bước 3: Kiểm tra trong Google Sheets
1. Mở Google Sheets
2. Tìm sheet **"Surveys"**
3. Kiểm tra cột **"Is Active"** - phải là `TRUE` hoặc `true`
4. Kiểm tra **Start Date** và **End Date** (nếu có)

## Bước 4: Nếu isActive = FALSE
Sửa trực tiếp trong Google Sheets:
- Đổi cột "Is Active" thành `TRUE`
- Xóa cache (Bước 1)
- Reload lại app

## Bước 5: Kiểm tra User Completion
Gõ trong Console (thay `SURVEY_ID` và `USER_ID`):
```javascript
// Import Firebase
import { db } from './services/firebase';

db.collection('survey_responses')
  .where('surveyId', '==', 'SURVEY_ID')
  .where('userId', '==', 'USER_ID')
  .get()
  .then(snapshot => {
    console.log('User completed this survey:', !snapshot.empty);
    snapshot.forEach(doc => console.log(doc.data()));
  });
```

## Giải pháp nhanh
**Nếu cần survey hiển thị ngay lập tức:**
1. Xóa cache: `localStorage.clear()`
2. Reload trang
3. Kiểm tra Google Sheets có `isActive = TRUE`

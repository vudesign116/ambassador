# 🚀 Cloud Functions Setup Guide - Hide API Token

## Mục tiêu
Ẩn hoàn toàn Bearer token khỏi frontend bằng cách dùng Cloud Functions làm proxy.

---

## ⚠️ Prerequisites

### 1. Kiểm tra quyền
```bash
# Phải có quyền Cloud Functions
# Nếu chưa có, xem: GRANT_CLOUD_FUNCTIONS_PERMISSION.md
firebase init functions --project ambassador-7849e
```

### 2. Enable Billing
- Cloud Functions **BẮT BUỘC** phải enable billing
- Free tier: 2 triệu invocations/tháng (đủ dùng)
- Truy cập: https://console.cloud.google.com/billing

---

## 📦 Bước 1: Initialize Cloud Functions

```bash
cd "/Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador 2"
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
firebase init functions --project ambassador-7849e
```

**Chọn:**
- ✅ JavaScript (hoặc TypeScript nếu muốn)
- ✅ ESLint: Yes
- ✅ Install dependencies: Yes

Sẽ tạo cấu trúc:
```
functions/
├── index.js          # Cloud Functions code
├── package.json      # Dependencies
└── .eslintrc.js      # Linting config
```

---

## 📝 Bước 2: Viết Cloud Functions

### File: `functions/index.js`

```javascript
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// ✅ API Configuration (HIDDEN IN CLOUD FUNCTION)
const API_BASE_URL = 'https://bi.meraplion.com/local';
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ';

/**
 * 🔐 Login Function (Proxy)
 * Ẩn Bearer token khỏi frontend
 */
exports.login = functions.https.onCall(async (data, context) => {
  try {
    const { phone } = data;
    
    // Validate input
    if (!phone) {
      throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
    }
    
    // Call backend API với token HIDDEN
    const response = await fetch(`${API_BASE_URL}/nvbc_login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ phone })
    });
    
    // Parse response
    const result = await response.json();
    
    // Return data to frontend
    if (response.ok) {
      return { success: true, data: result };
    } else {
      throw new functions.https.HttpsError('internal', result.mess_error || 'Login failed');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * 🎁 Get Points Function (Proxy)
 */
exports.getPoints = functions.https.onCall(async (data, context) => {
  try {
    const { phone } = data;
    
    if (!phone) {
      throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
    }
    
    const response = await fetch(`${API_BASE_URL}/nvbc_get_point/?phone=${phone}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result };
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to get points');
    }
    
  } catch (error) {
    console.error('Get points error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### File: `functions/package.json`

Thêm dependency `node-fetch`:

```bash
cd functions
npm install node-fetch@2
cd ..
```

---

## 🚀 Bước 3: Deploy Cloud Functions

```bash
# Deploy tất cả functions
firebase deploy --only functions --project ambassador-7849e

# Hoặc deploy specific function
firebase deploy --only functions:login --project ambassador-7849e
firebase deploy --only functions:getPoints --project ambassador-7849e
```

Kết quả sẽ hiển thị URLs:
```
✔  functions[login(us-central1)]: Successful create operation.
✔  functions[getPoints(us-central1)]: Successful create operation.

Functions URL:
- login: https://us-central1-ambassador-7849e.cloudfunctions.net/login
- getPoints: https://us-central1-ambassador-7849e.cloudfunctions.net/getPoints
```

---

## 🔄 Bước 4: Update Frontend Code

### 4.1. Initialize Firebase Functions SDK

**File: `src/firebase/config.js`**

```javascript
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "ambassador-7849e.firebaseapp.com",
  projectId: "ambassador-7849e",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// ✅ Export callable functions
export const loginFunction = httpsCallable(functions, 'login');
export const getPointsFunction = httpsCallable(functions, 'getPoints');
```

### 4.2. Update LoginPage.js

**Before (Direct API call):**
```javascript
const response = await fetch(`${API_BASE_URL}/nvbc_login/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${getApiToken()}`, // ❌ Token exposed
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ phone })
});
```

**After (Cloud Function call):**
```javascript
import { loginFunction } from '../firebase/config';

// In handleLogin:
try {
  const result = await loginFunction({ phone: phoneNumber.trim() });
  
  if (result.data.success) {
    const loginData = result.data.data;
    // Process login data...
    navigate('/dashboard');
  }
} catch (error) {
  console.error('Login error:', error);
  setError('Đăng nhập thất bại!');
}
```

### 4.3. Update DashboardPage.js / PointHistoryPage.js

**Before:**
```javascript
const apiUrl = `${API_BASE_URL}/nvbc_get_point/?phone=${phone}`;
const response = await fetch(apiUrl, {
  headers: { 'Authorization': `Bearer ${apiService.apiToken}` }
});
```

**After:**
```javascript
import { getPointsFunction } from '../firebase/config';

const result = await getPointsFunction({ phone });
const pointsData = result.data.data;
```

---

## 🧪 Bước 5: Test

### Local Testing (Emulator)
```bash
# Start emulator
firebase emulators:start --only functions

# Functions sẽ chạy tại:
# http://localhost:5001/ambassador-7849e/us-central1/login
```

### Production Testing
```bash
# Deploy và test trực tiếp
firebase deploy --only functions
npm run build
firebase deploy --only hosting
```

---

## 🔒 Kết quả

### ✅ Trước khi có Cloud Functions:
- Network tab: `Authorization: Bearer eyJ0eXAi...` ❌ EXPOSED

### ✅ Sau khi có Cloud Functions:
- Network tab: Chỉ thấy call đến `cloudfunctions.net` ✅ TOKEN HIDDEN
- Token được lưu trong Cloud Functions environment
- Frontend KHÔNG BAO GIỜ nhìn thấy token

---

## 📊 Cost Estimate

**Free Tier (mỗi tháng):**
- 2,000,000 invocations
- 400,000 GB-seconds
- 200,000 GHz-seconds
- 5GB network egress

**Với app của bạn:**
- ~100 users/day × 30 days = 3,000 invocations
- **HOÀN TOÀN MIỄN PHÍ** ✅

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'node-fetch'"
```bash
cd functions
npm install node-fetch@2
firebase deploy --only functions
```

### Lỗi: "CORS error"
Cloud Functions tự động handle CORS, không cần config thêm.

### Lỗi: "Billing not enabled"
- Vào: https://console.cloud.google.com/billing
- Link billing account (free tier vẫn cần billing account)

---

## 📚 Tài liệu tham khảo

- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Pricing](https://firebase.google.com/pricing)

---

**🎉 Sau khi setup xong, Bearer token sẽ HOÀN TOÀN ẨN khỏi frontend!**

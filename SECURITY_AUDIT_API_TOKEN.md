# 🔒 Security Audit: API Token Exposure

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG

### 1. **Bearer Token đang bị lộ ra ngoài**

Khi kiểm tra Network DevTools, token đang hiển thị rõ ràng trong Request Headers:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Token này chứa thông tin:**
```json
{
  "user_id": "MR2966",
  "username": "MR2966",
  "exp": 1775891631,  // Expires: 2026-01-09 (còn hơn 1 năm!)
  "iat": 1760339631   // Issued: 2025-10-13
}
```

### 2. **Token đang bị embed ở nhiều nơi:**

#### ❌ Trong Frontend (src/)
- `src/services/apiService.js` → `process.env.REACT_APP_API_TOKEN`
- `src/services/rewardApiService.js` → Sử dụng token từ env
- `src/pages/LoginPage.js` → `process.env.REACT_APP_API_TOKEN`
- `src/pages/DashboardPage.js` → Sử dụng `authToken` từ localStorage
- `src/pages/DocumentListPage.js` → Sử dụng `authToken`
- `src/components/ApiTestPanel.js` → Sử dụng token để test API

#### ❌ Trong Cloud Functions (functions/index.js)
```javascript
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'; // HARDCODED!
```

#### ❌ Trong Environment Variables (.env)
```bash
REACT_APP_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Khi build production** → Token được embed vào JavaScript bundle → **Bất kỳ ai cũng có thể đọc được!**

### 3. **Rủi ro**

- ⚠️ **Token Theft**: Attacker có thể copy token và gọi API trái phép
- ⚠️ **Data Leakage**: Truy cập thông tin user, điểm, phần thưởng
- ⚠️ **API Abuse**: Spam requests, DDoS backend
- ⚠️ **Impersonation**: Giả mạo user khác
- ⚠️ **Long Expiry**: Token còn hiệu lực đến 2026 → Rủi ro lâu dài

## ✅ GIẢI PHÁP

### **Architecture Hiện Tại (KHÔNG AN TOÀN)**

```
┌─────────┐                    ┌──────────────┐
│ Browser │  ──[Bearer Token]→ │ bi.meraplion │
│ (React) │      (EXPOSED!)    │   Backend    │
└─────────┘                    └──────────────┘
```

**Vấn đề:** Token nằm trong browser → User có thể đọc được

---

### **Solution 1: Cloud Functions Proxy (RECOMMENDED)** ⭐⭐⭐

```
┌─────────┐         ┌──────────────────┐         ┌──────────────┐
│ Browser │   →     │ Cloud Functions  │  →      │ bi.meraplion │
│ (React) │  No     │   (Proxy with    │  Bearer │   Backend    │
└─────────┘  Token  │   Hidden Token)  │  Token  └──────────────┘
                    └──────────────────┘
```

**Ưu điểm:**
- ✅ Token được lưu an toàn trong Cloud Functions
- ✅ Browser không bao giờ thấy token
- ✅ Có thể thêm authentication layer (Firebase Auth)
- ✅ Rate limiting, logging, monitoring

**Cách implement:**

#### Step 1: Move token to Firebase Functions Environment Variables

```bash
# Set token as Firebase Functions config
firebase functions:config:set api.token="YOUR_TOKEN_HERE"
firebase functions:config:set api.base_url="https://bi.meraplion.com/local"

# Deploy functions
firebase deploy --only functions
```

#### Step 2: Update functions/index.js

```javascript
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Get token from Firebase config (NOT hardcoded)
const API_TOKEN = functions.config().api.token;
const API_BASE_URL = functions.config().api.base_url;

exports.login = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { phone } = req.body;
    
    // Call backend with hidden token
    const response = await fetch(`${API_BASE_URL}/nvbc_login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}` // Hidden from browser
      },
      body: JSON.stringify({ phone })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Step 3: Update Frontend to call Cloud Functions instead

```javascript
// src/services/apiService.js
class ApiService {
  constructor() {
    // NO MORE REACT_APP_API_TOKEN!
    this.cloudFunctionsUrl = 'https://us-central1-ambassador-7849e.cloudfunctions.net';
  }

  async login(phone) {
    const response = await fetch(`${this.cloudFunctionsUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // NO Authorization header!
      },
      body: JSON.stringify({ phone })
    });
    
    return response.json();
  }
}
```

---

### **Solution 2: Firebase Authentication + Custom Claims** ⭐⭐

Thay vì dùng Bearer token tĩnh, dùng Firebase Auth:

```javascript
// After user logs in with phone
const user = await firebase.auth().signInWithCustomToken(customToken);

// Get ID token (expires after 1 hour, auto-refresh)
const idToken = await user.getIdToken();

// Use ID token to call Cloud Functions
fetch('/api/getPoints', {
  headers: {
    'Authorization': `Bearer ${idToken}` // Safe, short-lived
  }
});
```

**Ưu điểm:**
- ✅ Token tự động expire và refresh
- ✅ Có thể revoke token ngay lập tức
- ✅ Built-in security rules

---

### **Solution 3: Minimal - Hide token better (NOT RECOMMENDED)**

Nếu không thể dùng Cloud Functions, ít nhất làm cho việc đọc token khó hơn:

1. **Obfuscate token** (không an toàn 100%)
2. **Split token** thành nhiều phần
3. **Encrypt token** với key khác

```javascript
// Obfuscated token (still not safe!)
const getToken = () => {
  const parts = [
    'eyJ0eXAiOiJKV1Qi',
    'LCJhbGciOiJIUzI1NiJ9',
    // ... more parts
  ];
  return parts.join('.');
};
```

⚠️ **LƯU Ý:** Đây KHÔNG an toàn thực sự! Chỉ khiến việc đọc token khó hơn chút.

---

## 🎯 KHUYẾN NGHỊ

### **Ngay lập tức:**

1. ✅ **Deploy Cloud Functions** với token được lưu trong Firebase config
2. ✅ **Remove token** khỏi frontend code
3. ✅ **Update all API calls** để gọi qua Cloud Functions
4. ✅ **Request backend** cấp token mới (nếu token hiện tại bị leak)

### **Dài hạn:**

1. ✅ Implement **Firebase Authentication**
2. ✅ Use **short-lived tokens** (auto-expire sau 1 giờ)
3. ✅ Add **rate limiting** ở Cloud Functions
4. ✅ Monitor & log **suspicious API calls**
5. ✅ Setup **token rotation** (đổi token định kỳ)

---

## 📝 ACTION ITEMS

### Priority 1: Immediate (Today)

- [ ] Remove `REACT_APP_API_TOKEN` from `.env`
- [ ] Remove hardcoded token from `functions/index.js`
- [ ] Set token in Firebase Functions config
- [ ] Update all API calls to use Cloud Functions
- [ ] Rebuild & redeploy

### Priority 2: Short-term (This week)

- [ ] Request backend team for new token
- [ ] Implement proper error handling in Cloud Functions
- [ ] Add rate limiting
- [ ] Add request logging

### Priority 3: Long-term (This month)

- [ ] Migrate to Firebase Authentication
- [ ] Implement token refresh mechanism
- [ ] Setup monitoring & alerts
- [ ] Security audit all endpoints

---

## 🔗 Resources

- [Firebase Functions Environment Configuration](https://firebase.google.com/docs/functions/config-env)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Status:** 🔴 **CRITICAL - Needs immediate action**  
**Date:** 2025-10-19  
**Reported by:** GitHub Copilot Security Audit

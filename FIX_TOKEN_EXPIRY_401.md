# 🔐 FIX TOKEN EXPIRY ERROR - 401 UNAUTHORIZED

## ❌ Vấn đề
API trả về lỗi **401 Unauthorized** với thông báo:
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

## 🔍 Nguyên nhân
1. **Token xác thực đã hết hạn** - JWT token có thời gian sống giới hạn (thường là 1-24 giờ)
2. **Token bị thu hồi** - Backend đã revoke token này
3. **Token không hợp lệ** - Format sai hoặc bị corrupt

## ✅ Giải pháp đã thực hiện

### 1. **Tự động phát hiện và xóa token hết hạn**

File: `src/services/rewardApiService.js`

```javascript
/**
 * Clear expired token and redirect to login
 */
handleExpiredToken() {
  console.warn('⚠️ Token expired - clearing auth data');
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  
  // Optionally redirect to login (uncomment if needed)
  // window.location.href = '/login';
}
```

### 2. **Xử lý lỗi 401 trong API call**

Khi gọi API `getRewardStatus()`, code sẽ:
- Kiểm tra response status code
- Nếu là **401**, parse error message
- Nếu có `token_not_valid`, tự động xóa token
- Throw error để UI xử lý

```javascript
if (response.status === 401) {
  console.error('❌ API Error Response:', errorText.substring(0, 200) + '...');
  
  // Try to parse error message
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.code === 'token_not_valid' || errorJson.detail?.includes('token')) {
      console.warn('🔄 Token expired or invalid - clearing auth data');
      this.handleExpiredToken();
    }
  } catch (parseError) {
    // Not JSON, just a 401 error
    if (token) {
      console.warn('🔄 401 Unauthorized - clearing potentially expired token');
      this.handleExpiredToken();
    }
  }
}
```

### 3. **UI hiển thị thông báo thân thiện**

File: `src/pages/RewardSelectionPage.js`

Khi API trả về 401, hiển thị message:
```javascript
if (apiError.message && apiError.message.includes('401')) {
  console.log('🔑 Authentication failed - token may be expired');
  console.log('⚠️ User needs to log in again to refresh token');
  
  // Show user-friendly message
  const fallbackData = {
    show_reward_selection: false,
    _error_message: 'Token xác thực đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để tiếp tục.'
  };
  
  setRewardData(fallbackData);
}
```

UI sẽ hiển thị:
- 🔒 Icon khóa màu đỏ
- **"Phiên đăng nhập đã hết hạn"**
- Message: "Token xác thực đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để tiếp tục."
- Button **"Đăng nhập lại"** để clear localStorage và redirect về `/login`

## 🧪 Testing

### Cách 1: Sử dụng test-token-expiry.html
```bash
# Mở file trong browser
open test-token-expiry.html
```

Trong tool này bạn có thể:
1. **Load Token from LocalStorage** - Lấy token hiện tại
2. **Test Token** - Kiểm tra token có hết hạn không
3. **Test Without Token** - Kiểm tra API có cần auth không
4. **Clear Token** - Xóa token cũ

### Cách 2: Manual test trong DevTools

1. Mở **DevTools Console** (F12)
2. Chạy lệnh:
```javascript
// Kiểm tra token hiện tại
console.log('authToken:', localStorage.getItem('authToken'));
console.log('token:', localStorage.getItem('token'));

// Test API với token
const phone = localStorage.getItem('phoneNumber');
const token = localStorage.getItem('authToken');

fetch(`https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone=${phone}&test=1`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(res => {
  console.log('Status:', res.status);
  return res.text();
})
.then(text => {
  console.log('Response:', text);
})
.catch(err => console.error('Error:', err));
```

3. Nếu thấy **401**, token đã hết hạn

### Cách 3: Xóa token thủ công để test UI
```javascript
// Clear token để test UI
localStorage.removeItem('authToken');
localStorage.removeItem('token');

// Reload page để thấy UI error message
location.reload();
```

## 🔧 Cách fix cho user

### Cách 1: Đăng nhập lại (Recommended)
1. Click **"Đăng nhập lại"** trong message error
2. Hoặc logout và login lại thủ công
3. Token mới sẽ được tạo

### Cách 2: Clear localStorage thủ công
Mở **DevTools Console** và chạy:
```javascript
localStorage.clear();
location.reload();
```

### Cách 3: Clear browser cache
1. Chrome: Settings → Privacy → Clear browsing data
2. Chọn "Cookies and other site data"
3. Click "Clear data"
4. Refresh page

## 🛡️ Phòng tránh trong tương lai

### 1. **Implement Refresh Token** (Recommended)
Thêm cơ chế refresh token để tự động renew token khi hết hạn:

```javascript
async function refreshAuthToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  
  const response = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  localStorage.setItem('authToken', data.access_token);
  
  return data.access_token;
}
```

### 2. **Token expiry check before API call**
```javascript
function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    // Decode JWT (assumes JWT format)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    
    return Date.now() >= expiryTime;
  } catch (e) {
    return true; // Assume expired if can't decode
  }
}

// Use before API call
const token = this.getAuthToken();
if (isTokenExpired(token)) {
  // Try to refresh or redirect to login
  this.handleExpiredToken();
  throw new Error('Token expired');
}
```

### 3. **Auto-logout on token expiry**
```javascript
// In App.js or auth service
useEffect(() => {
  const checkTokenExpiry = () => {
    const token = localStorage.getItem('authToken');
    if (isTokenExpired(token)) {
      localStorage.clear();
      navigate('/login');
    }
  };
  
  // Check every 5 minutes
  const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

## 📊 Monitoring

Thêm logging để track token expiry:

```javascript
// In rewardApiService.js
if (response.status === 401) {
  // Log to analytics
  if (window.gtag) {
    gtag('event', 'token_expired', {
      event_category: 'authentication',
      event_label: phoneNumber,
      value: 1
    });
  }
  
  // Log to Sentry/monitoring service
  if (window.Sentry) {
    Sentry.captureMessage('Token expired for user', {
      level: 'warning',
      extra: {
        phoneNumber,
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

## ✅ Checklist

- [x] Auto-detect token expiry (401 error)
- [x] Clear expired token from localStorage
- [x] Show user-friendly error message
- [x] Provide "Login Again" button
- [x] Create test tool (test-token-expiry.html)
- [ ] Implement refresh token mechanism (future)
- [ ] Add token expiry check before API calls (future)
- [ ] Add monitoring/analytics (future)

## 🔗 Related Files

- `src/services/rewardApiService.js` - API service với token handling
- `src/pages/RewardSelectionPage.js` - UI với error message
- `test-token-expiry.html` - Test tool
- `FIX_TOKEN_EXPIRY_401.md` - Tài liệu này

## 📞 Support

Nếu vẫn gặp lỗi 401 sau khi đăng nhập lại:
1. Kiểm tra xem backend API có đang hoạt động không
2. Kiểm tra xem phone number có đúng không
3. Kiểm tra network logs trong DevTools → Network
4. Contact backend team để kiểm tra token generation

---

**Last updated:** 2025-01-29  
**Status:** ✅ FIXED - Token expiry now handled gracefully

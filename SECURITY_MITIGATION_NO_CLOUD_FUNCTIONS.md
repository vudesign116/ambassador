# 🛡️ Security Mitigation (Without Cloud Functions)

## 📋 Tình huống

Bạn **KHÔNG có quyền truy cập Cloud Functions**, chỉ có Firebase Hosting. Do đó, không thể ẩn hoàn toàn Bearer token khỏi frontend.

## ⚠️ Hiện trạng

- Token vẫn phải được gửi từ browser
- Attacker có thể đọc token trong Network DevTools
- **KHÔNG thể ẩn hoàn toàn 100%**

## ✅ Giải pháp đã áp dụng: Token Obfuscation

### 🔒 Cách hoạt động

Thay vì lưu token dưới dạng plain text:

```javascript
// ❌ TRƯỚC (Dễ đọc)
const API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...";
```

Bây giờ token được **mã hóa và chia nhỏ**:

```javascript
// ✅ SAU (Khó đọc hơn)
import { getApiToken } from '../utils/tokenHelper';
const API_TOKEN = getApiToken(); // Tự động decode
```

### 📁 Files đã thay đổi

#### 1. **src/utils/tokenHelper.js** (MỚI)
- Chứa logic mã hóa/giải mã token
- Sử dụng XOR encryption + Hex encoding
- Token được split thành nhiều phần

#### 2. **src/services/apiService.js**
```javascript
// Trước
this.apiToken = process.env.REACT_APP_API_TOKEN;

// Sau
import { getApiToken } from '../utils/tokenHelper';
this.apiToken = getApiToken();
```

#### 3. **src/pages/LoginPage.js**
```javascript
// Trước
const API_TOKEN = process.env.REACT_APP_API_TOKEN;

// Sau
import { getApiToken } from '../utils/tokenHelper';
const API_TOKEN = getApiToken();
```

### 🔐 Mức độ bảo mật

| Phương pháp | Bảo mật | Ghi chú |
|-------------|---------|---------|
| Plain text in .env | ⭐ | Dễ đọc nhất |
| Obfuscation (hiện tại) | ⭐⭐ | Khó đọc hơn, delay attacker |
| Cloud Functions Proxy | ⭐⭐⭐⭐⭐ | An toàn nhất (nhưng cần quyền) |

### ⚡ Ưu điểm

- ✅ Token không còn là plain text trong code
- ✅ Khó đọc hơn trong DevTools (cần reverse engineering)
- ✅ Không cần backend hay Cloud Functions
- ✅ Không thay đổi API flow

### ⚠️ Nhược điểm

- ❌ **KHÔNG thực sự an toàn 100%**
- ❌ Attacker có kinh nghiệm vẫn đọc được
- ❌ Chỉ là "security through obscurity"
- ❌ Token vẫn phải gửi qua network

### 🎯 Khi nào dùng giải pháp này?

✅ **Dùng khi:**
- Không có quyền Cloud Functions
- Không thể yêu cầu backend team thay đổi
- Cần giải pháp tạm thời
- Muốn giảm thiểu rủi ro ngắn hạn

❌ **KHÔNG dùng cho:**
- Ứng dụng banking/payment
- Dữ liệu cực kỳ nhạy cảm
- Production long-term (nên migrate sang Cloud Functions)

## 🚀 Deployment

### Step 1: Remove token from .env (optional)

Có thể xóa token khỏi `.env` vì không dùng nữa:

```bash
# .env
# REACT_APP_API_TOKEN=... # ← Comment hoặc xóa
```

### Step 2: Rebuild

```bash
npm run build
```

### Step 3: Deploy

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
npx firebase-tools deploy --only hosting --project ambassador-7849e
```

## 🔄 Cách encode token mới

Khi cần update token mới (ví dụ token cũ hết hạn):

### Option 1: Sử dụng Browser Console

1. Mở `src/utils/tokenHelper.js`
2. Copy function `encodeToken`
3. Paste vào Browser Console
4. Chạy:

```javascript
encodeToken('YOUR_NEW_TOKEN_HERE');
// Output: Array of encrypted parts
```

5. Copy output và replace vào `tokenHelper.js`

### Option 2: Sử dụng Node.js

```bash
node
```

```javascript
// Paste các helper functions từ tokenHelper.js
// Sau đó:
encodeToken('YOUR_NEW_TOKEN_HERE');
```

## 📊 So sánh các giải pháp

### 1. Current: Obfuscation (⭐⭐)

```
Browser (obfuscated token) → Backend API
         ↓ (decode)
    Real token leaked
```

**Pros:** Dễ implement, không cần backend  
**Cons:** Vẫn leak token

---

### 2. Cloud Functions Proxy (⭐⭐⭐⭐⭐) [RECOMMENDED]

```
Browser (no token) → Cloud Functions (hidden token) → Backend API
```

**Pros:** Token hoàn toàn ẩn, an toàn nhất  
**Cons:** Cần quyền Cloud Functions

---

### 3. Backend API Update (⭐⭐⭐⭐)

```
Browser (app_key) → Backend API (validate app_key)
```

**Pros:** An toàn, không cần Cloud Functions  
**Cons:** Cần backend team update

---

### 4. External Proxy Server (⭐⭐⭐⭐)

```
Browser → Vercel/Railway (hidden token) → Backend API
```

**Pros:** An toàn, miễn phí  
**Cons:** Cần deploy thêm service

## 🎓 Best Practices

### 1. Rotate Token Regularly

Yêu cầu backend cấp token mới mỗi:
- ✅ **7-30 ngày** (thay vì 1 năm)
- ✅ Ngay khi phát hiện leak

### 2. Monitor API Usage

Theo dõi API logs để phát hiện:
- ❌ Request từ IP lạ
- ❌ Spike không bình thường
- ❌ Request patterns khác thường

### 3. Rate Limiting

Yêu cầu backend implement:
- Max 100 requests/user/day
- Max 10 requests/IP/minute
- Block sau 5 failed attempts

### 4. IP Whitelist (Optional)

Nếu app chỉ dùng trong công ty:
- Whitelist IP range của công ty
- Block tất cả IP khác

## 🔮 Roadmap

### Short-term (1-2 tuần)

- [x] Implement token obfuscation
- [ ] Request token mới với expiry ngắn hơn
- [ ] Monitor API logs

### Medium-term (1-2 tháng)

- [ ] Xin quyền Cloud Functions
- [ ] Hoặc deploy Vercel proxy
- [ ] Hoặc yêu cầu backend update API

### Long-term (3-6 tháng)

- [ ] Migrate hoàn toàn sang Cloud Functions
- [ ] Implement Firebase Authentication
- [ ] Setup proper token rotation

## 📝 Notes quan trọng

1. **Obfuscation ≠ Encryption**
   - Chỉ làm khó đọc, không phải mã hóa thực sự
   - Vẫn có thể reverse được

2. **Defense in Depth**
   - Kết hợp nhiều layer bảo mật
   - Không rely vào 1 method duy nhất

3. **Security through Obscurity**
   - Không nên dựa vào việc "giấu" code
   - Nên có proper authentication/authorization

4. **Temporary Solution**
   - Đây chỉ là giải pháp tạm thời
   - Nên migrate sang Cloud Functions ASAP

## 🆘 Khi nào cần nâng cấp?

Nếu phát hiện:
- ❌ Token bị leak (xuất hiện ở nơi không mong muốn)
- ❌ API usage tăng đột ngột
- ❌ Request từ IP/location lạ
- ❌ Backend báo cáo suspicious activity

→ **NGAY LẬP TỨC:**
1. Request revoke token cũ
2. Cấp token mới
3. Re-encode và deploy

---

**Status:** ✅ Implemented (Temporary mitigation)  
**Risk Level:** 🟡 Medium (Acceptable for now, plan to upgrade)  
**Date:** 2025-10-19  
**Next Review:** 2025-11-19 (30 days)

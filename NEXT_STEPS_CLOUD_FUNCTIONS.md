# 📋 NEXT STEPS - Cloud Functions Setup

## 🎯 Mục tiêu
Ẩn hoàn toàn Bearer token khỏi Network tab bằng Cloud Functions.

---

## ✅ Tình trạng hiện tại

### Đã làm được:
- ✅ Token obfuscation trong source code (tokenHelper.js)
- ✅ Token không hiển thị rõ trong `main.js` bundle
- ✅ Deploy thành công lên Firebase Hosting

### Vẫn còn vấn đề:
- ❌ Token vẫn hiển thị trong **Network tab** của DevTools
- ❌ Ai biết dùng DevTools đều có thể lấy được token

---

## 🔐 Giải pháp: Cloud Functions

### Cách hoạt động:
```
[Frontend] → [Cloud Functions] → [Backend API]
              ↑ Token ở đây
              (HIDDEN from browser)
```

### Lợi ích:
1. ✅ Token **HOÀN TOÀN ẨN** khỏi frontend
2. ✅ Network tab chỉ thấy call đến cloudfunctions.net
3. ✅ Token lưu trong Cloud Functions environment (secure)
4. ✅ Miễn phí với Free Tier (2 triệu calls/tháng)

---

## 📝 Các bước thực hiện

### Bước 1: Yêu cầu quyền từ Owner ⏳ (CHỜ OWNER)

**Bạn cần:**
Liên hệ Firebase project owner và yêu cầu cấp quyền Cloud Functions.

**Hướng dẫn chi tiết cho Owner:**
👉 Xem file: `GRANT_CLOUD_FUNCTIONS_PERMISSION.md`

**Owner cần làm:**
1. Vào Firebase Console IAM settings
2. Tìm service account của bạn
3. Thêm roles:
   - Cloud Functions Admin
   - Service Account User
   - Cloud Build Editor
4. Enable Cloud Functions API

**Hoặc Owner chạy commands:**
```bash
# Tìm service account
gcloud iam service-accounts list --project=ambassador-7849e

# Grant permissions
SERVICE_ACCOUNT="firebase-adminsdk-xxxxx@ambassador-7849e.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudfunctions.admin"

gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudbuild.builds.editor"

# Enable APIs
gcloud services enable cloudfunctions.googleapis.com --project=ambassador-7849e
gcloud services enable cloudbuild.googleapis.com --project=ambassador-7849e
```

---

### Bước 2: Enable Billing ⏳ (CHỜ OWNER)

**Cloud Functions yêu cầu billing account** (nhưng vẫn miễn phí trong Free Tier)

**Owner cần làm:**
1. Truy cập: https://console.cloud.google.com/billing/linkedaccount?project=ambassador-7849e
2. Link credit card hoặc billing account
3. **LƯU Ý:** Với usage hiện tại (~3000 calls/tháng) → **HOÀN TOÀN MIỄN PHÍ**

---

### Bước 3: Setup Cloud Functions ✅ (SAU KHI CÓ QUYỀN)

**Sau khi Owner cấp quyền xong, bạn chạy:**

```bash
# 1. Initialize Cloud Functions
cd "/Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador 2"
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
firebase init functions --project ambassador-7849e

# 2. Install dependencies
cd functions
npm install node-fetch@2
cd ..

# 3. Deploy functions
firebase deploy --only functions --project ambassador-7849e
```

**Hướng dẫn chi tiết:**
👉 Xem file: `CLOUD_FUNCTIONS_SETUP_GUIDE.md`

---

### Bước 4: Update Frontend Code ✅ (SAU KHI DEPLOY FUNCTIONS)

**Files cần update:**
1. `src/firebase/config.js` - Add Functions SDK
2. `src/pages/LoginPage.js` - Dùng Cloud Function thay vì fetch
3. `src/pages/DashboardPage.js` - Dùng Cloud Function
4. `src/pages/PointHistoryPage.js` - Dùng Cloud Function
5. `src/services/apiService.js` - Remove token, dùng Cloud Function

**Ví dụ thay đổi:**

**Before:**
```javascript
const response = await fetch('https://bi.meraplion.com/local/nvbc_login/', {
  headers: { 'Authorization': `Bearer ${token}` } // ❌ Exposed
});
```

**After:**
```javascript
import { loginFunction } from '../firebase/config';
const result = await loginFunction({ phone }); // ✅ Token hidden
```

---

## ⏰ Timeline Ước tính

| Bước | Người thực hiện | Thời gian | Trạng thái |
|------|----------------|-----------|-----------|
| **1. Yêu cầu quyền** | Bạn → Owner | 5 phút | ⏳ Chờ |
| **2. Owner grant** | Owner | 10 phút | ⏳ Chờ |
| **3. Enable billing** | Owner | 5 phút | ⏳ Chờ |
| **4. Init Functions** | Bạn | 5 phút | ⏳ Chưa làm |
| **5. Deploy Functions** | Bạn | 10 phút | ⏳ Chưa làm |
| **6. Update Frontend** | Bạn | 30 phút | ⏳ Chưa làm |
| **7. Test & Deploy** | Bạn | 15 phút | ⏳ Chưa làm |
| **TỔNG** | | **~80 phút** | |

---

## 📧 Email Template gửi cho Owner

**Subject:** [Ambassador Project] Request Cloud Functions Permission

**Body:**
```
Hi [Owner Name],

Tôi đang làm việc trên Firebase project "Ambassador" (ambassador-7849e) và 
cần quyền Cloud Functions để cải thiện bảo mật cho ứng dụng.

Mục đích:
- Ẩn API Bearer token khỏi frontend (hiện đang exposed trong Network tab)
- Sử dụng Cloud Functions làm proxy để bảo vệ credentials

Yêu cầu:
1. Grant Cloud Functions permissions cho service account:
   firebase-adminsdk-xxxxx@ambassador-7849e.iam.gserviceaccount.com

2. Enable Billing cho project (sẽ ở trong Free Tier, không mất phí)

Hướng dẫn chi tiết: 
Tôi đã chuẩn bị file GRANT_CLOUD_FUNCTIONS_PERMISSION.md trong repo.

Hoặc Owner có thể chạy các commands sau:

# Enable APIs
gcloud services enable cloudfunctions.googleapis.com --project=ambassador-7849e
gcloud services enable cloudbuild.googleapis.com --project=ambassador-7849e

# Grant permissions (thay SERVICE_ACCOUNT bằng email thực tế)
gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/cloudfunctions.admin"

Cảm ơn!
```

---

## 🔄 Alternative: Nếu Owner không cấp quyền

Nếu không có quyền Cloud Functions, các options khác:

### Option A: Chấp nhận rủi ro (hiện tại)
- ✅ Token obfuscation đã làm
- ⚠️ Token vẫn lộ trong Network tab
- 💡 Đề xuất: Rate limiting từ backend

### Option B: Tự host backend proxy
- Thuê VPS/Server riêng (DigitalOcean, AWS, GCP...)
- Deploy Node.js/Python proxy server
- Chi phí: ~$5-10/tháng

### Option C: Dùng Cloudflare Workers (Free)
- Free tier: 100,000 requests/day
- Setup tương tự Cloud Functions
- Docs: https://workers.cloudflare.com

---

## 📞 Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, hãy:
1. Check `CLOUD_FUNCTIONS_SETUP_GUIDE.md` để biết chi tiết
2. Check `GRANT_CLOUD_FUNCTIONS_PERMISSION.md` để gửi cho Owner
3. Báo lại khi Owner đã cấp quyền để tiếp tục bước tiếp theo

---

**🎯 Mục tiêu cuối cùng:** Token HOÀN TOÀN ẨN, bảo mật 100%! 🔐

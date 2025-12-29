# 📋 DANH SÁCH TẤT CẢ API TRONG ỨNG DỤNG

## 🌐 BASE URLs

```javascript
API_BASE_URL = https://bi.meraplion.com/local
GOOGLE_SCRIPT_URL = [From .env]
ADMIN_CONFIG_SCRIPT_URL = [From .env]
```

---

## 🔐 API BACKEND (bi.meraplion.com)

### 1️⃣ **Login API**
```javascript
POST /nvbc_login/
```
**File:** `src/pages/LoginPage.js`, `src/services/apiService.js`

**Request:**
```json
{
  "phone": "0935025858"
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "name": "Hoàng Anh Vũ",
  "phone": "0935025858",
  "ma_kh_dms": "00180400"
}
```

**Test:**
```bash
curl -X POST https://bi.meraplion.com/local/nvbc_login/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ" \
  -d '{"phone":"0935025858"}'
```

**Status:** ✅ WORKING

---

### 2️⃣ **Get Point/Reward API**
```javascript
GET /nvbc_get_point/?phone={phone}
GET /nvbc_get_point/?test=1  // Test mode - returns sample data
```
**File:** 
- `src/pages/LoginPage.js` (Line 264)
- `src/pages/DashboardPage.js` (Line 126)
- `src/pages/DocumentListPage.js` (Line 135)
- `src/pages/PointHistoryPage.js` (Line 171)
- `src/services/apiService.js`

**Parameters:**
- `phone` - User phone number (returns user-specific data)
- `test=1` - Test mode (returns sample data with null phone, 0 points, 4-point documents)

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

**Response (200 OK):**
```json
{
  "phone": "0935025858",
  "point": 16,
  "status": "ok",
  
  "contentlist": [
    {
      "category": "THÔNG TIN SẢN PHẨM",
      "subcategories": [
        {
          "document_id": 4,
          "document_name": "ADACAST - Thuốc xịt mũi...",
          "url": "https://drive.google.com/file/d/.../preview",
          "type": "pdf",
          "point": 2,
          "sub_category": "TỐC GIẢI THIỆU SẢN PHẨM"
        }
      ]
    }
  ],
  
  "lich_su_diem": [
    {
      "phone": "0935025858",
      "ma_kh_dms": "00180400",
      "document_id": "76",
      "document_name": "Viêm họng - Giải đáp phần 2",
      "point": 2,
      "inserted_at": "2025-12-05T14:37:52.001"
    }
  ],
  
  "reward_event": "12_25_th_monthly_reward",
  "th_monthly_reward": false,
  "avid_reader_reward": false,
  "product_expert_reward": false,
  "show_reward_selection": false,
  "list_chon_cgsp": [...],
  "list_chon_dgcc": [...],
  "list_chon_monthly": ["Túi đựng mỹ phẩm", "Bình giữ nhiệt", ...]
}
```

**📊 Response Fields Explained:**

**Basic Info:**
- `phone` - User phone number
- `point` - Total accumulated points (16)
- `status` - API status ("ok")

**Content Library (`contentlist`):**
- Array of 5 content categories
- Each category has `subcategories` array
- Each document contains:
  - `document_id` - Unique ID
  - `document_name` - Vietnamese name
  - `url` - Google Drive preview URL or YouTube embed
  - `type` - "pdf" or "video"
  - `point` - Points earned when viewed (usually 2)
  - `sub_category` - Subcategory name

**Point History (`lich_su_diem`):**
- Array of viewed documents (8 entries for example user)
- Each entry:
  - `document_id`, `document_name` - What was viewed
  - `point` - Points earned (2 per view)
  - `inserted_at` - Timestamp (ISO 8601)
  - `ma_kh_dms` - Customer code in DMS system

**Reward Eligibility Flags:**
- `show_reward_selection` - Boolean to show/hide reward UI
- `th_monthly_reward` - Eligible for monthly reward (Thành tích tháng)
- `avid_reader_reward` - Eligible for avid reader reward (DGCC - Độc giả cần cù)
- `product_expert_reward` - Eligible for product expert reward (CGSP - Chuyên gia sản phẩm)
- `fail_show_reward_selection` - Error message if ineligible

**Reward Lists:**
- `list_chon_monthly` - Available monthly rewards (array of names)
- `list_chon_dgcc` - DGCC rewards (for avid readers)
- `list_chon_cgsp` - CGSP rewards (for product experts)

**User's Selections:**
- `rewards` - Array of user's submitted reward choices (empty if none)
- `reward_event` - Current reward event ID

**Response Size:** ~19KB JSON

**Example Statistics:**
- 5 content categories (Sổ tay người thầy thuốc, Thông tin bệnh học, Thông tin sản phẩm, etc.)
- 40+ documents available (videos & PDFs)
- 8 point history entries
- Point total: 16

**Test:**
```bash
# Real user data
curl "https://bi.meraplion.com/local/nvbc_get_point/?phone=0935025858" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ"

# Test mode (sample data)
curl "https://bi.meraplion.com/local/nvbc_get_point/?test=1" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ"
```

**Differences between modes:**

| Field | `phone=xxx` | `test=1` |
|-------|-------------|----------|
| `phone` | "0935025858" | null |
| `point` | 16 (real) | 0 |
| Document points | 2 per doc | 4 per doc |
| `lich_su_diem` | User's history (8 items) | Empty array |
| Reward flags | Real eligibility | All false |

**Status:** ✅ WORKING

---

### 3️⃣ **Submit Reward API**
```javascript
POST /post_data/insert_nvbc_reward_item/
```
**File:** `src/services/rewardApiService.js`

**Request Format:** Array of objects (supports batch insert)
```json
[
  {
    "phone": "0935025858",
    "value": "Túi đựng mỹ phẩm",
    "value1": "",
    "value2": "",
    "inserted_at": "2025-12-27T10:00:00.000Z"
  }
]
```

**Field Mapping:**
- `phone` - User phone number
- `value` - Monthly reward name (Tên quà tháng)
- `value1` - DGCC reward name (Độc giả cần cù)
- `value2` - CGSP reward name (Chuyên gia sản phẩm)
- `inserted_at` - ISO 8601 timestamp

**Headers:**
```
Content-Type: application/json
```

**Note:** API tries WITHOUT Authorization first, retries with Bearer token if 401

**Response (Success):**
```json
{
  "status": "success",
  "message": "Reward submitted successfully"
}
```

**Response (Business Logic Error - Still 200 OK):**
```json
{
  "status": "fail_but_commit",
  "error_message": "Rất tiếc, món quà \"Túi đựng mỹ phẩm\" vừa hết hàng trong đợt này."
}
```

**Test:**
```bash
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/" \
  -H "Content-Type: application/json" \
  -d '[{"phone":"0935025858","value":"Túi đựng mỹ phẩm","value1":"","value2":"","inserted_at":"2025-12-27T10:00:00.000Z"}]'
```

**Status:** ✅ WORKING (API responds correctly, business logic: "hết hàng")

---

### 4️⃣ **Track Document View API (Sync Point History)**
```javascript
POST /post_data/insert_nvbc_track_view/
POST /post_data/insert_nvbc_track_view/?test=1  // Test mode - bypasses business logic
```
**File:** `src/utils/apiHelper.js`, `src/pages/DocumentListPage.js`

**Purpose:** Post viewing history when user views a document and earns points

**Parameters:**
- `test=1` - Test mode (bypasses program pause check, always returns success)

**Request Format:** Array of objects (supports batch insert)
```json
[
  {
    "ma_kh_dms": "KH00123",
    "phone": "0909xxxxxx",
    "document_id": "101",
    "watch_duration_seconds": 75,
    "time_rate": 1.0,
    "base_point": 4,
    "effective_point": 4,
    "inserted_at": "2025-12-16 10:30:00"
  }
]
```

**Field Mapping:**
- `ma_kh_dms` - Customer code in DMS system
- `phone` - User phone number
- `document_id` - Document ID being viewed (string format)
- `watch_duration_seconds` - Total seconds user watched document (integer)
- `time_rate` - Time rate coefficient [0, 1] (numeric 3,2)
  - **Formula:** 
    - 0-60s: linear 0 → 0.5
    - 60s: **0.5** (50%)
    - 60-120s: linear 0.5 → 1.0
    - 120s+: **1.0** (100%)
  - **Examples:**
    - 30s → 0.25
    - 60s → 0.5
    - 90s → 0.75
    - 120s+ → 1.0
- `base_point` - Base points for document from `nvbc_docs.point` (numeric)
- `effective_point` - Effective points earned = `base_point * time_rate` (numeric)
- `inserted_at` - UTC+7 timestamp format: `"YYYY-MM-DD HH:MM:SS"` (no T, no Z)

**Headers:**
```
Content-Type: application/json
```

**Note:** 
- No Bearer token required
- Endpoint configurable via Admin panel: `localStorage.getItem('app_sync_point_api_endpoint')`
- Called after user views document for minimum duration (default 60s)
- Only called once per document (cooldown period applies)

**Response (Success):**
```json
{
  "status": "ok",
  "streak_info": "Ghi nhận streak thành công",
  "referral_bonus": null,
  "success_message": "Đã nhận thông tin thành công !!!"
}
```

**Response Fields:**
- `status` - "ok" means success
- `streak_info` - Streak tracking message (consecutive day tracking)
- `referral_bonus` - Referral bonus info (null if not applicable)
- `success_message` - User-facing success message

**Response (Business Logic - Program Paused, only without test=1):**
```json
{
  "status": "fail",
  "error_message": "Chương trình tạm dừng ghi nhận từ 27/12/2025 đến 31/01/2026."
}
```

**Test:**
```bash
# Normal mode (subject to business logic)
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/" \
  -H "Content-Type: application/json" \
  -d '[{
    "ma_kh_dms":"KH00123",
    "phone":"0909xxxxxx",
    "document_id":"101",
    "watch_duration_seconds":75,
    "time_rate":1.0,
    "base_point":4,
    "effective_point":4,
    "inserted_at":"2025-12-16 10:30:00"
  }]'

# Test mode (bypasses program pause check)
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1" \
  -H "Content-Type: application/json" \
  -d '[{
    "ma_kh_dms":"KH00123",
    "phone":"0909xxxxxx",
    "document_id":"101",
    "watch_duration_seconds":75,
    "time_rate":1.0,
    "base_point":4,
    "effective_point":4,
    "inserted_at":"2025-12-16 10:30:00"
  }]'
```

**Status:** ✅ WORKING (Use test=1 to bypass program pause)

**Flow:**
1. User opens document in DocumentListPage
2. Timer starts counting viewing time
3. After 60s (configurable), reaches 100%
4. `postViewingHistory()` called → POST to this API
5. On success: Points added to PointsManager, celebration triggered
6. Document marked as "viewed" with cooldown period

---

## 📊 GOOGLE APPS SCRIPT APIs

### 4️⃣ **Google Sheets - Survey/Activity Sync**
```javascript
POST {REACT_APP_GOOGLE_SCRIPT_URL}
```
**File:** `src/services/googleSheetsService.js`

**Request Types:**
```json
// Survey Response
{
  "type": "survey_response",
  "timestamp": "2025-12-27T...",
  "data": {
    "responseId": "...",
    "surveyId": "...",
    "userId": "...",
    "answers": [...],
    "questions": [...]
  }
}

// Activity Log
{
  "type": "activity",
  "timestamp": "2025-12-27T...",
  "data": {
    "userId": "...",
    "activityType": "login",
    "description": "...",
    "duration": 0,
    "page": "/login"
  }
}
```

**Mode:** `no-cors` (response không đọc được)

**Status:** ⚠️ CẦN CẤU HÌNH .env

---

### 5️⃣ **Google Sheets - Admin Config Sync**
```javascript
POST {REACT_APP_ADMIN_CONFIG_SCRIPT_URL}
GET {REACT_APP_ADMIN_CONFIG_SCRIPT_URL}?action=getConfig&name={configName}
```
**File:** `src/services/googleSheetsService.js`

**POST Request:**
```json
{
  "type": "admin_config",
  "data": {
    "configName": "admin_login_page_config",
    "configData": {...},
    "updatedBy": "Admin",
    "timestamp": "2025-12-27T..."
  }
}
```

**GET Response:**
```json
{
  "success": true,
  "config": {...}
}
```

**Status:** ⚠️ CẦN CẤU HÌNH .env

---

### 6️⃣ **Google Sheets - Get Surveys**
```javascript
GET {REACT_APP_GOOGLE_SCRIPT_URL}?action=getSurveys
```
**File:** `src/services/googleSheetsService.js`

**Response:**
```json
{
  "success": true,
  "surveys": [...]
}
```

**Status:** ⚠️ CẦN CẤU HÌNH .env

---

## 📁 FIREBASE APIs (Nếu được enable)

### 7️⃣ **Firebase Firestore**
**File:** `src/services/surveyService.js`

**Collections:**
- `surveys` - Danh sách khảo sát
- `responses` - Câu trả lời khảo sát

**Operations:**
```javascript
// Get all surveys
db.collection('surveys').orderBy('createdAt', 'desc').get()

// Get survey by ID
db.collection('surveys').doc(surveyId).get()

// Add survey
db.collection('surveys').add(surveyData)

// Submit response
db.collection('responses').add(responseData)
```

**Status:** ⚠️ CẦN CẤU HÌNH FIREBASE

---

## 🔧 KIỂM TRA TẤT CẢ APIs

### **1. Test Login API** ✅
```bash
curl -X POST https://bi.meraplion.com/local/nvbc_login/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ" \
  -d '{"phone":"0935025858"}'
```

### **2. Test Get Point API** ✅
```bash
# Real user data
curl "https://bi.meraplion.com/local/nvbc_get_point/?phone=0935025858" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ"

# Test mode (4-point documents, no user data)
curl "https://bi.meraplion.com/local/nvbc_get_point/?test=1" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiTVIyOTY2IiwidXNlcm5hbWUiOiJNUjI5NjYiLCJleHAiOjE3NzU4OTE2MzEsImlhdCI6MTc2MDMzOTYzMX0.SdGtII6-xJjsCL8pvGoZAZiydDbih1vXPhHxmsw6CKQ"
```

### **3. Test Submit Reward API** ✅
```bash
# Test with monthly reward
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/" \
  -H "Content-Type: application/json" \
  -d '[{"phone":"0935025858","value":"Túi đựng mỹ phẩm","value1":"","value2":"","inserted_at":"2025-12-27T10:00:00.000Z"}]'

# Test with all 3 rewards
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/" \
  -H "Content-Type: application/json" \
  -d '[{"phone":"0935025858","value":"Bình giữ nhiệt","value1":"Voucher 50k","value2":"Thẻ quà tặng","inserted_at":"2025-12-27T10:00:00.000Z"}]'
```

### **4. Test Track Document View API** ✅
```bash
# Normal mode (subject to business logic - program currently paused)
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/" \
  -H "Content-Type: application/json" \
  -d '[{
    "ma_kh_dms":"KH00123",
    "phone":"0909xxxxxx",
    "document_id":"101",
    "watch_duration_seconds":75,
    "time_rate":1.0,
    "base_point":4,
    "effective_point":4,
    "inserted_at":"2025-12-16 10:30:00"
  }]'

# Test mode (bypasses program pause - always success)
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1" \
  -H "Content-Type: application/json" \
  -d '[{
    "ma_kh_dms":"KH00123",
    "phone":"0909xxxxxx",
    "document_id":"101",
    "watch_duration_seconds":75,
    "time_rate":1.0,
    "base_point":4,
    "effective_point":4,
    "inserted_at":"2025-12-16 10:30:00"
  }]'
```

---

## 📝 TÓM TẮT

| API | Endpoint | Status | Note |
|-----|----------|--------|------|
| Login | `/nvbc_login/` | ✅ Working | 200 OK |
| Get Point | `/nvbc_get_point/` | ✅ Working | 200 OK, 19KB data |
| Submit Reward | `/post_data/insert_nvbc_reward_item/` | ✅ Working | Array payload, "hết hàng" |
| Track Document View | `/post_data/insert_nvbc_track_view/` | ✅ Working | Use `?test=1` to bypass pause |
| Google Sheets Sync | Script URL | ⚠️ Cần .env | CORS safe (no-cors) |
| Admin Config Sync | Script URL | ⚠️ Cần .env | Cross-device sync |
| Firebase | Firestore | ⚠️ Optional | Nếu enable |

---

## 🔑 Environment Variables Cần Thiết

```env
# Backend API
REACT_APP_API_BASE_URL=https://bi.meraplion.com/local

# Google Apps Script
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
REACT_APP_ADMIN_CONFIG_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ADMIN_CONFIG_SCRIPT_ID/exec

# Optional
REACT_APP_TRACK_PAGE_VIEW=true
REACT_APP_PAGE_VIEW_DELAY=5000
REACT_APP_MAINTENANCE_DEBUG=false
```

---

## 🎯 ACTION ITEMS

- [x] Test Login API ✅
- [x] Test Get Point API ✅
- [x] Test Submit Reward API ✅
- [x] Test Track Document View API ✅
- [ ] Setup Google Apps Script URLs
- [ ] Test Admin Config Sync
- [ ] Verify all API error handling
- [ ] Add API monitoring to all endpoints

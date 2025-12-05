# 🎁 REWARD SELECTION FLOW - COMPLETE LOGIC

**Date:** 16/10/2025  
**Version:** 6.2 Final  
**Status:** ✅ PRODUCTION READY

---

## 📋 OVERVIEW

Hệ thống cho phép user chọn quà tặng **1 LẦN DUY NHẤT** dựa trên điều kiện từ API backend.

---

## 🔄 COMPLETE FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                        1. LOGIN PAGE                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 🔐 Call API: GET /nvbc_get_point/?phone={phone}
                              │
                              ▼
                     📦 Response includes:
                     {
                       "phone": "0982085810",
                       "point": 22,
                       "show_reward_selection": true/false,
                       "th_monthly_reward": true/false,
                       "product_expert_reward": true/false,
                       "avid_reader_reward": true/false,
                       ...
                     }
                              │
                              ▼
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
 show_reward_selection = FALSE      show_reward_selection = TRUE
            │                                   │
            ▼                                   ▼
  Navigate to /introduction        Navigate to /reward-selection
    (Skip reward selection)              (Show reward page)
            │                                   │
            └──────────────┬────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   2. REWARD SELECTION PAGE                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ✅ Check if already submitted?
                     (localStorage check)
                           │
                           ▼
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    Already submitted = true       Already submitted = false
            │                             │
            ▼                             ▼
    Show message:                 Display reward selection:
    "Bạn đã chọn quà tặng rồi!"   - th_monthly_reward (if true)
    Redirect to /dashboard        - product_expert_reward (if true)
                                  - avid_reader_reward (if true)
                                          │
                                          ▼
                                  User selects gifts
                                  (1 gift per reward type)
                                          │
                                          ▼
                                  Click "Xác nhận"
                                          │
                                          ▼
                              Confirmation Modal
                              "Sau khi xác nhận, bạn
                               KHÔNG THỂ thay đổi"
                                          │
                                          ▼
                                  User confirms "OK"
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        3. SUBMIT FLOW                            │
└─────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                  📤 POST to API (PRIMARY):
                  /post_data/insert_nvbc_reward_item/
                  {
                    "phone": "0982085810",
                    "monthlyReward": "Gift A",
                    "dgccReward": "Gift B",
                    "cgspReward": "Gift C"
                  }
                                          │
                                          ▼
                              API Success? ✅
                                          │
                                          ▼
                  📊 Sync to Google Sheets (BACKUP)
                                          │
                                          ▼
                  💾 Save to localStorage (BACKUP)
                  {
                    phone: "...",
                    timestamp: "...",
                    selections: {...}
                  }
                                          │
                                          ▼
                  🔒 Mark as submitted (ONE TIME ONLY):
                  localStorage.setItem(
                    `reward_submitted_${phone}`,
                    'true'
                  )
                                          │
                                          ▼
                  ✅ Show success message
                  "Đã lưu lựa chọn quà tặng!"
                                          │
                                          ▼
                  Navigate to /dashboard
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        4. END STATE                              │
└─────────────────────────────────────────────────────────────────┘
            User CANNOT change selection anymore
            show_reward_selection will be FALSE in next period
```

---

## 🎯 KEY POINTS

### 1️⃣ **LOGIN API**

**Endpoint:** `GET https://bi.meraplion.com/local/nvbc_get_point/?phone={phone}`

**Purpose:**
- Authentication (verify phone exists)
- Get reward status (show_reward_selection, enabled rewards)

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response:**
```json
{
  "phone": "0982085810",
  "point": 22,
  "show_reward_selection": true,      // ⭐ KEY: Show reward page?
  "th_monthly_reward": true,          // Tích cực tháng
  "product_expert_reward": true,      // DGCC/CGSP
  "avid_reader_reward": false,        // Độc giả tích cực
  "contentlist": [...],
  "lich_su_diem": [...]
}
```

### 2️⃣ **NAVIGATION LOGIC**

```javascript
// In LoginPage.js after successful API call:

if (data.show_reward_selection === true) {
  navigate('/reward-selection');      // ✅ Show reward page
} else {
  navigate('/introduction');          // ❌ Skip reward page
}
```

### 3️⃣ **ONE TIME SUBMISSION**

```javascript
// Before loading rewards (RewardSelectionPage.js):

const hasSubmitted = localStorage.getItem(`reward_submitted_${phoneNumber}`);
if (hasSubmitted === 'true') {
  message.info('Bạn đã chọn quà tặng rồi!');
  navigate('/dashboard');
  return;
}
```

```javascript
// After successful submission:

localStorage.setItem(`reward_submitted_${phoneNumber}`, 'true');
// User CANNOT access /reward-selection anymore for this phone
```

### 4️⃣ **SUBMIT API**

**Endpoint:** `POST https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/`

**Payload:**
```json
{
  "phone": "0982085810",
  "monthlyReward": "Máy sấy tóc Philips HP8108",
  "dgccReward": "Quạt cầm tay tốc độ cao Shimono",
  "cgspReward": "Ba lô thời trang Sakos Dahlia"
}
```

**Priority:**
1. ✅ **PRIMARY:** POST to external API
2. 📊 **BACKUP:** Sync to Google Sheets
3. 💾 **BACKUP:** Save to localStorage

---

## 🔐 SECURITY & VALIDATION

### ✅ **Prevents Multiple Submissions:**
- localStorage flag: `reward_submitted_{phone}` = 'true'
- Check on page load
- Redirect to dashboard if already submitted

### ✅ **Validates All Selections:**
```javascript
const allSelected = rewardTypes.every(type => selectedGifts[type]);
if (!allSelected) {
  message.warning('Vui lòng chọn quà cho tất cả các giải thưởng');
  return;
}
```

### ✅ **Confirmation Modal:**
- Shows all selected gifts
- Warning: "Sau khi xác nhận, bạn KHÔNG THỂ thay đổi"
- Requires explicit OK

---

## 📊 DATA FLOW

### **Login Response → State:**
```javascript
localStorage.setItem('rewardStatus', JSON.stringify({
  show_reward_selection: data.show_reward_selection,
  th_monthly_reward: data.th_monthly_reward,
  product_expert_reward: data.product_expert_reward,
  avid_reader_reward: data.avid_reader_reward,
  point: data.point
}));
```

### **Reward Selection → API:**
```javascript
const rewardApiData = {
  phone: phoneNumber,
  monthlyReward: selectedGifts['th_monthly_reward']?.name || '',
  dgccReward: selectedGifts['product_expert_reward']?.name || '',
  cgspReward: selectedGifts['avid_reader_reward']?.name || ''
};

await rewardApiService.postRewardSelection(rewardApiData);
```

---

## 🎨 ADMIN CONFIGURATION

Rewards are configured in **Admin → Introduction Config**:

```json
{
  "reward_key": "th_monthly_reward",      // ⭐ Maps to API field
  "title": "Giải tích cực tháng",
  "icon": "🏆",
  "description": "Dành cho NVBC tích cực nhất tháng",
  "gifts": [
    {
      "id": "gift_1",
      "name": "Máy sấy tóc Philips HP8108",
      "image": "data:image/jpeg;base64,..."
    }
  ]
}
```

**Dynamic Mapping:**
- Frontend reads `reward_key` from admin config
- Matches with API response fields
- Shows only enabled rewards (where API field = true)

---

## 🧪 TESTING SCENARIOS

### ✅ **Scenario 1: Normal Flow**
1. User login → API returns `show_reward_selection: true`
2. Navigate to `/reward-selection`
3. User selects 3 gifts (1 per reward)
4. Click "Xác nhận" → Confirm modal
5. Submit → POST to API → Success
6. Mark as submitted → Navigate to dashboard
7. **Next login:** Skip reward selection (already submitted)

### ✅ **Scenario 2: Skip Reward**
1. User login → API returns `show_reward_selection: false`
2. Navigate to `/introduction` (skip reward page)
3. User cannot access `/reward-selection`

### ✅ **Scenario 3: Already Submitted**
1. User login (after previous submission)
2. Navigate to `/reward-selection`
3. Check `reward_submitted_{phone}` = 'true'
4. Show message → Redirect to dashboard
5. User cannot select again

### ✅ **Scenario 4: API Error**
1. User on `/reward-selection`
2. API call fails
3. Fallback to **demo mode** (mock data)
4. User can still test UI/UX
5. Admin can configure rewards

---

## 📱 USER EXPERIENCE

### **Login Screen:**
```
┌─────────────────────────────┐
│   [MerapLion Logo]          │
│                             │
│   Vui lòng nhập SĐT cho    │
│   lần đăng nhập đầu tiên   │
│                             │
│   [Phone Input]             │
│   [Đăng nhập Button]        │
└─────────────────────────────┘
```

### **Reward Selection Screen:**
```
┌─────────────────────────────┐
│ 🏆 Giải tích cực tháng      │
│ [ ] Gift A                  │
│ [ ] Gift B                  │
│ [ ] Gift C                  │
│                             │
│ 🎯 Giải DGCC/CGSP           │
│ [ ] Gift D                  │
│ [ ] Gift E                  │
│                             │
│ [Xác nhận Button]           │
└─────────────────────────────┘
```

### **Confirmation Modal:**
```
┌──────────────────────────────┐
│ ⚠️ XÁC NHẬN LỰA CHỌN        │
│                              │
│ Bạn đã chọn:                 │
│ • Giải tích cực tháng: Gift A│
│ • Giải DGCC/CGSP: Gift D     │
│                              │
│ ⚠️ Lưu ý: Sau khi xác nhận, │
│    bạn KHÔNG THỂ thay đổi   │
│                              │
│ [Hủy]        [Xác nhận]     │
└──────────────────────────────┘
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Login API endpoint configured
- [x] Bearer token configured
- [x] Submit API endpoint configured
- [x] Admin config with reward_key
- [x] One-time submission check
- [x] Confirmation modal
- [x] Error handling & fallback
- [x] Google Sheets sync
- [x] localStorage backup
- [x] Navigation logic
- [x] User messaging

---

## 📞 API ENDPOINTS SUMMARY

| API | Method | Purpose | Required |
|-----|--------|---------|----------|
| `/nvbc_get_point/?phone={phone}` | GET | Login & reward status | ✅ YES |
| `/post_data/insert_nvbc_reward_item/` | POST | Submit gift selection | ✅ YES |
| Google Apps Script | POST | Backup to Sheets | ⚠️ Optional |

---

## ✅ FINAL STATUS

**Frontend:** ✅ COMPLETE  
**Backend Integration:** ✅ READY  
**Admin Configuration:** ✅ READY  
**One-Time Submission:** ✅ IMPLEMENTED  
**Error Handling:** ✅ COMPLETE  
**Documentation:** ✅ COMPLETE  

---

🎉 **PRODUCTION READY!**

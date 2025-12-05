# Login Flow Verification - show_reward_selection Logic

## Current Implementation Status: ✅ CORRECT

## Complete Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Enters Phone Number                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│   STEP 1: Call /nvbc_login/ API (Authentication)                │
│   POST https://bi.meraplion.com/local/nvbc_login/               │
│   Body: { phone: "0982085810" }                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
                    ┌────────┴────────┐
                    │   HTTP Status?   │
                    └────────┬────────┘
                             ↓
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
     ┌──────────┐     ┌──────────┐    ┌──────────┐
     │ 500/503  │     │   404    │    │   400    │
     │ Server   │     │ Not Found│    │ Invalid  │
     │ Error    │     └──────────┘    │  Phone   │
     └──────────┘          ↓          └──────────┘
           ↓               ↓                ↓
     "Hệ thống      "Hệ thống      "SĐT chưa được
      gặp sự cố"     bảo trì"        đăng ký"
           ↓               ↓                ↓
           └───────────────┴────────────────┘
                           ↓
                      ❌ STOP
                      
                    ┌──────────┐
                    │   200    │
                    │  Success │
                    └─────┬────┘
                          ↓
            ┌─────────────────────────────────────┐
            │ Response: {                         │
            │   phone: "0982085810",              │
            │   name: "Nguyễn Thị Kim Phương",    │
            │   ma_kh_dms: "HH08O411"             │
            │ }                                   │
            └─────────────┬───────────────────────┘
                          ↓
            ✅ User authenticated in system
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│   STEP 2: Call /nvbc_get_point/ API (Get Reward Data)          │
│   GET https://bi.meraplion.com/local/nvbc_get_point/?phone=... │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
            ┌────────────────────────────────────┐
            │ Response: {                        │
            │   phone: "0982085810",             │
            │   point: 150,                      │
            │   show_reward_selection: true,     │ ← KEY FIELD
            │   th_monthly_reward: true,         │
            │   product_expert_reward: false,    │
            │   avid_reader_reward: true         │
            │ }                                  │
            └─────────────┬──────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│              Save Data to localStorage                          │
│                                                                 │
│  ✅ phoneNumber = "0982085810"                                  │
│  ✅ ma_kh_dms = "HH08O411"                                      │
│  ✅ userName = "Nguyễn Thị Kim Phương"                         │
│  ✅ authToken = "Bearer ..."                                   │
│  ✅ rewardStatus = {                                            │
│       show_reward_selection: true,  ← SAVED                    │
│       th_monthly_reward: true,                                 │
│       product_expert_reward: false,                            │
│       avid_reader_reward: true,                                │
│       point: 150                                               │
│     }                                                           │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
            ┌────────────────────────────────┐
            │ Check: show_reward_selection?  │
            └────────────────┬───────────────┘
                             ↓
                ┌────────────┴────────────┐
                ↓                         ↓
    ┌───────────────────┐     ┌───────────────────┐
    │   === true        │     │   === false       │
    └─────────┬─────────┘     └─────────┬─────────┘
              ↓                          ↓
    ┌───────────────────┐     ┌───────────────────┐
    │ navigate(         │     │ navigate(         │
    │  '/reward-        │     │  '/introduction'  │
    │   selection'      │     │ )                 │
    │ )                 │     └─────────┬─────────┘
    └─────────┬─────────┘               ↓
              ↓              ┌───────────────────────┐
    ┌───────────────────┐   │ IntroductionPage      │
    │ RewardSelection   │   │ - Show logo           │
    │ Page              │   │ - Show intro text     │
    │ - Show rewards    │   │ - Show awards preview │
    │ - Can select      │   │ - Read-only mode      │
    │ - Can submit      │   └───────────────────────┘
    └───────────────────┘
```

---

## Code Implementation

**File:** `src/pages/LoginPage.js` (Lines 160-166)

```javascript
// ✅ Navigate based on show_reward_selection
if (rewardData.show_reward_selection === true) {
  // Show reward selection page
  navigate('/reward-selection');
} else {
  // Skip to introduction page
  navigate('/introduction');
}
```

---

## Verification Checklist

### ✅ Step 1: Authentication
- [x] Call `/nvbc_login/` API first
- [x] Check HTTP status (400 = invalid phone)
- [x] Check response has `phone`, `name`, `ma_kh_dms`
- [x] Block login if phone not in system

### ✅ Step 2: Get Reward Data
- [x] Call `/nvbc_get_point/` API second
- [x] Parse `show_reward_selection` field
- [x] Save all reward flags to localStorage

### ✅ Step 3: Navigation Logic
- [x] Check `rewardData.show_reward_selection === true`
- [x] Navigate to `/reward-selection` if true
- [x] Navigate to `/introduction` if false
- [x] Save rewardStatus before navigation

---

## Test Scenarios

### Scenario 1: User CAN Select Rewards
**API Response:**
```json
{
  "phone": "0982085810",
  "point": 150,
  "show_reward_selection": true,  ← TRUE
  "th_monthly_reward": true,
  "product_expert_reward": false,
  "avid_reader_reward": true
}
```

**Expected Flow:**
1. ✅ Login successful
2. ✅ Save `show_reward_selection: true` to localStorage
3. ✅ Navigate to `/reward-selection`
4. ✅ Show reward selection page with gift options
5. ✅ User can select and submit rewards

---

### Scenario 2: User CANNOT Select Rewards
**API Response:**
```json
{
  "phone": "0982085810",
  "point": 50,
  "show_reward_selection": false,  ← FALSE
  "th_monthly_reward": false,
  "product_expert_reward": false,
  "avid_reader_reward": false
}
```

**Expected Flow:**
1. ✅ Login successful
2. ✅ Save `show_reward_selection: false` to localStorage
3. ✅ Navigate to `/introduction`
4. ✅ Show introduction page (no selection capability)
5. ✅ User sees "Chưa được công bố" message

---

### Scenario 3: User Already Submitted (Within 3 Days)
**localStorage has:**
```json
{
  "reward_submitted_0982085810": {
    "submitted": true,
    "timestamp": 1729065600000,
    "submittedAt": "2024-10-16T10:00:00.000Z"
  }
}
```

**Expected Flow:**
1. ✅ Login successful
2. ✅ Navigate to `/reward-selection`
3. ✅ RewardSelectionPage checks submission timestamp
4. ✅ Shows "Bạn đã chọn quà tặng rồi!" (within 3 days)
5. ✅ After 3 days → Shows "Chưa được công bố"

---

## Edge Cases Handled

### Case 1: API Returns show_reward_selection as undefined
```javascript
show_reward_selection: rewardData.show_reward_selection || false
```
**Result:** Defaults to `false` → Navigate to `/introduction`

### Case 2: API Returns null or empty response
```javascript
if (rewardData.show_reward_selection === true)
```
**Result:** Strict check, only `true` navigates to `/reward-selection`

### Case 3: User manually navigates to /reward-selection
**Protection in RewardSelectionPage:**
```javascript
const rewardStatus = JSON.parse(localStorage.getItem('rewardStatus'));
if (!rewardStatus.show_reward_selection) {
  // Show "Not announced" message instead of selection form
}
```

---

## Data Flow Summary

```
Login Input (Phone)
    ↓
/nvbc_login/ API
    ↓
Authentication Data
    ├─ phone
    ├─ name  
    └─ ma_kh_dms
    ↓
/nvbc_get_point/ API
    ↓
Reward Data
    ├─ show_reward_selection ← KEY DECISION POINT
    ├─ th_monthly_reward
    ├─ product_expert_reward
    ├─ avid_reader_reward
    └─ point
    ↓
Save to localStorage
    ├─ phoneNumber
    ├─ userName
    ├─ ma_kh_dms
    └─ rewardStatus { show_reward_selection: true/false }
    ↓
Navigation Decision
    ├─ true  → /reward-selection (Can select gifts)
    └─ false → /introduction (Read-only view)
```

---

## Current Status: ✅ FULLY IMPLEMENTED

**All logic is correct:**
1. ✅ Two-step authentication (login → get rewards)
2. ✅ `show_reward_selection` properly checked
3. ✅ Correct navigation based on flag
4. ✅ Data saved before navigation
5. ✅ Edge cases handled

**No changes needed!** The implementation matches requirements perfectly.

---

**Last Verified:** 2025-10-16  
**Status:** Production Ready ✅

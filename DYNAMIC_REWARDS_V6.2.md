# 🎁 DYNAMIC REWARD SELECTION - V6.2

## 🎯 Overview

**Feature:** Dynamic reward selection system với unlimited reward types.

**Version:** 6.2  
**Date:** 15/10/2025  
**Status:** ✅ Complete

---

## 📊 Vấn Đề Cũ (V6.1)

### ❌ Hardcoded - Chỉ support 3 rewards cố định:

```javascript
// RewardSelectionPage.js - OLD
const rewardTypes = [];
if (rewardData.th_monthly_reward) rewardTypes.push('th_monthly_reward');
if (rewardData.product_expert_reward) rewardTypes.push('product_expert_reward');
if (rewardData.avid_reader_reward) rewardTypes.push('avid_reader_reward');

// Hardcoded titles
const getRewardTitle = (type) => {
  switch (type) {
    case 'th_monthly_reward':
      return '🎁 Thành viên tích cực nhất tháng';
    case 'product_expert_reward':
      return '🏆 Chuyên gia sản phẩm';
    case 'avid_reader_reward':
      return '📚 Đọc giả chăm chỉ';
  }
}
```

**Vấn đề:**
1. ❌ Phải sửa code mỗi khi thêm reward mới
2. ❌ Mapping dựa vào keywords trong title (không chính xác)
3. ❌ API phải thêm field mới cho mỗi reward
4. ❌ Không scale được

---

## ✅ Giải Pháp Mới (V6.2)

### 🔑 Admin Config - Thêm `reward_key` Field

Admin có thể config reward_key để map với API response.

#### Admin Introduction Config Format:
```javascript
{
  "logo": "...",
  "introText": "...",
  "awards": [
    {
      "reward_key": "th_monthly_reward",    // ⭐ NEW: API mapping key
      "title": "Thành viên tích cực nhất tháng",  // Display name
      "icon": "🎁",                         // ⭐ NEW: Display icon
      "description": "Dành cho thành viên tích cực nhất tháng",
      "gifts": [
        { "name": "iPhone 15", "image": "..." },
        { "name": "AirPods Pro", "image": "..." }
      ]
    },
    {
      "reward_key": "product_expert_reward",
      "title": "Chuyên gia sản phẩm",
      "icon": "🏆",
      "description": "Dành cho chuyên gia sản phẩm",
      "gifts": [...]
    },
    {
      "reward_key": "best_active_member",   // ⭐ NEW: Thêm reward mới
      "title": "Tích cực và tốt nhất tháng",
      "icon": "🌟",
      "description": "Giải thưởng đặc biệt cho thành viên xuất sắc",
      "gifts": [...]
    }
  ]
}
```

---

### 📡 API Response Format

API chỉ cần return enabled flags:

```json
{
  "show_reward_selection": true,
  "point": 5500,
  
  // ✅ Enabled rewards (dynamic keys)
  "th_monthly_reward": true,
  "product_expert_reward": true,
  "avid_reader_reward": false,      // Disabled
  "best_active_member": true         // ⭐ NEW: Reward mới
}
```

**Lợi ích:**
- ✅ API chỉ cần enable/disable rewards
- ✅ Admin control reward definitions (title, icon, gifts)
- ✅ Không cần sửa API khi thêm reward mới

---

### 🔄 Dynamic Mapping Logic

#### 1. Load Gifts & Metadata từ Admin Config:

```javascript
// RewardSelectionPage.js - loadAvailableGifts()
const loadAvailableGifts = () => {
  const config = JSON.parse(localStorage.getItem('admin_introduction_config'));
  const awards = config.awards || [];

  const giftsMap = {};
  const rewardMetadata = {};
  
  awards.forEach(award => {
    if (award.reward_key) {
      // ✅ Map by reward_key
      giftsMap[award.reward_key] = award.gifts || [];
      
      // Store metadata for display
      rewardMetadata[award.reward_key] = {
        title: award.title,
        icon: award.icon || '🎁',
        description: award.description
      };
    }
  });

  setAvailableGifts(giftsMap);
  window.rewardMetadata = rewardMetadata;
};
```

#### 2. Dynamic Reward Types từ API:

```javascript
// Get enabled rewards from API response
const rewardTypes = [];
if (rewardData) {
  Object.keys(rewardData).forEach(key => {
    // Skip non-reward keys
    if (key !== 'show_reward_selection' && key !== 'point' && rewardData[key] === true) {
      rewardTypes.push(key);
    }
  });
}
// Result: ['th_monthly_reward', 'product_expert_reward', 'best_active_member']
```

#### 3. Dynamic Title & Icon:

```javascript
const getRewardTitle = (type) => {
  const metadata = window.rewardMetadata || {};
  
  if (metadata[type]) {
    const icon = metadata[type].icon || '🎁';
    const title = metadata[type].title || type;
    return `${icon} ${title}`;
  }
  
  // Fallback
  return `🎁 ${type}`;
};
```

---

## 🎨 Admin Page Changes

### Before (V6.1):
```
Add Award Modal:
- Tên giải thưởng ✓
- Mô tả ✓
- Danh sách quà ✓
```

### After (V6.2):
```
Add Award Modal:
- 🔑 Reward Key (API Mapping) ⭐ NEW
  → Input: th_monthly_reward, best_active_member
  → Pattern: lowercase + underscore only
  
- 📛 Tên giải thưởng (Display) ✓
  → Input: Thành viên tích cực nhất tháng
  
- 🎨 Icon (Emoji) ⭐ NEW
  → Input: 🎁 🏆 📚 🌟 💎
  
- 📝 Mô tả ✓
  → Textarea: Description
  
- 🎁 Danh sách quà ✓
  → Add gifts
```

---

## 📋 Example Use Cases

### Use Case 1: Thêm Reward Mới "Best Active Member"

#### Step 1: Admin Config
```javascript
// Admin → Introduction Config → Add Award
{
  "reward_key": "best_active_member",
  "title": "Tích cực và tốt nhất tháng",
  "icon": "🌟",
  "description": "Giải thưởng đặc biệt",
  "gifts": [...]
}
```

#### Step 2: API Response
```json
{
  "show_reward_selection": true,
  "th_monthly_reward": true,
  "best_active_member": true  // ⭐ Enable new reward
}
```

#### Step 3: Frontend (Auto)
```javascript
// ✅ Frontend automatically shows new reward:
// 🌟 Tích cực và tốt nhất tháng
//   [Gift 1] [Gift 2] [Gift 3]
```

**Kết quả:** Không cần sửa code frontend! 🎉

---

### Use Case 2: Đổi Tên Reward

#### Before:
```javascript
API: "th_monthly_reward": true
Display: "🎁 Thành viên tích cực nhất tháng"
```

#### Change Admin Config Only:
```javascript
{
  "reward_key": "th_monthly_reward",  // Giữ nguyên key
  "title": "Thành viên xuất sắc tháng",  // ⭐ Đổi title
  "icon": "💎",  // ⭐ Đổi icon
  ...
}
```

#### After:
```javascript
API: "th_monthly_reward": true  // Giữ nguyên
Display: "💎 Thành viên xuất sắc tháng"  // ✅ Updated!
```

**Kết quả:** Không cần đợi API update! 🚀

---

### Use Case 3: Nhiều Hơn 3 Rewards

#### Admin Config:
```javascript
{
  "awards": [
    { "reward_key": "th_monthly_reward", ... },
    { "reward_key": "product_expert_reward", ... },
    { "reward_key": "avid_reader_reward", ... },
    { "reward_key": "best_active_member", ... },  // ⭐ 4th reward
    { "reward_key": "top_seller", ... },          // ⭐ 5th reward
    { "reward_key": "customer_favorite", ... }    // ⭐ 6th reward
  ]
}
```

#### API Response:
```json
{
  "show_reward_selection": true,
  "th_monthly_reward": true,
  "product_expert_reward": false,  // Disabled
  "avid_reader_reward": true,
  "best_active_member": true,
  "top_seller": true,
  "customer_favorite": true
}
```

#### Frontend Display:
```
Chúc mừng bạn!
Bạn đã đạt được 5 giải thưởng trong tháng này

🎁 Thành viên tích cực nhất tháng
  [Gift 1] [Gift 2] [Gift 3]

📚 Đọc giả chăm chỉ
  [Gift 1] [Gift 2]

🌟 Tích cực và tốt nhất tháng
  [Gift 1] [Gift 2] [Gift 3]

💰 Top Seller
  [Gift 1] [Gift 2]

❤️ Customer Favorite
  [Gift 1] [Gift 2] [Gift 3]
```

**Kết quả:** Support unlimited rewards! 🎯

---

## 🔧 Implementation Summary

### Files Changed:

#### 1. `src/pages/AdminIntroductionConfig.js`
**Changes:**
- ✅ Added `reward_key` field (required, pattern: lowercase + underscore)
- ✅ Added `icon` field (emoji input)
- ✅ Updated form validation
- ✅ Display reward_key in awards list

**Lines:** 276-310 (Form.Item additions)

---

#### 2. `src/pages/RewardSelectionPage.js`
**Changes:**
- ✅ Dynamic `loadAvailableGifts()` - map by reward_key
- ✅ Store reward metadata (title, icon, description)
- ✅ Dynamic `rewardTypes` - loop through API response
- ✅ Dynamic `getRewardTitle()` - get from metadata
- ✅ Backward compatible with old mapping

**Lines:** 
- 64-123: loadAvailableGifts() refactor
- 131-142: handleSubmitSelection() dynamic check
- 279-299: getRewardTitle() dynamic lookup
- 359-368: rewardTypes dynamic generation

---

## ✅ Testing Guide

### Test 1: Add New Reward

```bash
1. Admin → Introduction Config → Add Award
   - Reward Key: best_active_member
   - Title: Tích cực và tốt nhất tháng
   - Icon: 🌟
   - Description: Giải thưởng đặc biệt
   - Add gifts: [Gift 1, Gift 2]
   
2. Save config

3. Mock API response with new reward:
   {
     "show_reward_selection": true,
     "th_monthly_reward": true,
     "best_active_member": true
   }

4. Navigate to Reward Selection Page

5. Verify:
   ✓ Shows "🌟 Tích cực và tốt nhất tháng"
   ✓ Shows Gift 1, Gift 2
   ✓ Can select gift
   ✓ Can submit
```

---

### Test 2: Change Reward Title/Icon

```bash
1. Admin → Introduction Config → Edit Award
   - Keep reward_key: th_monthly_reward
   - Change title: "Thành viên xuất sắc tháng"
   - Change icon: "💎"
   
2. Save config

3. Refresh Reward Selection Page

4. Verify:
   ✓ Shows "💎 Thành viên xuất sắc tháng"
   ✓ Same gifts as before
   ✓ API unchanged
```

---

### Test 3: Multiple Rewards (5+)

```bash
1. Admin → Introduction Config → Add 5 Awards
   - Award 1: th_monthly_reward
   - Award 2: product_expert_reward
   - Award 3: avid_reader_reward
   - Award 4: best_active_member
   - Award 5: top_seller

2. Mock API: Enable all 5

3. Navigate to Reward Selection Page

4. Verify:
   ✓ Shows all 5 reward sections
   ✓ Can select gift for each
   ✓ Must select all before submit
   ✓ Submit success
```

---

### Test 4: Backward Compatibility

```bash
1. Admin → Introduction Config → Add Award WITHOUT reward_key
   - Title: "Thành viên tích cực nhất tháng"
   - (No reward_key set)

2. Mock API: 
   {
     "th_monthly_reward": true
   }

3. Navigate to Reward Selection Page

4. Verify:
   ✓ Fallback mapping by title keywords works
   ✓ Shows "🎁 Thành viên tích cực nhất tháng"
   ✓ Can select & submit
```

---

## 📊 API Contract

### Request: GET User Reward Status

```http
GET /api/users/{userId}/reward-status
```

### Response Format:

```json
{
  "show_reward_selection": true,  // Show reward selection page
  "point": 5500,                   // User's total points
  
  // Dynamic reward flags (any number of rewards)
  "<reward_key_1>": true/false,
  "<reward_key_2>": true/false,
  "<reward_key_3>": true/false,
  ...
}
```

### Example Responses:

#### Minimum (No rewards):
```json
{
  "show_reward_selection": false,
  "point": 500
}
```

#### Standard (3 rewards):
```json
{
  "show_reward_selection": true,
  "point": 5500,
  "th_monthly_reward": true,
  "product_expert_reward": true,
  "avid_reader_reward": false
}
```

#### Extended (6 rewards):
```json
{
  "show_reward_selection": true,
  "point": 8500,
  "th_monthly_reward": true,
  "product_expert_reward": true,
  "avid_reader_reward": true,
  "best_active_member": true,
  "top_seller": true,
  "customer_favorite": true,
  "special_bonus": false
}
```

---

## 🎯 Changelog

### V6.2 (15/10/2025) - Dynamic Reward Selection
**Changes:**
- ✅ Added `reward_key` field in admin config
- ✅ Added `icon` field for emoji display
- ✅ Dynamic reward mapping (unlimited rewards)
- ✅ Dynamic title & icon display
- ✅ Backward compatible with old mapping
- ✅ No frontend code changes needed for new rewards

**Breaking Changes:** None (backward compatible)

---

## 🚀 Benefits

### For Admin:
✅ Add unlimited rewards without code changes  
✅ Control reward display (title, icon)  
✅ Easy mapping with API via reward_key  
✅ No dependency on frontend team

### For Backend:
✅ Simple API response (just enable/disable flags)  
✅ No need to define reward metadata in API  
✅ Easy to add new rewards (just add new key)

### For Frontend:
✅ No code changes needed for new rewards  
✅ Dynamic rendering based on config  
✅ Backward compatible  
✅ Clean separation of concerns

---

## 📞 Support

### Quick Links:
- **Main Docs:** [GUIDE.md](./GUIDE.md)
- **Feature Docs:** This file
- **Admin Config:** `src/pages/AdminIntroductionConfig.js`
- **Reward Page:** `src/pages/RewardSelectionPage.js`

### Common Issues:

**Q: Reward không show?**
A: Check reward_key trong admin config khớp với API response key

**Q: Title không đúng?**
A: Update title trong admin config (không cần sửa API)

**Q: Thêm reward mới như thế nào?**
A: Admin → Add Award → Set reward_key → API enable key đó

---

**Version:** 6.2  
**Date:** 15/10/2025  
**Status:** ✅ Production Ready

🎉 **UNLIMITED REWARDS - DYNAMIC & FLEXIBLE!** ✨

# 🧪 TEST API REWARD STATUS - V6.2

## 📋 Test Guide

**Date:** 15/10/2025  
**Version:** 6.2  
**Purpose:** Test API `/get_nvbc_reward_status/`

---

## 🔧 Changes Made

### 1. Added `getRewardStatus()` Method

**File:** `src/services/rewardApiService.js`

```javascript
async getRewardStatus(phoneNumber) {
  const endpoint = `https://bi.meraplion.com/local/get_data/get_nvbc_reward_status/?phone=${phoneNumber}`;
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  return data;
}
```

---

### 2. Updated `RewardSelectionPage.js`

**Enhanced Logging:**
```javascript
// Try API first
const apiData = await rewardApiService.getRewardStatus(phoneNumber);

console.log('✅ API Response:', apiData);
console.log('📊 API Fields:', Object.keys(apiData));

// Check each field
if (apiData.show_reward_selection !== undefined) {
  console.log('✅ show_reward_selection:', apiData.show_reward_selection);
} else {
  console.warn('⚠️ Missing: show_reward_selection');
}

// ... check other fields
```

**Fallback to Demo:**
```javascript
catch (apiError) {
  console.error('❌ API Error:', apiError);
  console.log('⚠️ Falling back to demo mode...');
  
  // Use mock data
  const mockData = {
    show_reward_selection: true,
    th_monthly_reward: true,
    product_expert_reward: true,
    avid_reader_reward: true,
    point: 5500
  };
  
  setRewardData(mockData);
}
```

---

## 🧪 Test Steps

### Step 1: Login
```bash
1. Open http://localhost:3000/ambassador
2. Login with phone: 0123456789
3. Check localStorage:
   - phoneNumber: 0123456789
   - authToken: [token]
```

---

### Step 2: Navigate to Reward Selection
```bash
1. Dashboard → Click "Quà tặng" button
   OR
2. Direct: http://localhost:3000/ambassador/reward-selection
```

---

### Step 3: Open Console
```
F12 → Console tab
```

---

### Step 4: Check Logs

#### Expected Logs (API Success):
```
🔍 Testing API - Getting reward status...
📞 Phone: 0123456789
🔍 GET Reward Status from API: https://bi.meraplion.com/...
📡 Response status (no auth): 200
✅ Reward Status API Response: {
  show_reward_selection: true,
  th_monthly_reward: true,
  product_expert_reward: true,
  avid_reader_reward: false,
  point: 5500
}
📊 API Fields: ["show_reward_selection", "th_monthly_reward", "product_expert_reward", "avid_reader_reward", "point"]
✅ show_reward_selection: true
✅ th_monthly_reward: true
✅ product_expert_reward: true
✅ avid_reader_reward: false
```

#### Expected Logs (API Fallback):
```
🔍 Testing API - Getting reward status...
📞 Phone: 0123456789
🔍 GET Reward Status from API: https://bi.meraplion.com/...
📡 Response status (no auth): 404
❌ API Error Response: Not found
❌ Get Reward Status Error: Error: API returned 404: Not found
⚠️ Falling back to demo mode...
✅ Demo mode: All rewards enabled {
  show_reward_selection: true,
  th_monthly_reward: true,
  product_expert_reward: true,
  avid_reader_reward: true,
  point: 5500
}
```

---

## 📋 API Contract

### Expected Request:
```http
GET /local/get_data/get_nvbc_reward_status/?phone=0123456789
Host: bi.meraplion.com
Content-Type: application/json
```

### Expected Response:
```json
{
  "show_reward_selection": true,
  "point": 5500,
  
  // Dynamic reward flags
  "th_monthly_reward": true,
  "product_expert_reward": true,
  "avid_reader_reward": false,
  "best_active_member": true
}
```

### Required Fields:
- ✅ `show_reward_selection` (boolean) - Show/hide reward page
- ✅ `point` (number) - User points
- ✅ Dynamic reward keys (boolean) - Enable/disable each reward

---

## ✅ Validation Checklist

### API Response Validation:
- [ ] `show_reward_selection` field present
- [ ] `show_reward_selection` is boolean
- [ ] `th_monthly_reward` field present
- [ ] `product_expert_reward` field present
- [ ] `avid_reader_reward` field present
- [ ] All reward flags are boolean (true/false)
- [ ] `point` field present (optional)

### Frontend Behavior:
- [ ] If `show_reward_selection: false` → Show "Chưa đủ điều kiện"
- [ ] If `show_reward_selection: true` → Show reward selection
- [ ] Only shows rewards where flag = true
- [ ] Correctly maps reward_key to admin config
- [ ] Shows correct title/icon from admin config
- [ ] Shows correct gifts from admin config

---

## 🔍 Debug Commands

### Test API Manually (Browser Console):
```javascript
// 1. Test getRewardStatus
const phone = localStorage.getItem('phoneNumber');
const result = await rewardApiService.getRewardStatus(phone);
console.log('API Result:', result);

// 2. Check fields
console.log('show_reward_selection:', result.show_reward_selection);
console.log('th_monthly_reward:', result.th_monthly_reward);
console.log('product_expert_reward:', result.product_expert_reward);
console.log('avid_reader_reward:', result.avid_reader_reward);

// 3. Check all keys
console.log('All keys:', Object.keys(result));
```

### Test with cURL:
```bash
curl -X GET "https://bi.meraplion.com/local/get_data/get_nvbc_reward_status/?phone=0123456789" \
  -H "Content-Type: application/json"
```

### Test with Postman:
```
GET https://bi.meraplion.com/local/get_data/get_nvbc_reward_status/?phone=0123456789

Headers:
- Content-Type: application/json
```

---

## 📊 Test Scenarios

### Scenario 1: All Rewards Enabled
```json
API Response:
{
  "show_reward_selection": true,
  "th_monthly_reward": true,
  "product_expert_reward": true,
  "avid_reader_reward": true,
  "point": 5500
}

Expected Display:
- Shows all 3 rewards
- Can select gift for each
- Can submit selection
```

---

### Scenario 2: Partial Rewards
```json
API Response:
{
  "show_reward_selection": true,
  "th_monthly_reward": true,
  "product_expert_reward": false,
  "avid_reader_reward": true,
  "point": 3000
}

Expected Display:
- Shows 2 rewards (th_monthly_reward, avid_reader_reward)
- Does NOT show product_expert_reward
- Can submit with 2 selections
```

---

### Scenario 3: No Rewards
```json
API Response:
{
  "show_reward_selection": false,
  "th_monthly_reward": false,
  "product_expert_reward": false,
  "avid_reader_reward": false,
  "point": 500
}

Expected Display:
- Shows "Chưa đủ điều kiện nhận thưởng"
- No reward selection shown
```

---

### Scenario 4: New Reward (Dynamic)
```json
API Response:
{
  "show_reward_selection": true,
  "th_monthly_reward": true,
  "best_hot_member": true,  // ⭐ NEW
  "point": 6500
}

Expected Display:
- Shows 2 rewards
- 🎁 Thành viên tích cực nhất tháng
- 🔥 Thành viên Hot nhất tháng (if configured in admin)
```

---

## 🐛 Common Issues

### Issue 1: API 404 Not Found
```
❌ API returned 404: Not found
```

**Solution:**
- Check API endpoint URL
- Verify backend deployed
- Falls back to demo mode (OK for testing)

---

### Issue 2: CORS Error
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solution:**
- Backend must enable CORS
- Add `Access-Control-Allow-Origin: *`
- Or use proxy in development

---

### Issue 3: Missing Fields
```
⚠️ Missing: show_reward_selection
```

**Solution:**
- Backend must return all required fields
- Check API response format
- Update backend to match contract

---

### Issue 4: Wrong Data Type
```
show_reward_selection: "true" (string)
```

**Solution:**
- Should be boolean: `true` not `"true"`
- Backend must return correct types

---

## 📞 Support

**API Endpoint:**
```
https://bi.meraplion.com/local/get_data/get_nvbc_reward_status/
```

**Query Params:**
- `phone` (required) - User phone number

**Response Format:**
- JSON object
- Boolean flags for each reward
- `show_reward_selection` boolean
- `point` number (optional)

---

**Status:** ✅ Ready to Test

**Next:** 
1. Login to app
2. Navigate to reward selection
3. Check console logs
4. Verify API response format

🧪 **TEST & REPORT RESULTS!** 🚀

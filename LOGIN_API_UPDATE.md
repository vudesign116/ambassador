# 🔄 UPDATED LOGIN API FLOW

## 📋 Tổng quan

Đã cập nhật logic login để sử dụng API mới và check điều kiện hiển thị popup người giới thiệu.

## 🔗 API Endpoints

### 1. Login API (NEW)
```
GET https://bi.meraplion.com/local/get_data/get_nvbc_login/?test=1&phone={phone}
```

**Response:**
```json
{
  "name": "Ngô Chí Toàn",
  "phone": "0344406126",
  "ma_kh_dms": "00180400",
  "is_valid_invitee": true  // ← NEW KEY
}
```

**Mục đích:** 
- Xác thực user
- Lấy thông tin cơ bản (name, ma_kh_dms)
- Lấy `is_valid_invitee` để check điều kiện hiển thị popup referral

### 2. Reward Status API
```
GET https://bi.meraplion.com/local/nvbc_get_point/?phone={phone}
```

**Response:**
```json
{
  "point": 0,
  "show_reward_selection": false,
  "th_monthly_reward": false,
  "product_expert_reward": false,
  "avid_reader_reward": false,
  "list_chon_monthly": [],
  "list_chon_dgcc": [],
  "list_chon_cgsp": []
}
```

**Mục đích:**
- Lấy điểm số (point)
- Lấy reward status
- Lấy danh sách quà có thể chọn

## 🎯 Logic Hiển thị Popup Người Giới thiệu

### Điều kiện hiển thị:
```javascript
if (is_valid_invitee === true && point === 0) {
  // ✅ Hiển thị popup người giới thiệu
  showReferralModal();
} else {
  // ❌ Bỏ qua, navigate trực tiếp
  navigate('/introduction');
}
```

### Chi tiết:

| is_valid_invitee | point | Hiển thị Popup? | Lý do |
|------------------|-------|----------------|-------|
| `true` | `0` | ✅ **CÓ** | User mới, cần điền người giới thiệu |
| `true` | `> 0` | ❌ KHÔNG | User đã có điểm, bỏ qua |
| `false` | `0` | ❌ KHÔNG | Không phải valid invitee |
| `false` | `> 0` | ❌ KHÔNG | Không phải valid invitee |

## 🔧 Code Implementation

### File: `src/pages/LoginPage.js`

```javascript
// STEP 1: Call login API
const loginResponse = await fetch(
  `${API_BASE_URL}/get_data/get_nvbc_login/?test=1&phone=${phoneNumber.trim()}`,
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
);
const loginData = await loginResponse.json();

// STEP 2: Call reward API
const rewardResponse = await fetch(
  `${API_BASE_URL}/nvbc_get_point/?phone=${phoneNumber}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    }
  }
);
const rewardData = await rewardResponse.json();

// STEP 3: Merge is_valid_invitee (prioritize loginData)
const isValidInvitee = loginData.is_valid_invitee !== undefined 
  ? loginData.is_valid_invitee 
  : (rewardData.is_valid_invitee || false);

// STEP 4: Save to localStorage
const rewardStatus = {
  show_reward_selection: rewardData.show_reward_selection || false,
  th_monthly_reward: rewardData.th_monthly_reward || false,
  product_expert_reward: rewardData.product_expert_reward || false,
  avid_reader_reward: rewardData.avid_reader_reward || false,
  point: rewardData.point || 0,
  is_valid_invitee: isValidInvitee
};
localStorage.setItem('rewardStatus', JSON.stringify(rewardStatus));

// STEP 5: Check referral modal
if (isValidInvitee === true && rewardData.point === 0) {
  // Show referral modal
  setUserMaKhDms(loginData.ma_kh_dms);
  setShowReferralModal(true);
  setPendingNavigation('/introduction');
} else {
  // Navigate directly
  navigate('/introduction');
}
```

## 🧪 Testing

### Test với số điện thoại: `0344406126`

```bash
# Run test script
./test-login-api.sh 0344406126
```

**Expected Output:**
```
✅ is_valid_invitee = true
❌ point = N/A (cần gọi /nvbc_get_point/ để lấy point)
```

### Test trong app:

1. **Mở browser DevTools Console**
2. **Login với số điện thoại test**
3. **Check console logs:**

```javascript
🔍 [LoginPage] Login Response:
  phone: "0344406126"
  ma_kh_dms: "00180400"
  name: "Ngô Chí Toàn"
  is_valid_invitee: true  // ← Có trong login response

🔍 [LoginPage] Checking referral:
  point: 0
  is_valid_invitee_from_login: true
  is_valid_invitee_from_reward: undefined
  is_valid_invitee_merged: true
  shouldShowReferral: true  // ← TRUE nếu point = 0

✅ [LoginPage] is_valid_invitee = true AND point = 0, showing referral modal
```

## 📊 Flow Chart

```
User Login
    ↓
Call /get_data/get_nvbc_login/
    ↓
Get: name, ma_kh_dms, is_valid_invitee
    ↓
Call /nvbc_get_point/
    ↓
Get: point, show_reward_selection, reward lists
    ↓
Check: is_valid_invitee === true && point === 0?
    ↓
   YES → Show Referral Modal → Navigate
    ↓
   NO → Navigate directly
```

## 🔍 Debugging

### Check localStorage:
```javascript
// In browser console
const rewardStatus = JSON.parse(localStorage.getItem('rewardStatus'));
console.log('is_valid_invitee:', rewardStatus.is_valid_invitee);
console.log('point:', rewardStatus.point);
console.log('Should show popup:', rewardStatus.is_valid_invitee === true && rewardStatus.point === 0);
```

### Check API responses:
```bash
# Login API
curl "https://bi.meraplion.com/local/get_data/get_nvbc_login/?test=1&phone=0344406126" | jq '.'

# Reward API
curl "https://bi.meraplion.com/local/nvbc_get_point/?phone=0344406126" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

## 📝 Changes Summary

### Files Modified:
1. ✅ `src/pages/LoginPage.js`
   - Changed login API from `/nvbc_login/` (POST) to `/get_data/get_nvbc_login/` (GET)
   - Added merge logic for `is_valid_invitee` from both APIs
   - Updated referral modal check to use merged `isValidInvitee`

2. ✅ `test-login-api.sh`
   - Updated to test new login API endpoint
   - Added check for `is_valid_invitee` in output

3. ✅ `test-login-api.html`
   - Created test tool with visual UI

### New Logic:
- ✅ Prioritize `is_valid_invitee` from login API
- ✅ Fallback to reward API if not found
- ✅ Check both `is_valid_invitee === true` AND `point === 0`
- ✅ Show popup only when both conditions are met

## ✅ Test Cases

| Test Case | is_valid_invitee | point | Expected |
|-----------|------------------|-------|----------|
| New user | `true` | `0` | ✅ Show popup |
| Existing user | `true` | `100` | ❌ No popup |
| Invalid invitee | `false` | `0` | ❌ No popup |
| Not defined | `undefined` | `0` | ❌ No popup (defaults to false) |

## 🚀 Deployment Checklist

- [x] Update login API endpoint
- [x] Add is_valid_invitee merge logic
- [x] Update referral modal check
- [x] Test with sample phone numbers
- [x] Verify localStorage saves correctly
- [x] Check console logs for debugging
- [ ] Test on production environment
- [ ] Monitor for errors

---

**Last Updated:** 2025-12-29  
**Status:** ✅ Ready for testing

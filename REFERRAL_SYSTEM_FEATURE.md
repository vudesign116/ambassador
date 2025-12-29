# Tính năng Người Giới Thiệu (Referral System)

## 📋 Tổng quan

Sau khi login, nếu user có **điểm = 0** (lần đầu tiên), hệ thống sẽ hiển thị popup cho phép nhập số điện thoại người giới thiệu.

---

## 🔄 Flow Logic

### 1. **Login thành công**
- Call API: `https://bi.meraplion.com/local/nvbc_login/`
- Lấy thông tin: `phone`, `ma_kh_dms`, `name`

### 2. **Kiểm tra điểm**
- Call API: `https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone={phone}&test=1`
- Nếu `point === 0` → **Hiện ReferralModal**
- Nếu `point > 0` → Navigate bình thường

### 3. **User nhập số điện thoại người giới thiệu**
- Validate format (10-11 số, bắt đầu bằng 0)
- Không được tự giới thiệu chính mình

### 4. **Kiểm tra cùng nhà thuốc**
- Call API: `https://bi.meraplion.com/local/nvbc_login/` (POST với body `{"phone": "{referral_phone}"}`)
- Lấy `ma_kh_dms` của người giới thiệu
- So sánh với `ma_kh_dms` của user login:
  - ✅ **Trùng nhau** → Tiếp tục submit
  - ❌ **Khác nhau** → Hiện lỗi: "Người giới thiệu không cùng 1 nhà thuốc, vui lòng kiểm tra lại SĐT người giới thiệu"

**⚠️ Lưu ý:** Phải dùng API `/nvbc_login/` thay vì `/get_nvbc_point/` vì chỉ login API mới trả về `ma_kh_dms`.

### 5. **Submit referral**
- Call API: `https://bi.meraplion.com/local/post_data/insert_nvbc_ref_month_regis/?test=1`
- JSON payload:
```json
[
  {
    "invitee_phone": "0909123456",
    "referral_phone": "0987654321",
    "inserted_at": "2025-12-10T09:30:123"
  }
]
```
- Hiển thị thông báo thành công
- Navigate đến trang tiếp theo

### 6. **Bỏ qua**
- User có thể click "Bỏ qua" để không nhập
- Hiện confirm modal
- Navigate đến trang tiếp theo

---

## 📁 Files thay đổi

### 1. **src/components/ReferralModal.js** (MỚI)
Component popup nhập số điện thoại người giới thiệu:
- Form validation
- Check cùng nhà thuốc
- Submit referral API
- Handle skip

### 2. **src/utils/apiHelper.js**
Thêm 3 functions mới:

#### `getUserInfo(phone)` ⭐ NEW
```javascript
export const getUserInfo = async (phone) => {
  // POST: https://bi.meraplion.com/local/nvbc_login/
  // Returns: { success: boolean, data: { phone, name, ma_kh_dms }, reason?: string }
  // ✅ Dùng để lấy ma_kh_dms của người giới thiệu
}
```

#### `getUserPoints(phone)`
```javascript
export const getUserPoints = async (phone) => {
  // GET: https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone={phone}&test=1
  // Returns: { success: boolean, data: { point, phone }, reason?: string }
  // ⚠️ API này KHÔNG trả ma_kh_dms
}
```

#### `submitReferral(inviteePhone, referralPhone)`
```javascript
export const submitReferral = async (inviteePhone, referralPhone) => {
  // POST: https://bi.meraplion.com/local/post_data/insert_nvbc_ref_month_regis/?test=1
  // Body: [{ invitee_phone, referral_phone, inserted_at }]
  // Returns: { success: boolean, data?: object, reason?: string }
}
```

### 3. **src/pages/LoginPage.js**
Updates:
- Import `ReferralModal` và `apiHelper`
- Add states: `showReferralModal`, `userMaKhDms`, `pendingNavigation`
- Sau khi login thành công, kiểm tra `point === 0`
- Hiện ReferralModal nếu cần
- Navigate sau khi modal đóng

---

## 🧪 Test Cases

### Test 1: First-time user (point = 0)
1. Login với user mới (point = 0)
2. ✅ Modal hiện lên
3. Bỏ qua hoặc nhập referral
4. Navigate đến trang tiếp theo

### Test 2: Existing user (point > 0)
1. Login với user đã có điểm
2. ✅ Modal KHÔNG hiện
3. Navigate trực tiếp đến trang tiếp theo

### Test 3: Valid referral (cùng nhà thuốc)
1. Login first-time user
2. Nhập SĐT người giới thiệu (cùng `ma_kh_dms`)
3. ✅ Submit thành công
4. Hiện thông báo success
5. Navigate

### Test 4: Invalid referral (khác nhà thuốc)
1. Login first-time user
2. Nhập SĐT người giới thiệu (khác `ma_kh_dms`)
3. ❌ Hiện lỗi: "Không cùng nhà thuốc"
4. Không submit, ở lại modal

### Test 5: Invalid phone format
1. Nhập SĐT sai format (8 số, chữ cái, etc.)
2. ✅ Validation error hiện
3. Không cho submit

### Test 6: Self-referral
1. Nhập SĐT chính mình
2. ✅ Validation error: "Không thể tự giới thiệu chính mình"
3. Không cho submit

---

## 🔧 API Endpoints

### 1. Login (Get User Info + ma_kh_dms)
```
POST https://bi.meraplion.com/local/nvbc_login/

Body:
{
  "phone": "0949115346"
}

Response:
{
  "phone": "0949115346",
  "name": "Thủy Tiên",
  "ma_kh_dms": "00180400"
}
```

### 2. Get User Points
```
GET https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone={phone}&test=1

Response:
{
  "status": "ok",
  "phone": "0949115346",
  "point": 0
  // ⚠️ KHÔNG có ma_kh_dms trong response!
}
```

### 3. Submit Referral
```
POST https://bi.meraplion.com/local/post_data/insert_nvbc_ref_month_regis/?test=1

Body:
[
  {
    "invitee_phone": "0909123456",
    "referral_phone": "0987654321",
    "inserted_at": "2025-12-29T14:30:00.123"
  }
]

Response:
{
  "status": "ok",
  "message": "Success"
}
```

---

## 🎨 UI/UX

### Modal Layout
```
┌─────────────────────────────────────────┐
│ 👤 Người giới thiệu                     │
├─────────────────────────────────────────┤
│                                         │
│ Bạn có người giới thiệu tham gia        │
│ chương trình không?                     │
│                                         │
│ Nhập số điện thoại người giới thiệu     │
│ (cùng nhà thuốc) để nhận ưu đãi...     │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 📞 Nhập SĐT (VD: 0987654321)      │   │
│ └───────────────────────────────────┘   │
│                                         │
│                    [Bỏ qua] [Xác nhận] │
│                                         │
│ 💡 Lưu ý: Người giới thiệu phải là     │
│    nhân viên cùng nhà thuốc với bạn    │
└─────────────────────────────────────────┘
```

### Modal Features
- ✅ Centered modal
- ✅ Cannot close by clicking outside (maskClosable=false)
- ✅ Ant Design styling
- ✅ Phone icon prefix
- ✅ Loading state during API calls
- ✅ Clear error messages

---

## 🚀 Deployment

### Production Checklist
- [ ] Remove `?test=1` từ API endpoints
- [ ] Test với real data
- [ ] Verify `ma_kh_dms` matching logic
- [ ] Test error handling
- [ ] Test network failures

---

## 📝 Notes

- **UTC+7 Timestamp**: `inserted_at` format ISO8601 (YYYY-MM-DDTHH:mm:ss.SSS)
- **Validation**: Phone regex `/^0\d{9,10}$/` (10-11 digits)
- **Error Handling**: Show user-friendly messages
- **Skip Option**: User có thể bỏ qua, không bắt buộc
- **One-time popup**: Chỉ hiện khi `point === 0` (first login)

---

## 🔍 Debug

### Console Logs
```javascript
[Login] User point: 0
[Login] First-time user detected. Showing referral modal...
[Referral] Checking referral phone: 0987654321
[Referral] User ma_kh_dms: M1401079, Referral ma_kh_dms: M1401079
[Referral] Same store confirmed. Submitting referral...
[API] Submitting referral: [...]
[API] Referral response: {...}
[Login] Referral modal closed. Submitted: true
[Login] Navigating to: /introduction
```

---

**Ngày tạo:** 2025-12-29  
**Version:** 1.0

# ✨ AUTO POST API AT 100% - FINAL LOGIC

## 📋 YÊU CẦU

1. ✅ Khi đạt **100% (120s)**: Auto POST API **NGAY LẬP TỨC** + Hiện modal thông báo điểm
2. ❌ Khi tắt popup **SAU 100%**: KHÔNG POST API nữa (vì đã POST rồi)
3. ✅ Khi tắt popup **TRƯỚC 100%** (60-119s): POST API với điểm hiện tại
4. ✅ Mỗi document chỉ POST API **1 LẦN DUY NHẤT**

---

## 🎯 FINAL USER FLOW

### **Scenario 1: Xem đủ 100% (≥120s)**

```
t=0s   → Mở document, timer bắt đầu
t=60s  → Đạt 50% → Modal "🎉 Đạt mốc 50%!" (2 điểm)
        User click "Tiếp tục xem"
t=120s → Đạt 100% → 🔥 AUTO POST API NGAY LẬP TỨC
        ✅ POST: https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1
        ✅ Payload: {
             "watch_duration_seconds": 120,
             "time_rate": 1.0,
             "effective_point": 4
           }
        → Confetti animation
        → Loading modal "⏳ Đang lưu điểm..."
        → Success modal "🎊 Hoàn thành & Đã ghi nhận điểm!"
        → hasPostedRef.current = true
t=130s → User click "Tuyệt vời!" để tắt modal
        → closeViewer() → Check hasPostedRef.current = true
        → ❌ KHÔNG POST API (đã POST rồi)
        → performClose() → Đóng viewer
```

**API Calls:** 1 lần duy nhất tại t=120s

---

### **Scenario 2: Tắt viewer SAU khi đạt 100%**

```
t=0s   → Mở document
t=60s  → Modal 50%
t=120s → AUTO POST API → Success modal
t=125s → User click nút X (đóng viewer)
        → closeViewer() → reached100 = true
        → Check hasPostedRef.current = true ✅
        → ❌ KHÔNG POST API (đã POST rồi)
        → performClose() → Đóng viewer
```

**API Calls:** 1 lần duy nhất tại t=120s

---

### **Scenario 3: Tắt viewer TRƯỚC 100% (60-119s)**

```
t=0s  → Mở document
t=60s → Modal 50%
t=75s → User click nút X (tắt viewer)
       → closeViewer() → reached100 = false
       → hasEarnedPoints = true (có 2 điểm)
       → viewingTime >= 60s ✅
       → ✅ POST API ngay lúc này
       → Payload: {
            "watch_duration_seconds": 75,
            "time_rate": 0.625,  // (75-60)/(120-60)*0.5 + 0.5
            "effective_point": 2.5
          }
       → Success modal "🎊 Hoàn thành & Đã ghi nhận điểm!"
       → hasPostedRef.current = true
       → performClose() → Đóng viewer
```

**API Calls:** 1 lần duy nhất tại t=75s

---

### **Scenario 4: Tắt viewer TRƯỚC 50% (<60s)**

```
t=0s  → Mở document
t=30s → User click nút X
       → closeViewer() → earnedPoints = 0
       → Modal confirm "Chưa đủ thời gian xem"
       → User click "Thoát"
       → ❌ KHÔNG POST API
       → performClose() → Đóng viewer
```

**API Calls:** 0

---

## 🔧 CODE CHANGES

### **Change 1: Auto POST immediately at 100%**

**File:** `src/pages/DocumentListPage.js` (Lines 312-322)

**Before:**
```javascript
if (!hasReached100Percent && newTime >= minViewingTime100 && !hasShown100ModalRef.current) {
  setHasReached100Percent(true);
  hasShown100ModalRef.current = true;
  createConfetti();
  
  // Auto POST after 5 seconds ❌
  autoPostTimeoutRef.current = setTimeout(() => {
    if (!hasPostedRef.current) {
      postToAPIAndClose();
    }
  }, 5000);
}
```

**After:**
```javascript
if (!hasReached100Percent && newTime >= minViewingTime100 && !hasShown100ModalRef.current) {
  setHasReached100Percent(true);
  hasShown100ModalRef.current = true;
  createConfetti();
  
  // POST API IMMEDIATELY ✅
  if (!hasPostedRef.current) {
    console.log('[Auto POST] Triggering auto POST immediately at 100% milestone');
    postToAPIAndClose();
  }
}
```

**Impact:** 
- ✅ POST ngay tại giây thứ 120
- ✅ Không cần đợi 5s nữa
- ✅ User nhận thông báo ngay lập tức

---

### **Change 2: closeViewer() logic remains**

**File:** `src/pages/DocumentListPage.js` (Lines 399-411)

```javascript
const closeViewer = () => {
  const hasEarnedPoints = earnedPoints > 0;
  const stillWatching = viewingTime > 0 && viewingTime < minViewingTime100;
  const reached100 = hasReached100Percent || viewingTime >= minViewingTime100;
  
  // Case 1: Chưa đủ thời gian → Confirm dialog
  if (stillWatching && !hasEarnedPoints) {
    Modal.confirm({ ... });
    return;
  }
  
  // Case 2: Đã đạt 100% VÀ chưa POST → POST API
  if (reached100 && !hasPostedRef.current) {
    postToAPIAndClose();
  } 
  // Case 3: Đã đạt 50%-99% VÀ chưa POST → POST API
  else if (hasEarnedPoints && !hasPostedRef.current && viewingTime >= minViewingTime50) {
    postToAPIAndClose();
  }
  // Case 4: Chưa đạt 50% HOẶC đã POST rồi → Thoát luôn
  else {
    performClose(); // ✅ Không POST nữa
  }
};
```

**Logic:**
- ✅ `hasPostedRef.current` được set = `true` sau khi POST thành công
- ✅ Nếu đã POST rồi → rơi vào Case 4 → `performClose()` không POST nữa
- ✅ Mỗi document chỉ POST 1 lần duy nhất

---

## 📊 API PAYLOAD EXAMPLES

### **100% Completion (120s):**
```json
POST /post_data/insert_nvbc_track_view/?test=1
[{
  "ma_kh_dms": "00180400",
  "phone": "0935025858",
  "document_id": "12",
  "watch_duration_seconds": 120,
  "time_rate": 1.0,
  "base_point": 4,
  "effective_point": 4,
  "inserted_at": "2025-12-28 14:25:30"
}]
```

### **75s (62.5% - Early exit):**
```json
POST /post_data/insert_nvbc_track_view/?test=1
[{
  "ma_kh_dms": "00180400",
  "phone": "0935025858",
  "document_id": "12",
  "watch_duration_seconds": 75,
  "time_rate": 0.62,  // Rounded to 2 decimals
  "base_point": 4,
  "effective_point": 2.5,
  "inserted_at": "2025-12-28 14:25:30"
}]
```

**Response:**
```json
{
  "status": "ok",
  "streak_info": "Ghi nhận streak thành công",
  "referral_bonus": null,
  "success_message": "Đã nhận thông tin thành công !!!"
}
```

---

## 🎨 MODAL CONTENT

### **50% Modal (60s):**
```
🎉 Đạt mốc 50%!

Bạn đã xem được 50% thời gian tài liệu!
✅ Nhận được: 2 điểm
💡 Xem thêm 60 giây nữa để nhận đủ 4 điểm!

[Tiếp tục xem]
```

### **100% Success Modal (120s+):**
```
🎊 Hoàn thành & Đã ghi nhận điểm!

🏆 Tổng cộng: 4 điểm
✅ Bạn đã xem đủ 100% thời gian tài liệu
Điểm đã được lưu vào hệ thống thành công

[Tuyệt vời!]
```

---

## 🧪 TEST CASES

### **Test 1: Auto POST at 100%**
**Steps:**
1. Mở document 4 điểm
2. Đợi 60s → Modal 50% xuất hiện
3. Click "Tiếp tục xem"
4. Đợi đến 120s
5. **Verify:** 
   - ✅ Confetti animation xuất hiện
   - ✅ Console log: "[Auto POST] Triggering auto POST immediately at 100% milestone"
   - ✅ Loading modal "⏳ Đang lưu điểm..."
   - ✅ Network tab: POST request to `/insert_nvbc_track_view/?test=1`
   - ✅ Success modal "🎊 Hoàn thành & Đã ghi nhận điểm!"

**Expected:** API call tại giây 120 (không delay)

---

### **Test 2: Không POST lại khi tắt viewer sau 100%**
**Steps:**
1. Làm theo Test 1 đến bước 5
2. Success modal đang hiện
3. Click "Tuyệt vời!" để đóng modal
4. **Verify:**
   - ✅ Viewer đóng ngay
   - ❌ Không có POST request thứ 2
   - ✅ Console không có "[Auto POST]" log thêm

**Expected:** Chỉ có 1 API call duy nhất

---

### **Test 3: POST khi tắt viewer ở 75s**
**Steps:**
1. Mở document
2. Đợi 75s (đã qua 50%)
3. Click nút X để đóng viewer
4. **Verify:**
   - ✅ Loading modal xuất hiện
   - ✅ POST request với `watch_duration_seconds: 75`
   - ✅ `time_rate: 0.62` (hoặc 0.63)
   - ✅ Success modal "🎊 Hoàn thành & Đã ghi nhận điểm!"

**Expected:** API call ngay khi click X

---

### **Test 4: Không POST khi tắt ở 30s**
**Steps:**
1. Mở document
2. Đợi 30s (chưa đến 50%)
3. Click nút X
4. **Verify:**
   - ✅ Confirm modal "Chưa đủ thời gian xem"
   - User click "Thoát"
   - ❌ Không có POST request
   - ✅ Viewer đóng

**Expected:** Không có API call

---

## 📌 KEY POINTS

1. **POST ngay tại 120s** - Không delay 5s nữa
2. **Chỉ POST 1 lần** - `hasPostedRef.current` đảm bảo không duplicate
3. **POST khi tắt sớm** - Nếu ≥60s nhưng <120s, POST với time_rate tương ứng
4. **Không POST nếu <60s** - Hiện confirm dialog thay vì POST

---

## 🚀 BENEFITS

1. ✅ **Faster UX** - User nhận thông báo ngay khi đạt 100%
2. ✅ **No duplicate API calls** - `hasPostedRef.current` flag
3. ✅ **Accurate time tracking** - `time_rate` tính chính xác đến 2 số thập phân
4. ✅ **Flexible exit** - POST khi tắt sớm (60-119s) hoặc đủ 100%

---

## 🔗 RELATED DOCS

- `FIX_DUPLICATE_MODAL_POPUP.md` - Fixed duplicate modals
- `API_DOCUMENTATION.md` - API specs
- `API_TEST_RESULTS.md` - Test results
- `TWO_TIER_NOTIFICATION_FLOW.md` - Complete flow

---

**Updated:** 2025-12-28  
**Status:** ✅ IMPLEMENTED  
**Testing:** Ready for QA

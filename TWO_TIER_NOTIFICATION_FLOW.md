# 🎯 HỆ THỐNG THÔNG BÁO 2 MỐC + GHI NHẬN ĐIỂM

## 📋 Tổng Quan

Hệ thống mới cho phép user nhận **2 modal popups riêng biệt** cho 2 mốc thời gian và **auto POST API sau 5s khi đạt 100%** (hoặc khi đóng viewer).

---

## 🎨 Flow Hoạt Động

### **1. User mở tài liệu**
- Timer bắt đầu đếm
- Progress bar hiển thị % thời gian

### **2. Đạt 60s (50%)**
- `hasReached50Percent` = true
- **Hiện modal popup 50%:**
  ```
  🎉 Đạt mốc 50%!
  
  Bạn đã xem được 50% thời gian tài liệu!
  ✅ Nhận được: 2 điểm
  
  💡 Xem thêm 60 giây nữa để nhận đủ 4 điểm!
  
  [Tiếp tục xem]
  ```
- **KHÔNG** POST API
- User bấm "Tiếp tục xem" → modal đóng, tiếp tục xem

### **3. Đạt 120s (100%)**
- `hasReached100Percent` = true
- **Hiện modal popup 100%:**
  ```
  🎊 Hoàn thành 100%!
  
  Chúc mừng! Bạn đã xem đủ 100% thời gian tài liệu!
  ✅ Nhận thêm: 2 điểm
  
  🏆 Tổng cộng: 4 điểm
  
  [Tuyệt vời!]
  ```
- **Bắt đầu đếm ngược 5s** để auto POST API
- User có thể:
  - Bấm "Tuyệt vời!" → modal đóng, tiếp tục xem
  - Đóng viewer → POST API ngay
  - **Không làm gì trong 5s → Auto POST API**

### **4. Auto POST API (sau 5s khi đạt 100%)**
- Nếu user không đóng viewer trong 5s sau khi đạt 100%
- Tự động gọi `postToAPIAndClose()`
- Hiện loading modal → POST API → Success/Error modal
- **KHÔNG** tự động đóng viewer (chỉ POST API)

### **5. User đóng viewer**

#### **Trường hợp A: Chưa đạt 100%**
- Hiện confirm modal:
  ```
  ⚠️ Chưa đủ thời gian xem
  
  Bạn đã xem được 45 giây
  • Xem 60s → Nhận 50% điểm
  • Xem 120s → Nhận 100% điểm
  
  Bạn có chắc chắn muốn thoát không?
  ```
- User chọn:
  - **"Tiếp tục xem"** → Ở lại xem tiếp
  - **"Thoát"** → Đóng viewer, **KHÔNG POST API**, không ghi nhận điểm

#### **Trường hợp B: Đã đạt 100%**
1. **Hiện loading modal:**
   ```
   ⏳ Đang lưu điểm...
   Vui lòng đợi trong giây lát
   ```

2. **POST API** `/post_data/insert_nvbc_track_view/`

3. **Kết quả API:**

   **✅ Success:**
   ```
   ✅ Đã ghi nhận điểm thành công!
   
   Bạn đã nhận được 4 điểm
   Điểm đã được lưu vào hệ thống
   
   [Đóng]
   ```
   - Mark document as viewed
   - Add to PointsManager
   - Set cooldown period

   **❌ Error:**
   ```
   ⚠️ Lỗi ghi nhận điểm
   
   Không thể lưu điểm. Vui lòng thử lại sau!
   
   [Đóng]
   ```

4. **Sau khi đóng modal xác nhận** → Close viewer và quay về danh sách

---

## 🔧 Chi Tiết Kỹ Thuật

### **State Variables**
```javascript
const [hasReached50Percent, setHasReached50Percent] = useState(false);
const [hasReached100Percent, setHasReached100Percent] = useState(false);
const [earnedPoints, setEarnedPoints] = useState(0);
const [viewingTime, setViewingTime] = useState(0);
const hasPostedRef = React.useRef(false);
const hasMarkedViewedRef = React.useRef(false);
```

### **Timer Logic** (Simplified)
```javascript
const interval = setInterval(() => {
  setViewingTime(prevTime => {
    const newTime = prevTime + 1;
    const basePoints = parseInt(document.points.replace(/[^\d]/g, '')) || 0;
    
    // Calculate earned points (0-50%, 50%-100%)
    let earnedPoints = /* calculation */;
    setEarnedPoints(earnedPoints);
    
    // Track 50% milestone
    if (!hasReached50Percent && newTime >= minViewingTime50) {
      setHasReached50Percent(true);
    }
    
    // Track 100% milestone + show celebration modal
    if (!hasReached100Percent && newTime >= minViewingTime100) {
      setHasReached100Percent(true);
      triggerCelebration(); // Show modal popup
    }
    
    return newTime;
  });
}, 1000);
```

### **Close Viewer Logic**
```javascript
const closeViewer = () => {
  const reached100 = hasReached100Percent || viewingTime >= minViewingTime100;
  
  if (reached100 && !hasPostedRef.current) {
    postToAPIAndClose(); // POST API + Show confirmation
  } else {
    performClose(); // Direct close
  }
};

const postToAPIAndClose = async () => {
  // 1. Show loading modal
  const loadingModal = Modal.info({ title: 'Đang lưu điểm...' });
  
  // 2. POST API
  const result = await postViewingHistory(ma_kh_dms, phoneNumber, documentId);
  
  // 3. Close loading
  loadingModal.destroy();
  
  // 4. Show result modal
  if (result.success) {
    // Mark as viewed
    PointsManager.addEarnedPoint(documentData);
    
    // Show success modal
    Modal.success({
      title: '✅ Đã ghi nhận điểm thành công!',
      content: `Bạn đã nhận được ${earnedPoints} điểm`,
      onOk: () => performClose()
    });
  } else {
    // Show error modal
    Modal.error({
      title: '⚠️ Lỗi ghi nhận điểm',
      onOk: () => performClose()
    });
  }
};
```

---

## 📊 Celebration Modal UI

```jsx
{showCelebration && (
  <div className="celebration-notification">
    <div className="celebration-content">
      <div className="celebration-icon">🎊</div>
      <div className="celebration-text">
        <Title level={3}>Hoàn thành 100%!</Title>
        
        <div>
          ✓ Mốc 60s: <strong>2 điểm (50%)</strong>
        </div>
        <div>
          ✓ Mốc 120s: <strong>2 điểm (50%)</strong>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <strong>Tổng cộng:</strong> 
          <strong style={{ color: '#ffd700' }}>4 điểm</strong>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## ✅ Ưu Điểm

### 1. **User Experience**
- ✅ Nhận feedback ngay khi đạt 100% (celebration modal)
- ✅ Biết chính xác đã nhận bao nhiêu điểm từ mỗi mốc
- ✅ Xác nhận rõ ràng điểm đã được lưu vào hệ thống
- ✅ Không bị spam toast notifications nhỏ

### 2. **API Efficiency**
- ✅ Chỉ POST API 1 lần duy nhất
- ✅ POST khi user thực sự hoàn thành (đóng viewer)
- ✅ Tránh duplicate data
- ✅ Loading state rõ ràng

### 3. **Error Handling**
- ✅ User biết ngay nếu API lỗi
- ✅ Có thể thử lại bằng cách xem lại tài liệu
- ✅ Không lost data nếu lỗi network

---

## 🎯 Test Cases

### Test 1: Xem đủ 120s
1. Mở tài liệu
2. Xem 60s → Không có gì xảy ra
3. Xem 120s → Hiện celebration modal "Hoàn thành 100%!"
4. Click đóng viewer → Loading → Success modal "✅ Đã ghi nhận 4 điểm!"
5. Click OK → Đóng viewer
6. **Kết quả:** Tài liệu marked as viewed, cooldown active

### Test 2: Xem 45s rồi thoát
1. Mở tài liệu
2. Xem 45s
3. Click đóng → Confirm "⚠️ Chưa đủ thời gian xem"
4. Click "Thoát" → Đóng viewer
5. **Kết quả:** Không POST API, không ghi nhận điểm

### Test 3: Xem 120s + API fail
1. Mở tài liệu
2. Xem 120s → Celebration modal
3. Tắt internet (simulate)
4. Click đóng → Loading → Error modal "❌ Lỗi kết nối"
5. Click OK → Đóng viewer
6. **Kết quả:** Không mark as viewed, có thể xem lại

### Test 4: Xem 120s nhiều lần (đã viewed)
1. Lần 1: Xem 120s → POST API success
2. Đóng tài liệu
3. Mở lại cùng tài liệu → Tag "Đã xem" hiện
4. Xem 120s → Celebration modal
5. Đóng → Check `hasPostedRef.current` = true → **KHÔNG POST API lần 2**
6. **Kết quả:** Tránh duplicate

---

## 🔧 Admin Configuration

Có thể điều chỉnh 2 mốc thời gian trong `/admin/general-config`:

```javascript
{
  "pointsViewDuration50": 60,   // 50% at 60s
  "pointsViewDuration100": 120  // 100% at 120s
}
```

**Ví dụ scenarios:**
- Tài liệu ngắn: 50% = 30s, 100% = 60s
- Tài liệu dài: 50% = 90s, 100% = 180s
- Sự kiện đặc biệt: 50% = 15s, 100% = 30s (dễ hơn)

---

## 📝 API Endpoint

**POST** `/post_data/insert_nvbc_track_view/`

**Request:**
```json
[{
  "ma_kh_dms": "00180400",
  "phone": "0935025858",
  "document_id": "62",
  "inserted_at": "2025-12-28T10:30:00"
}]
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Viewing history recorded"
}
```

**Response Fail:**
```json
{
  "status": "fail",
  "error_message": "Chương trình tạm dừng..."
}
```

---

## 🎊 Kết Luận

Hệ thống mới cung cấp:
1. ✅ **User-friendly notifications** - Rõ ràng, không spam
2. ✅ **Efficient API usage** - Chỉ POST 1 lần khi thực sự cần
3. ✅ **Clear confirmation** - User biết chắc điểm đã được lưu
4. ✅ **Better error handling** - Thông báo lỗi rõ ràng
5. ✅ **Flexible configuration** - Admin có thể điều chỉnh 2 mốc

**Enjoy the new notification system! 🚀**

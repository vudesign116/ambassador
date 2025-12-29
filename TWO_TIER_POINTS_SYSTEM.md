# 📊 HỆ THỐNG TÍNH ĐIỂM 2 MỐC THỜI GIAN

## 🎯 Tổng quan

Hệ thống tính điểm mới cho phép user nhận điểm theo 2 mốc thời gian:
- **Mốc 50%**: Xem đủ thời gian → Nhận **50% điểm**
- **Mốc 100%**: Xem đủ thời gian → Nhận **100% điểm**

## ⚙️ Cấu hình

### Admin Panel
Vào `/admin/general-config` để cấu hình:

**Mặc định:**
- Thời gian nhận 50% điểm: **60 giây**
- Thời gian nhận 100% điểm: **120 giây**

**Validation:**
- Mốc 100% phải >= Mốc 50%
- Cả 2 giá trị phải > 0

### LocalStorage Keys
```javascript
app_points_view_duration_50   // Mốc 50%
app_points_view_duration_100  // Mốc 100%
app_points_view_duration      // Backward compatibility (= mốc 100%)
```

## 📐 Công thức tính điểm

### Ví dụ: Tài liệu 4 điểm, 60s = 50%, 120s = 100%

**Range 1: 0-60s (0% → 50%)**
```
earnedPoints = floor((viewingTime / 60) * 2)
```
- 0s → 0 điểm
- 30s → 1 điểm
- 60s → 2 điểm (50%)

**Range 2: 60-120s (50% → 100%)**
```
progressBeyond50 = viewingTime - 60
rangeBeyond50 = 120 - 60 = 60
pointsFor50To100 = (progressBeyond50 / 60) * 2
earnedPoints = floor(2 + pointsFor50To100)
```
- 60s → 2 điểm (50%)
- 90s → 3 điểm (75%)
- 120s → 4 điểm (100%)

**Sau 120s:**
```
earnedPoints = basePoints = 4
```

## 🎨 UI Changes

### Progress Bar
```
0-60s:  0% → 50% (màu xanh dương)
60-120s: 50% → 100% (màu xanh lá)
```

### Exit Confirmation Modal
Khi user thoát trước khi đạt 100%:
```
📢 Chưa đủ thời gian xem

Bạn đã xem được 45 giây.

• Xem 60s → Nhận 50% điểm
• Xem 120s → Nhận 100% điểm

Bạn có chắc chắn muốn thoát không?
```

### Notification (Alert Box)
```
📊 Hệ thống tính điểm theo 2 mốc thời gian

• Mốc 50%: Xem đủ thời gian này → Nhận 50% điểm
• Mốc 100%: Xem đủ thời gian này → Nhận 100% điểm

Ví dụ: Tài liệu có 4 điểm, xem 60s được 2 điểm (50%), 
xem 120s được 4 điểm (100%)
```

## 📁 Files Modified

### 1. AdminGeneralConfig.js
- Added 2 input fields: `pointsViewDuration50`, `pointsViewDuration100`
- Validation: Mốc 100% >= Mốc 50%
- Save to localStorage with 3 keys (including backward compatibility)
- Alert box explaining the 2-tier system

### 2. DocumentListPage.js
**State:**
```javascript
const [minViewingTime50, setMinViewingTime50] = useState(60);
const [minViewingTime100, setMinViewingTime100] = useState(120);
```

**Load config:**
```javascript
useEffect(() => {
  const config = JSON.parse(localStorage.getItem('admin_general_config'));
  setMinViewingTime50(config.pointsViewDuration50 || 60);
  setMinViewingTime100(config.pointsViewDuration100 || 120);
}, []);
```

**Calculate points (in timer):**
```javascript
if (newTime <= minViewingTime50) {
  earnedPoints = Math.floor((newTime / minViewingTime50) * (basePoints / 2));
} else if (newTime <= minViewingTime100) {
  const progressBeyond50 = newTime - minViewingTime50;
  const rangeBeyond50 = minViewingTime100 - minViewingTime50;
  const pointsFor50To100 = (progressBeyond50 / rangeBeyond50) * (basePoints / 2);
  earnedPoints = Math.floor((basePoints / 2) + pointsFor50To100);
} else {
  earnedPoints = basePoints;
}
```

**Progress bar:**
```javascript
const getPointsPercentage = () => {
  if (viewingTime <= minViewingTime50) {
    return Math.floor((viewingTime / minViewingTime50) * 50);
  } else if (viewingTime <= minViewingTime100) {
    const progressBeyond50 = viewingTime - minViewingTime50;
    const rangeBeyond50 = minViewingTime100 - minViewingTime50;
    return Math.floor(50 + (progressBeyond50 / rangeBeyond50) * 50);
  }
  return 100;
};
```

**Trigger API:**
```javascript
if (!hasReached100Percent && newTime >= minViewingTime100) {
  // POST to /post_data/insert_nvbc_track_view/
  // Celebration animation
}
```

## 🧪 Testing

### Test Case 1: Tài liệu 4 điểm, 60s/120s
1. Mở tài liệu
2. Xem 30s → 1 điểm (25%)
3. Xem 60s → 2 điểm (50%) ✅
4. Xem 90s → 3 điểm (75%)
5. Xem 120s → 4 điểm (100%) ✅ → API call + celebration

### Test Case 2: Thoát sớm
1. Xem 45s
2. Click đóng
3. Modal hiện: "Đã xem 45s, cần 60s (50%) hoặc 120s (100%)"
4. Confirm thoát

### Test Case 3: Admin config
1. Vào `/admin/general-config`
2. Set: 50% = 90s, 100% = 180s
3. Save
4. Reload app
5. Verify: Progress bar updates correctly

## 🔄 Backward Compatibility

Vẫn lưu key `app_points_view_duration` = `pointsViewDuration100` để các phần code cũ (nếu có) vẫn hoạt động.

## 📊 Benefits

✅ **Flexible**: Admin có thể adjust 2 mốc độc lập  
✅ **Motivating**: User thấy progress ngay từ 50%  
✅ **Engagement**: Khuyến khích xem lâu hơn để đạt 100%  
✅ **Fair**: Người xem 50% thời gian vẫn nhận được phần thưởng  

## 🎯 Use Cases

**Scenario 1: Tài liệu ngắn (Video 2 phút)**
- 50% = 60s → Nhận 50% điểm
- 100% = 90s → Nhận 100% điểm

**Scenario 2: Tài liệu dài (PDF nhiều trang)**
- 50% = 120s → Nhận 50% điểm
- 100% = 180s → Nhận 100% điểm

**Scenario 3: Sự kiện đặc biệt**
- 50% = 30s → Nhận 50% điểm (dễ hơn)
- 100% = 60s → Nhận 100% điểm

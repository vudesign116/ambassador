# 🎯 HƯỚNG DẪN NHANH - Test Maintenance Mode

## 🚀 Ứng dụng đang chạy tại: http://localhost:3000

---

## 📝 CÁCH TEST NHANH NHẤT

### Phương pháp 1: Sử dụng Test Page (ĐỀ XUẤT)

1. Mở file: `test-maintenance.html` trong trình duyệt
2. Click vào các nút để test:
   - 🚨 **Trigger Maintenance** - Kích hoạt ngay lập tức
   - 💥 **Gây Lỗi API** - Test tự động phát hiện lỗi
   - 📝 **Set LocalStorage** - Test persistence
   - ✨ **Clear Maintenance** - Reset về bình thường

3. Sau khi trigger, reload trang React (http://localhost:3000)

---

### Phương pháp 2: Sử dụng Browser Console

**Bước 1:** Mở http://localhost:3000

**Bước 2:** Mở Developer Tools (F12 hoặc Cmd+Opt+I)

**Bước 3:** Vào tab Console và chạy một trong các lệnh sau:

#### ✅ Test 1: Trigger Maintenance Ngay Lập Tức
```javascript
const event = new CustomEvent('maintenanceMode', {
  detail: { 
    error: {
      message: 'Test maintenance mode',
      status: 500
    }
  }
});
window.dispatchEvent(event);
```

#### ✅ Test 2: Gây 3 Lỗi API (Tự động trigger)
```javascript
for (let i = 0; i < 3; i++) {
  fetch('https://invalid-endpoint.com/test')
    .catch(err => console.log('Error ' + (i+1) + '/3'));
}
```

#### ✅ Test 3: Set LocalStorage
```javascript
localStorage.setItem('maintenanceMode', 'true');
localStorage.setItem('maintenanceError', JSON.stringify({
  message: 'Server đang bảo trì',
  status: 503,
  timestamp: new Date().toISOString()
}));
window.location.reload();
```

#### ✅ Test 4: Clear Maintenance Mode
```javascript
localStorage.removeItem('maintenanceMode');
localStorage.removeItem('maintenanceError');
window.location.reload();
```

---

## 🎨 NHỮNG GÌ BẠN SẼ THẤY

Khi maintenance mode được kích hoạt, bạn sẽ thấy:

- 🛠️ Trang bảo trì với animation xoay công cụ
- 📋 Thông báo: "Hệ thống đang bảo trì"
- 🔍 Chi tiết lỗi trong card màu cam
- 💡 Gợi ý giải pháp
- 🔄 Nút "Thử lại" và "Về trang chủ"

---

## 🔍 KIỂM TRA LOGS

Mở Console và tìm các log sau:

### Khi ghi nhận lỗi:
```
⚠️ API Error recorded: 1/3 {error details}
⚠️ API Error recorded: 2/3 {error details}
⚠️ API Error recorded: 3/3 {error details}
```

### Khi trigger maintenance:
```
❌ Triggering maintenance mode: {error details}
```

---

## 📊 TEST CASES

### ✅ Test Case 1: Lỗi đơn lẻ
- Gây 1 lỗi API
- **Kết quả mong đợi:** Không trigger maintenance (cần 3 lỗi)

### ✅ Test Case 2: 3 lỗi liên tiếp
- Gây 3 lỗi API trong < 1 phút
- **Kết quả mong đợi:** Trigger maintenance mode

### ✅ Test Case 3: Lỗi cách xa nhau
- Gây 2 lỗi, đợi > 1 phút, gây thêm 1 lỗi
- **Kết quả mong đợi:** Không trigger (lỗi cũ đã hết hạn)

### ✅ Test Case 4: Retry từ maintenance
- Vào maintenance mode
- Click "Thử lại"
- **Kết quả mong đợi:** Reload và clear maintenance

---

## 🐛 TROUBLESHOOTING

### ❌ Vấn đề: Console báo lỗi "apiMonitor is not defined"

**Giải pháp:**
```bash
# Stop server (Ctrl+C)
npm start
# Reload browser
```

### ❌ Vấn đề: Maintenance page không hiện

**Kiểm tra:**
1. Console có lỗi không?
2. LocalStorage có key `maintenanceMode` = `'true'` không?
3. Đã reload trang chưa?

**Fix:**
```javascript
// Force trigger
localStorage.setItem('maintenanceMode', 'true');
window.location.reload();
```

### ❌ Vấn đề: CSS không đẹp

**Kiểm tra:**
```bash
# Verify file tồn tại
ls src/styles/MaintenancePage.css
```

---

## 🎯 QUY TRÌNH TEST HOÀN CHỈNH

### Bước 1: Test Trigger Thủ Công ✅
1. Mở http://localhost:3000
2. F12 → Console
3. Chạy CustomEvent code
4. Reload page
5. ✅ Thấy maintenance page

### Bước 2: Test Auto Detection ✅
1. Clear maintenance (reload)
2. Gây 3 lỗi API từ console
3. Đợi vài giây
4. Reload page
5. ✅ Thấy maintenance page

### Bước 3: Test Retry ✅
1. Ở maintenance page
2. Click "Thử lại"
3. ✅ Quay về trang login

### Bước 4: Test Persistence ✅
1. Trigger maintenance
2. Đóng browser
3. Mở lại http://localhost:3000
4. ✅ Vẫn thấy maintenance page

---

## 📱 TEST RESPONSIVE

### Desktop (> 1024px)
- Icon size: 120px
- Card: max-width 800px

### Tablet (768px - 1024px)
- Icon size: 100px (tự động)
- Layout giữ nguyên

### Mobile (< 768px)
- Icon size: 80px
- Buttons full width
- Compact spacing

**Test:** Resize browser hoặc dùng DevTools → Device Mode

---

## 🎊 KẾT QUẢ MONG ĐỢI

Nếu mọi thứ hoạt động đúng:

✅ Có thể trigger maintenance bằng nhiều cách  
✅ Trang maintenance hiển thị đẹp và rõ ràng  
✅ Có thể retry và quay về bình thường  
✅ Auto detection hoạt động với 3 lỗi  
✅ Responsive tốt trên mọi thiết bị  
✅ Logs rõ ràng trong console  

---

## 📞 DEBUG TIPS

```javascript
// Check maintenance status
console.log('Maintenance Mode:', localStorage.getItem('maintenanceMode'));
console.log('Error Details:', localStorage.getItem('maintenanceError'));

// Check API Monitor (if accessible)
if (window.apiMonitor) {
  console.log('Error Count:', window.apiMonitor.errors.length);
  console.log('Is Maintenance:', window.apiMonitor.isInMaintenanceMode());
}
```

---

## 🚀 DEPLOYMENT

Khi deploy production:

1. ✅ Hệ thống tự động hoạt động
2. ✅ Không cần config thêm
3. ✅ Sẵn sàng bắt lỗi real-world

**Lưu ý:** 
- Remove `test-maintenance.html` trước khi deploy
- Hoặc đặt trong folder public nếu muốn giữ để test production

---

**HAPPY TESTING! 🎉**

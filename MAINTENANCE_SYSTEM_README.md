# 🛠️ Hệ Thống Bảo Trì Tự Động (Automatic Maintenance Mode)

## 📋 Tổng Quan

Hệ thống tự động phát hiện và chuyển sang trang bảo trì khi gặp lỗi kết nối API hoặc lỗi server.

### ✨ Tính Năng

- ✅ **Tự động phát hiện lỗi**: Theo dõi tất cả API calls
- ✅ **Lỗi được xử lý**:
  - 400 Bad Request
  - 500 Internal Server Error
  - 502 Bad Gateway
  - 503 Service Unavailable
  - 504 Gateway Timeout
  - Network errors (Failed to fetch)
  - Connection refused
  - CORS errors
  
- ✅ **Smart Detection**: Chỉ kích hoạt maintenance mode khi có 3 lỗi nghiêm trọng trong 1 phút
- ✅ **Giao diện đẹp**: Trang maintenance với animation và hướng dẫn rõ ràng
- ✅ **Chi tiết lỗi**: Hiển thị thông tin lỗi để dễ debug
- ✅ **Retry mechanism**: Nút thử lại để kiểm tra lại kết nối

---

## 📁 Cấu Trúc Files

```
src/
├── pages/
│   └── MaintenancePage.js          # Trang bảo trì UI
├── components/
│   └── APIErrorBoundary.js         # Error boundary bắt lỗi API
├── services/
│   ├── apiMonitor.js               # Service theo dõi API errors
│   └── googleSheetsService.js      # Đã tích hợp apiMonitor
├── styles/
│   └── MaintenancePage.css         # Styles cho trang bảo trì
└── App.js                          # Đã wrap với APIErrorBoundary
```

---

## 🚀 Cách Hoạt Động

### 1. **API Monitor Service** (`apiMonitor.js`)

Tự động theo dõi tất cả API calls:

```javascript
// Tự động setup khi app load
import apiMonitor from './services/apiMonitor';

// Ghi nhận lỗi
apiMonitor.recordError(error);

// Kiểm tra maintenance mode
if (apiMonitor.isInMaintenanceMode()) {
  // Show maintenance page
}

// Reset khi muốn thử lại
apiMonitor.reset();
```

### 2. **Error Detection Logic**

```javascript
// Ngưỡng kích hoạt: 3 lỗi nghiêm trọng trong 1 phút
maxErrors: 3
errorWindow: 60000 (1 phút)

// Các lỗi nghiêm trọng:
- Status codes: 400, 500, 502, 503, 504
- Network errors: "Failed to fetch", "timeout", "connection refused"
- CORS errors
```

### 3. **Automatic Trigger Flow**

```
API Call → Error Occurs → apiMonitor.recordError()
                              ↓
                    Check if critical error
                              ↓
                    Count errors in window (1 min)
                              ↓
                    If errors >= 3 → Trigger Maintenance Mode
                              ↓
                    Dispatch 'maintenanceMode' event
                              ↓
                    APIErrorBoundary catches event
                              ↓
                    Show MaintenancePage
```

---

## 💡 Cách Sử Dụng

### Tự Động (Đã Setup)

Hệ thống **đã được tích hợp sẵn** vào:

1. ✅ **App.js** - Wrapped với `APIErrorBoundary`
2. ✅ **googleSheetsService.js** - Tất cả API calls đều được monitor
3. ✅ **XHR Interceptor** - Tự động bắt XMLHttpRequest errors

**Không cần làm gì thêm!** Hệ thống sẽ tự động hoạt động.

### Test Maintenance Mode

#### Cách 1: Trigger thủ công

```javascript
// Trong console của browser
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

#### Cách 2: Gây lỗi API

```javascript
// Gọi API endpoint không tồn tại nhiều lần
for (let i = 0; i < 3; i++) {
  fetch('https://invalid-api-endpoint.com/test')
    .catch(err => console.log('Error triggered'));
}
```

#### Cách 3: Set localStorage

```javascript
localStorage.setItem('maintenanceMode', 'true');
localStorage.setItem('maintenanceError', JSON.stringify({
  message: 'Server đang bảo trì',
  status: 503
}));
// Sau đó reload trang
window.location.reload();
```

---

## 🎨 Tùy Chỉnh

### Thay Đổi Ngưỡng Lỗi

```javascript
// Trong apiMonitor.js
this.maxErrors = 3;        // Số lỗi tối đa
this.errorWindow = 60000;  // Thời gian window (ms)
```

### Tùy Chỉnh UI

Chỉnh sửa `src/styles/MaintenancePage.css` để thay đổi màu sắc, animation, etc.

### Thêm Loại Lỗi Mới

```javascript
// Trong apiMonitor.js -> isCriticalError()
const criticalStatuses = [400, 500, 502, 503, 504, 429]; // Thêm 429
const criticalPatterns = [
  /failed to fetch/i,
  /network error/i,
  /your-custom-error/i  // Thêm pattern mới
];
```

---

## 🔧 Debugging

### Kiểm Tra Logs

```javascript
// API Monitor sẽ log mọi lỗi
console.warn(`API Error recorded: X/3`, error);

// Khi trigger maintenance
console.error('Triggering maintenance mode:', errorDetails);
```

### Kiểm Tra LocalStorage

```javascript
// Check maintenance mode
localStorage.getItem('maintenanceMode');  // 'true' hoặc null

// Check error details
JSON.parse(localStorage.getItem('maintenanceError'));
```

### Reset Manual

```javascript
// Trong console
localStorage.removeItem('maintenanceMode');
localStorage.removeItem('maintenanceError');
window.location.reload();
```

---

## 📱 Responsive Design

Trang maintenance **tự động responsive** cho:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## ⚙️ Environment Variables

Không cần thêm environment variables mới. Hệ thống sử dụng các biến hiện có:

```env
REACT_APP_GOOGLE_SCRIPT_URL=your_script_url
REACT_APP_ADMIN_CONFIG_SCRIPT_URL=your_admin_config_url
```

---

## 🐛 Troubleshooting

### Lỗi: Maintenance mode không kích hoạt

**Giải pháp:**
1. Kiểm tra console có thấy error logs không
2. Verify rằng lỗi có thuộc danh sách critical errors
3. Check xem đã đủ 3 lỗi trong 1 phút chưa

### Lỗi: Không thể thoát maintenance mode

**Giải pháp:**
```javascript
// Clear localStorage
localStorage.removeItem('maintenanceMode');
localStorage.removeItem('maintenanceError');

// Hoặc click nút "Thử lại" trên trang maintenance
```

### Lỗi: CSS không load

**Giải pháp:**
1. Check import trong `MaintenancePage.js`:
```javascript
import '../styles/MaintenancePage.css';
```
2. Verify file tồn tại: `src/styles/MaintenancePage.css`

---

## 🎯 Best Practices

1. ✅ **Không disable console trong production** nếu cần debug API errors
2. ✅ **Monitor error logs** để phát hiện vấn đề sớm
3. ✅ **Test thường xuyên** maintenance mode để đảm bảo hoạt động
4. ✅ **Tùy chỉnh ngưỡng** phù hợp với traffic của bạn
5. ✅ **Thêm tracking** để biết bao nhiêu users gặp maintenance mode

---

## 📊 Analytics (Optional)

Để track số lần maintenance mode được kích hoạt:

```javascript
// Trong APIErrorBoundary.js -> triggerMaintenanceMode()
googleSheetsService.syncActivity({
  type: 'maintenance_mode_triggered',
  description: 'System entered maintenance mode',
  metadata: errorDetails
});
```

---

## 🚀 Deployment

Hệ thống **đã sẵn sàng** cho production. Chỉ cần:

1. Build project: `npm run build`
2. Deploy như bình thường
3. Hệ thống sẽ tự động hoạt động

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trong browser console
2. Verify API endpoints đang hoạt động
3. Test với các scenarios khác nhau
4. Liên hệ dev team nếu cần hỗ trợ

---

## 🎉 Kết Luận

Hệ thống bảo trì tự động giúp:
- ✅ Trải nghiệm người dùng tốt hơn khi gặp lỗi
- ✅ Tự động phát hiện vấn đề server/network
- ✅ Giảm support tickets từ users
- ✅ Professional error handling

**Enjoy your automatic maintenance system! 🎊**

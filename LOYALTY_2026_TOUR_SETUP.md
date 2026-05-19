# ✅ Cấu Hình Tour Khác - Loyalty 2026

## 📋 Tóm Tắt Thay Đổi

### 1. **HTML Form** (`loyalty-2026/index.html`)
- ✅ **Tour Option 3**: "Tour khác" với text input cho tên tour tùy chỉnh
- ✅ **Event Listener**: Theo dõi giá trị input khi user gõ (real-time tracking)
- ✅ **Form Submission**: Validate và gửi dữ liệu tới Google Sheet

### 2. **JavaScript (HTML)**
#### Thay đổi chi tiết:
```javascript
// ✅ Event listener mới
(function initCustomTourInput() {
  var customInput = document.getElementById('custom-tour-input');
  if (customInput) {
    customInput.addEventListener('input', function(e) {
      customTourName = e.target.value.trim();
    });
  }
})();

// ✅ Hàm selectTour cải thiện
function selectTour(index) {
  // Khi click "Tour khác" (index=2), hiện input
  if (index === 2) {
    customWrapper.classList.add('active');
    customInput.focus(); // Focus vào input
  } else {
    customWrapper.classList.remove('active');
    customInput.value = '';
  }
}

// ✅ Form submission cải thiện
function submitSurvey(e) {
  // Validate custom tour name nếu "Tour khác" được chọn
  if (TOURS[selectedTour].isCustom) {
    tourName = customTourName || document.getElementById('custom-tour-input').value.trim();
    if (!tourName) {
      showToast('Vui lòng nhập tên tour bạn mong muốn.');
      return;
    }
  }
  
  // Gửi dữ liệu tới Google Apps Script
  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      type: 'loyalty2026',
      province: province,
      pharmacy: pharmacy,
      tour: tourName,
      timestamp: new Date().toISOString()
    })
  });
}
```

### 3. **Google Apps Script** (`GOOGLE_APPS_SCRIPT_V6_DYNAMIC_SHEETS.gs`)
#### Case mới trong `doPost()`:
```javascript
case 'loyalty2026':
  return handleLoyalty2026(data);
```

#### Hàm handler mới:
```javascript
function handleLoyalty2026(data) {
  // Tạo sheet "Loyalty 2026" nếu chưa có
  // Columns: STT, Tỉnh/Thành phố, Nhà thuốc, Tour được chọn, Thời gian
  // Append row data tới sheet
}
```

---

## 🔄 Quy Trình Hoạt Động

```
1. User truy cập form
   ↓
2. Chọn Tỉnh + Nhà thuốc
   ↓
3. Chọn "Tour khác"
   ↓
4. Input field hiện lên
   ↓
5. User gõ tên tour mong muốn
   ↓ (real-time tracking via event listener)
   ↓
6. Click "GỬI THÔNG TIN"
   ↓
7. Validate: Tỉnh, Nhà thuốc, Tour name (không để trống)
   ↓
8. POST tới Google Apps Script
   {
     type: 'loyalty2026',
     province: 'Hà Nội',
     pharmacy: 'NT ABC',
     tour: 'Tour Nhật Bản',
     timestamp: '2026-05-19T...'
   }
   ↓
9. Apps Script tạo row trong sheet "Loyalty 2026"
   ↓
10. Show "Cảm ơn" screen
```

---

## 📊 Google Sheet Structure (Loyalty 2026)

| STT | Tỉnh/Thành phố | Nhà thuốc | Tour được chọn | Thời gian |
|-----|---|---|---|---|
| 2 | Hà Nội | NT ABC | Tour Hàn Quốc: Trải Nghiệm Trọn Vẹn Busan | 14:30:45 19/05/2026 |
| 3 | TP HCM | QT XYZ | Tour Nhật Bản | 15:45:20 19/05/2026 |
| 4 | Đà Nẵng | NT DEF | Tour Thái Lan | 16:20:10 19/05/2026 |

---

## ⚙️ Configuration Check

### ✅ HTML Form
- [x] Tour option 3 là "Tour khác"
- [x] Custom input field có id: `custom-tour-input`
- [x] Input field ẩn/hiện dựa trên selection
- [x] Form submit tới Google Apps Script

### ✅ JavaScript
- [x] Event listener track input changes
- [x] selectTour(2) show/hide wrapper
- [x] submitSurvey() validate custom tour name
- [x] Data format: `{type: 'loyalty2026', province, pharmacy, tour, timestamp}`

### ✅ Google Apps Script
- [x] Case 'loyalty2026' trong doPost()
- [x] handleLoyalty2026() function tạo sheet + append row
- [x] Timestamp format: Vietnam timezone (UTC+7)
- [x] Error handling & response logging

---

## 🚀 DEPLOYMENT CHECKLIST

### Step 1: Verify Local Changes
```bash
# Check HTML changes
grep -n "custom-tour-input" loyalty-2026/index.html

# Check Apps Script changes
grep -n "loyalty2026" GOOGLE_APPS_SCRIPT_V6_DYNAMIC_SHEETS.gs
```

### Step 2: Deploy Google Apps Script
1. Go to: https://script.google.com
2. Open project with this Apps Script ID: `AKfycbxHIv1Lhv9UZweqm48Ssrr2GTB_AoUtS--QbCYBY111hRKeC2sfDnxCImAVsd18kW8`
3. Copy code từ `GOOGLE_APPS_SCRIPT_V6_DYNAMIC_SHEETS.gs`
4. Paste + Save
5. Deploy (New Deployment → Type: Web App)
6. Keep same URL hoặc update HTML nếu URL thay đổi

### Step 3: Test Form
1. Open: `https://[your-domain]/loyalty-2026/`
2. Fill form:
   - Chọn Tỉnh: "Hà Nội"
   - Chọn Nhà thuốc: "NT ABC"
   - Chọn "Tour khác"
   - Type: "Tour Nhật Bản"
   - Click "GỬI THÔNG TIN"
3. Verify:
   - ✓ Show "Cảm ơn" screen
   - ✓ Check Google Sheet → "Loyalty 2026" tab
   - ✓ Dữ liệu có trong sheet

### Step 4: Monitor
- Check Console: `console.log` output sẽ show submitted data
- Check Google Sheet: Rows được thêm đúng không
- Check Browser Network: POST request tới Google Apps Script

---

## 🐛 Troubleshooting

### Issue: Custom input không hiện
**Solution**: 
- Check CSS: `.custom-tour-input-wrapper.active { display: block; }`
- Verify onclick handler: `selectTour(2)`
- Browser console: Check cho errors

### Issue: Data không được gửi
**Solution**:
- Check Google Apps Script deployment URL
- Monitor Network tab → see POST request
- Check Apps Script execution logs

### Issue: Data không trong Google Sheet
**Solution**:
- Verify Apps Script được update với handleLoyalty2026()
- Check sheet "Loyalty 2026" có tạo không
- Look at Apps Script logs: Logger.log()

---

## 📝 Notes

- **Custom Tour Name**: Không bắt buộc có "Dấu ấn đài loan" trong tên - user nhập bất kỳ tên gì
- **Validation**: Custom tour name bắt buộc không để trống nếu chọn "Tour khác"
- **Timezone**: Timestamp sẽ in UTC+7 (Vietnam)
- **Data Flow**: HTML → Google Apps Script → Google Sheet (one-way, no response needed)

---

## 📞 Support

Nếu cần debug thêm:
1. Enable Script Editor → Logs → Executions
2. Browser → DevTools → Network tab
3. Check Google Sheet → Formulas → Check data validation

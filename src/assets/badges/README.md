# 🏆 Badge Images Setup

Thư mục này chứa các hình ảnh badge cho ứng dụng MerapLion Ambassador.

## 📁 Cấu trúc file cần thiết:

Bạn cần thêm 3 file PNG với tên chính xác:

```
src/assets/badges/
├── name1.png          # Badge cho Tân Binh (0-500 điểm)
├── name2.png          # Badge cho Học Giả Trẻ (501-1000 điểm)
└── name3.png          # Badge cho Nhà Nghiên Cứu (1001+ điểm)
```

## 🎨 Thông số kỹ thuật:

- **Kích thước**: 80x80px (hoặc tỷ lệ 1:1)
- **Định dạng**: PNG với background trong suốt
- **Chất lượng**: High resolution (khuyến nghị 160x160px rồi scale down)
- **Thiết kế**: Theo mẫu từ hình ảnh đính kèm

## 🔄 Cách thay thế:

1. **Đổi tên file** hình ảnh của bạn theo đúng tên file ở trên
2. **Copy vào thư mục** `/src/assets/badges/`
3. **Xóa file .placeholder** (nếu có)
4. **Refresh browser** để xem thay đổi

## 🛡️ Hệ thống Fallback:

Hiện tại ứng dụng đang chạy với emoji backup:
- 🥉 cho **Tân Binh** (0-500 điểm) - Màu tím
- 🥇 cho **Học Giả Trẻ** (501-1000 điểm) - Màu vàng nhạt  
- 🏆 cho **Nhà Nghiên Cứu** (1001+ điểm) - Màu vàng đậm

## 🎯 Test Badge System:

1. Vào Dashboard (`http://localhost:3000/dashboard`)
2. Click nút **"Demo Badge"** ở góc phải header
3. Xem các mức badge khác nhau thay đổi

## ⚠️ Lưu ý:

- File phải có tên chính xác (không được sai chính tả)
- Định dạng PNG bắt buộc
- Nếu có lỗi, check Console trong DevTools
- Sau khi thêm file, webpack sẽ tự động reload
# MerapLion Ambassador App

Ứng dụng mobile web cho chương trình M.Ambassador của MerapLion, được xây dựng bằng React và Material-UI.

## 🚀 Tính năng

- **Trang đăng nhập**: Đăng nhập bằng số điện thoại với UI đẹp mắt
- **Trang giới thiệu**: Hiển thị thông tin chương trình và các mức thưởng
- **Dashboard**: Theo dõi điểm số, hoạt động và thành tích
- **Popup tương tác**: Hiển thị các nhiệm vụ hàng ngày
- **Responsive**: Thiết kế tối ưu cho mobile

## 🛠️ Công nghệ sử dụng

- **React 18** - Frontend framework
- **Material-UI (MUI)** - Component library và theming
- **React Router** - Routing
- **Firebase** - Backend và database
- **Emotion** - CSS-in-JS styling

## 📱 Giao diện

Ứng dụng bao gồm các trang chính:

1. **Login Page** - Đăng nhập với số điện thoại
2. **Introduction Page** - Giới thiệu chương trình và quà tặng
3. **Dashboard Page** - Theo dõi điểm số và hoạt động
4. **Contact Page** - Thông tin liên hệ CSKH

## 🔧 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd ambassador
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Firebase

1. Tạo project Firebase tại [console.firebase.google.com](https://console.firebase.google.com)
2. Tạo Firestore Database
3. Sao chép config Firebase
4. Cập nhật file `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Cấu trúc Firestore

Tạo các collections sau trong Firestore:

#### Collection: `users`
```javascript
{
  phoneNumber: "0123456789",
  name: "Tên người dùng",
  email: "user@example.com",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Collection: `scores`
```javascript
{
  userId: "user-id",
  totalScore: 520,
  weeklyScore: 100,
  monthlyScore: 300,
  quarterlyScore: 520,
  lastUpdated: timestamp,
  activities: [
    {
      type: "view_document",
      points: 2,
      title: "Xem tài liệu sản phẩm",
      timestamp: timestamp
    }
  ]
}
```

### 5. Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🚀 Deploy lên Firebase Hosting

### 1. Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Đăng nhập Firebase

```bash
firebase login
```

### 3. Khởi tạo Firebase Hosting

```bash
firebase init hosting
```

- Chọn project Firebase
- Chọn `build` làm public directory
- Chọn `Yes` cho single-page app
- Chọn `No` cho overwrite index.html

### 4. Build và deploy

```bash
npm run build
firebase deploy
```

## 📁 Cấu trúc thư mục

```
src/
├── components/          # Shared components
├── pages/              # Page components
│   ├── LoginPage.js
│   ├── IntroductionPage.js
│   ├── DashboardPage.js
│   └── ContactPage.js
├── firebase/           # Firebase config và services
│   ├── config.js
│   └── services.js
├── App.js             # Main App component
└── index.js           # Entry point
```

## 🎨 Thiết kế

- **Màu chính**: #00BFA5 (Teal)
- **Màu phụ**: #26C6DA (Cyan)
- **Font**: Roboto
- **Border radius**: 25px cho buttons, 3-20px cho cards
- **Shadows**: Material Design elevation

## 📱 Responsive Design

Ứng dụng được thiết kế mobile-first và responsive:

- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

## 🔐 Authentication Flow

1. User nhập số điện thoại
2. Hệ thống kiểm tra số điện thoại trong database
3. Nếu tồn tại → chuyển đến Introduction Page
4. Nếu không tồn tại → hiển thị lỗi

## 💾 Data Management

- **LocalStorage**: Lưu thông tin user tạm thời
- **Firestore**: Database chính cho users và scores
- **Real-time updates**: Điểm số được cập nhật real-time

## 🧪 Testing

Để test ứng dụng:

1. Nhập số điện thoại hợp lệ (format Việt Nam)
2. Ứng dụng sẽ accept bất kỳ số nào (demo mode)
3. Navigate qua các trang để test UI/UX

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License

## 🆘 Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.

# 🎯 Ambassador App# Me## 📖 Documentation



> Ứng dụng mobile web cho chương trình M.Ambassador của MerapLion.  ### 📚 Main Documentation Files:

> React + Ant Design + Google Sheets Integration1. **[PROJECT_GUIDE.md](./PROJECT_GUIDE.md)** - Complete guide (MAIN)

   - Quick Start & Setup

**Version:** 6.1 | **Status:** ✅ Production Ready | **Last Updated:** 15/10/2025   - Google Sheets Integration (V6.1)

   - Activity Tracking (6 types)

---   - Survey System (Dynamic)

   - Testing Guide

## 📖 Documentation   - Troubleshooting

   - API Reference

### 👉 Xem hướng dẫn đầy đủ tại: **[GUIDE.md](./GUIDE.md)** ⭐

2. **[CHANGELOG.md](./CHANGELOG.md)** - Version history

**Nội dung GUIDE.md** (18KB - All-in-one):   - V6.1: Clean brackets + docs optimization

- ✅ **Quick Start** - Cài đặt & chạy app (3 phút)   - V6.0: Dynamic surveys + activity tracking

- ✅ **Google Sheets V6.1** - Integration + deployment URL   - Migration guide

- ✅ **6 Activity Types** - Login, logout, page_view, survey, category, document

- ✅ **15s Debounce** - Tối ưu data (giảm 90-95%)3. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project structure

- ✅ **Dynamic Surveys** - 1-10+ câu hỏi mỗi survey   - File organization

- ✅ **Clean Display** - Fix brackets (`["2"]` → `Option B`)   - Documentation guide

- ✅ **Testing Guide** - Test toàn bộ features   - Quick referencessador App

- ✅ **Troubleshooting** - Fix common issues

- ✅ **Changelog** - V6.1, V6.0, V5.0...Ứng dụng mobile web cho chương trình M.Ambassador của MerapLion, được xây dựng bằng React và Material-UI.



---## � Documentation



## 🚀 Quick Start**👉 Xem hướng dẫn đầy đủ tại: [PROJECT_GUIDE.md](./PROJECT_GUIDE.md)**



### 1. InstallationHướng dẫn bao gồm:

```bash- ✅ Quick Start & Setup

npm install- ✅ Google Sheets Integration (V6.1)

```- ✅ Activity Tracking (6 types)

- ✅ Survey System (Dynamic)

### 2. Configuration- ✅ Testing Guide

Edit `.env`:- ✅ Troubleshooting

```bash- ✅ API Reference

REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxRGUN3F3ZaTvL64T4BxUKbCaL2uuO7CjSQ7FEX3Zc886zkQ8IX4XH-xZVEPEOns5Qm/exec

REACT_APP_TRACK_PAGE_VIEW=true## 🚀 Quick Start

REACT_APP_PAGE_VIEW_DELAY=15000

``````bash

npm install

### 3. Run Development Servernpm start

```bash# Open: http://localhost:3000/ambassador

npm start```

# Open: http://localhost:3000/ambassador

```## �🚀 Tính năng



### 4. Build for Production- **Trang đăng nhập**: Đăng nhập bằng số điện thoại với UI đẹp mắt

```bash- **Trang giới thiệu**: Hiển thị thông tin chương trình và các mức thưởng

npm run build- **Dashboard**: Theo dõi điểm số, hoạt động và thành tích

# Output: build/ folder- **Survey System**: Dynamic surveys (1-10+ questions per survey)

```- **Activity Tracking**: 6 types (login, logout, page_view, survey_completed, category_viewed, document_viewed)

- **Google Sheets Sync**: Auto-sync to Google Sheets with Vietnam timezone

---- **Responsive**: Thiết kế tối ưu cho mobile



## ✨ Features## 🛠️ Công nghệ sử dụng



### Core Features- **React 18** - Frontend framework

- ✅ **User Authentication** - Phone login with localStorage- **Material-UI (MUI)** - Component library và theming

- ✅ **Dashboard** - Points, ranking, quick actions- **React Router** - Routing

- ✅ **Dynamic Surveys** - 1-10+ questions per survey, auto-sync to Google Sheets- **Firebase** - Backend và database

- ✅ **Document Library** - 15+ categories with tracking- **Emotion** - CSS-in-JS styling

- ✅ **Reward Selection** - 3 reward types, direct Google Sheets sync

- ✅ **Activity Tracking** - 6 activity types with 15s debounce## 📱 Giao diện



### Activity Tracking (6 Types)Ứng dụng bao gồm các trang chính:

1. **login** - User đăng nhập

2. **logout** - User đăng xuất1. **Login Page** - Đăng nhập với số điện thoại

3. **page_view** - Xem trang (15s debounce, giảm 90-95% data)2. **Introduction Page** - Giới thiệu chương trình và quà tặng

4. **survey_completed** - Hoàn thành khảo sát3. **Dashboard Page** - Theo dõi điểm số và hoạt động

5. **category_viewed** - Xem danh mục tài liệu4. **Contact Page** - Thông tin liên hệ CSKH

6. **document_viewed** - Xem tài liệu

## 🔧 Cài đặt

### Google Sheets V6.1

- ✅ Dynamic survey sheets (variable columns)### 1. Clone repository

- ✅ Activities sheet (10 columns)

- ✅ Reward Selections sheet (7 columns)```bash

- ✅ Clean bracket-free answersgit clone <repository-url>

- ✅ Vietnam timezone (UTC+7)cd ambassador

```

---

### 2. Cài đặt dependencies

## 📦 Project Structure

```bash

```npm install

ambassador/```

├── public/                 # Static assets

├── src/### 3. Cấu hình Firebase

│   ├── components/        # React components

│   │   ├── SurveyModal.js # Survey with tracking1. Tạo project Firebase tại [console.firebase.google.com](https://console.firebase.google.com)

│   │   └── ...2. Tạo Firestore Database

│   ├── pages/            # Page components3. Sao chép config Firebase

│   │   ├── LoginPage.js   # Login + tracking4. Cập nhật file `src/firebase/config.js`:

│   │   ├── DashboardPage.js # Dashboard + logout tracking

│   │   ├── DocumentListPage.js # Category/document tracking```javascript

│   │   └── ...const firebaseConfig = {

│   ├── services/         # API services  apiKey: "your-api-key",

│   │   ├── googleSheetsService.js # Google Sheets sync  authDomain: "your-project.firebaseapp.com",

│   │   └── ...  projectId: "your-project-id",

│   ├── utils/            # Utility functions  storageBucket: "your-project.appspot.com",

│   └── App.js            # Main app + PageViewTracker  messagingSenderId: "your-sender-id",

├── .env                  # Configuration  appId: "your-app-id"

├── GUIDE.md             # Complete guide (18KB)};

├── README.md            # This file```

└── GOOGLE_APPS_SCRIPT_V6_DYNAMIC_SHEETS.gs # Google Apps Script (462 lines)

```### 4. Cấu trúc Firestore



---Tạo các collections sau trong Firestore:



## 🧪 Quick Test#### Collection: `users`

```javascript

### Test Flow (5 phút):{

```bash  phoneNumber: "0123456789",

1. npm start  name: "Tên người dùng",

2. Login với số điện thoại  email: "user@example.com",

3. Stay on Dashboard for 16+ seconds  createdAt: timestamp,

4. Navigate to Documents → Click category → Click document  updatedAt: timestamp

5. Submit survey}

6. Logout```

7. Check Google Sheets → Verify all activities logged

```#### Collection: `scores`

```javascript

### Expected Results:{

- ✅ 6 activities logged in Google Sheets  userId: "user-id",

- ✅ Survey answers clean (no brackets)  totalScore: 520,

- ✅ Timestamps in Vietnam timezone (UTC+7)  weeklyScore: 100,

- ✅ Page view logged only if stayed > 15s  monthlyScore: 300,

  quarterlyScore: 520,

---  lastUpdated: timestamp,

  activities: [

## 🔧 Configuration    {

      type: "view_document",

### Environment Variables      points: 2,

```bash      title: "Xem tài liệu sản phẩm",

# Google Apps Script V6.1      timestamp: timestamp

REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/.../exec    }

  ]

# Activity Tracking}

REACT_APP_TRACK_PAGE_VIEW=true      # Enable/disable page view tracking```

REACT_APP_PAGE_VIEW_DELAY=15000     # 15s debounce (recommended)

```### 5. Chạy ứng dụng



### Tuning Debounce:```bash

```bashnpm start

REACT_APP_PAGE_VIEW_DELAY=10000  # 10s (more logs)```

REACT_APP_PAGE_VIEW_DELAY=15000  # 15s (recommended, 90-95% reduction)

REACT_APP_PAGE_VIEW_DELAY=20000  # 20s (fewer logs)Ứng dụng sẽ chạy tại `http://localhost:3000`

REACT_APP_PAGE_VIEW_DELAY=30000  # 30s (minimal logs)

```## 🚀 Deploy lên Firebase Hosting



---### 1. Cài đặt Firebase CLI



## 🐛 Troubleshooting```bash

npm install -g firebase-tools

### Common Issues:```



#### 1. Import Error### 2. Đăng nhập Firebase

```javascript

// ❌ Wrong```bash

import googleSheetsService from '../services/googleSheetsService';firebase login

```

// ✅ Correct

import { googleSheetsService } from '../services/googleSheetsService';### 3. Khởi tạo Firebase Hosting

```

```bash

#### 2. Survey Shows Bracketsfirebase init hosting

**Problem:** `["2"]` instead of `Option B`  ```

**Solution:** Update to V6.1 in `.env` and restart server

- Chọn project Firebase

#### 3. Too Many Page View Logs- Chọn `build` làm public directory

**Problem:** 20-50 logs per user per day  - Chọn `Yes` cho single-page app

**Solution:** Increase `REACT_APP_PAGE_VIEW_DELAY` to 15000-20000- Chọn `No` cho overwrite index.html



#### 4. Server Won't Start### 4. Build và deploy

```bash

pkill -f "react-scripts"```bash

rm -rf node_modules package-lock.jsonnpm run build

npm installfirebase deploy

npm start```

```

## 📁 Cấu trúc thư mục

---

```

## 📝 Changelogsrc/

├── components/          # Shared components

### V6.1 (15/10/2025) - Bracket Cleaning + Docs Optimization├── pages/              # Page components

- ✅ Fixed bracket display bug (`["2"]` → `Option B`)│   ├── LoginPage.js

- ✅ Optimized documentation (7 MD files → 1 GUIDE.md)│   ├── IntroductionPage.js

- ✅ Updated Google Apps Script deployment URL│   ├── DashboardPage.js

- ✅ Enhanced convertAnswersToReadable() function│   └── ContactPage.js

├── firebase/           # Firebase config và services

### V6.0 (14/10/2025) - Activity Tracking + 15s Debounce│   ├── config.js

- ✅ Implemented 6 activity types│   └── services.js

- ✅ Added 15s debounce for page_view (90-95% reduction)├── App.js             # Main App component

- ✅ Fixed import error in DocumentListPage.js└── index.js           # Entry point

- ✅ Created Activities sheet in Google Sheets```



### V5.0 (10/10/2025) - Dynamic Survey Sheets## 🎨 Thiết kế

- ✅ Dynamic columns per survey (1-10+ questions)

- ✅ Each survey creates own sheet- **Màu chính**: #00BFA5 (Teal)

- ✅ Fixed timezone to Vietnam UTC+7- **Màu phụ**: #26C6DA (Cyan)

- **Font**: Roboto

---- **Border radius**: 25px cho buttons, 3-20px cho cards

- **Shadows**: Material Design elevation

## 📚 Documentation Files

## 📱 Responsive Design

### Available Files:

1. **README.md** (this file) - Quick overviewỨng dụng được thiết kế mobile-first và responsive:

2. **GUIDE.md** (18KB) - Complete guide ⭐

3. **GOOGLE_APPS_SCRIPT_V6_DYNAMIC_SHEETS.gs** (462 lines) - Backend script- Mobile: < 600px

- Tablet: 600px - 960px

### Removed Files (Merged into GUIDE.md):- Desktop: > 960px

- ~~CHANGELOG.md~~ → Merged

- ~~PROJECT_GUIDE.md~~ → Merged## 🔐 Authentication Flow

- ~~PROJECT_STRUCTURE.md~~ → Merged

- ~~DOCS_INDEX.md~~ → Merged1. User nhập số điện thoại

- ~~DOCS_OPTIMIZATION_VISUAL.md~~ → Merged2. Hệ thống kiểm tra số điện thoại trong database

- ~~OPTIMIZATION_SUMMARY.md~~ → Merged3. Nếu tồn tại → chuyển đến Introduction Page

- ~~URL_UPDATE_V6.1.md~~ → Merged4. Nếu không tồn tại → hiển thị lỗi



**Result:** 7 files → 1 GUIDE.md (gọn gàng, dễ quản lý!)## 💾 Data Management



---- **LocalStorage**: Lưu thông tin user tạm thời

- **Firestore**: Database chính cho users và scores

## 🎯 Key Technologies- **Real-time updates**: Điểm số được cập nhật real-time



- **Frontend:** React 18, React Router v6, Ant Design## 🧪 Testing

- **Backend:** Google Apps Script (serverless)

- **Database:** Google SheetsĐể test ứng dụng:

- **Deployment:** Static hosting (Vercel/Netlify ready)

- **Language:** JavaScript (ES6+)1. Nhập số điện thoại hợp lệ (format Việt Nam)

2. Ứng dụng sẽ accept bất kỳ số nào (demo mode)

---3. Navigate qua các trang để test UI/UX



## 📞 Support## 🤝 Contributing



### Quick Links:1. Fork repository

- **App URL:** http://localhost:3000/ambassador2. Tạo feature branch

- **Google Apps Script:** https://script.google.com/macros/s/AKfycbxRGUN3F3ZaTvL64T4BxUKbCaL2uuO7CjSQ7FEX3Zc886zkQ8IX4XH-xZVEPEOns5Qm/exec3. Commit changes

- **Complete Guide:** [GUIDE.md](./GUIDE.md)4. Push to branch

5. Tạo Pull Request

### Contact:

- **Developer:** Anh Vu## 📄 License

- **Project:** Ambassador Rewards System

- **Last Updated:** 15/10/2025MIT License



---## 🆘 Support



## 🎉 Production StatusNếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.


### ✅ Features Complete:
- ✅ User authentication
- ✅ Dashboard & points
- ✅ Dynamic surveys
- ✅ Document library
- ✅ Reward selections
- ✅ 6 activity tracking types
- ✅ 15s debounce optimization
- ✅ Clean bracket-free display
- ✅ Vietnam timezone
- ✅ Google Sheets V6.1 integration

### ✅ Testing:
- ✅ All features tested
- ✅ Data optimized (90-95% reduction)
- ✅ Clean display verified
- ✅ Timezone confirmed (UTC+7)

### ✅ Documentation:
- ✅ Complete guide (GUIDE.md)
- ✅ Quick start (README.md)
- ✅ Troubleshooting guide
- ✅ Changelog

---

**🚀 Ready to deploy!**

For detailed documentation, see **[GUIDE.md](./GUIDE.md)** ⭐

---

**Version:** 6.1 | **Status:** ✅ Production Ready | **Last Updated:** 15/10/2025

# Ambassador App — Tổng Quan Dự Án

> **Phiên bản:** 6.x → 7.x | **Trạng thái:** Production | **Cập nhật:** 30/03/2026

---

## Mục Lục

1. [Giới Thiệu](#1-giới-thiệu)
2. [Kiến Trúc Tổng Quan](#2-kiến-trúc-tổng-quan)
3. [Tech Stack](#3-tech-stack)
4. [Cấu Trúc Codebase](#4-cấu-trúc-codebase)
5. [Luồng Dữ Liệu](#5-luồng-dữ-liệu)
6. [Cấu Hình Môi Trường](#6-cấu-hình-môi-trường)
7. [Hướng Dẫn Deploy](#7-hướng-dẫn-deploy)
8. [Cloud Functions](#8-cloud-functions)
9. [Google Sheets / Apps Script](#9-google-sheets--apps-script)
10. [Admin Panel](#10-admin-panel)
11. [Bảo Mật](#11-bảo-mật)

---

## 1. Giới Thiệu

**Ambassador App** là ứng dụng web mobile-first dành cho chương trình **M.Ambassador** của MerapLion. Ứng dụng cho phép các ambassador:

- Đăng nhập qua hệ thống MerapLion BI API
- Xem điểm thưởng và lịch sử điểm
- Tham gia mini-game, khảo sát
- Nhận thông báo, xem tài liệu, đổi phần thưởng
- Xem bảng xếp hạng và người thắng giải

Toàn bộ cấu hình động (banner, quy tắc tính điểm, phần thưởng, v.v.) được lưu trên **Google Sheets** và đọc qua **Google Apps Script**, không cần backend riêng.

---

## 2. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                  User / Admin (Browser)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│           Firebase Hosting (ambassador-7849e)            │
│              build/ → SPA (React)                        │
│         /api/login  ──►  Cloud Function: login           │
│         /api/getPoints ─► Cloud Function: getPoints      │
└──────────┬───────────────────────────┬───────────────────┘
           │                           │
┌──────────▼───────┐       ┌───────────▼────────────────┐
│ Google Apps      │       │  MerapLion BI API           │
│ Script (2 URLs)  │       │  https://bi.meraplion.com  │
│  - Config data   │       │  /local                    │
│  - Survey data   │       │  (login, getPoints)        │
└──────────────────┘       └────────────────────────────┘
```

**Lý do dùng Cloud Functions làm proxy:**
- Ẩn Bearer token khỏi client-side code
- Bypass CORS của BI API
- Tập trung xử lý lỗi 401 / token hết hạn

---

## 3. Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Frontend framework | React 18 (Create React App) |
| UI library | Ant Design 5 + `@ant-design/icons` |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Rich text editor | React Quill |
| Excel export | XLSX |
| Date handling | Day.js |
| Hosting | Firebase Hosting |
| Backend/API proxy | Firebase Cloud Functions (Node 18) |
| Config storage | Google Sheets + Google Apps Script |
| Auth | MerapLion BI API (JWT Bearer) |
| CI/Deploy | Firebase CLI + `deploy.sh` |

---

## 4. Cấu Trúc Codebase

```
ambassador 2/
├── src/
│   ├── App.js                  # Entry point, định nghĩa tất cả routes
│   ├── index.js                # React DOM render
│   ├── assets/badges/          # Hình ảnh badge
│   ├── components/             # 15 shared components tái sử dụng
│   ├── firebase/
│   │   ├── config.js           # Firebase SDK initialization
│   │   └── services.js         # Firestore helpers (nếu dùng)
│   ├── hooks/
│   │   └── useSurvey.js        # Custom hook cho survey
│   ├── images/                 # Static images
│   ├── layouts/
│   │   └── AdminLayout.js      # Layout wrapper cho admin pages
│   ├── pages/                  # Tất cả page components
│   │   ├── [User Pages]
│   │   ├── [Admin Pages]
│   │   └── admin/              # Admin sub-pages (survey, rewards)
│   ├── services/               # 12 service modules (API calls, Sheets, v.v.)
│   ├── styles/                 # CSS riêng cho một số trang
│   └── utils/                  # 14 utility helpers
├── functions/
│   ├── index.js                # Cloud Functions (login proxy, getPoints proxy)
│   └── package.json
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── build/                      # Output sau `npm run build` (deploy lên Hosting)
├── firebase.json               # Firebase configuration (hosting + functions)
├── .env                        # Biến môi trường (KHÔNG commit lên git công khai)
├── .env.production             # Override cho production build
├── deploy.sh                   # Script deploy tương tác
└── package.json
```

### Pages

#### User Pages (`src/pages/`)

| File | Route | Mô tả |
|---|---|---|
| `LoginPage.js` | `/` | Trang đăng nhập |
| `DashboardPage.js` | `/dashboard` | Trang chính, hiển thị điểm & banner |
| `IntroductionPage.js` | `/introduction` | Giới thiệu chương trình |
| `ScoringRulesPage.js` | `/scoring-rules` | Quy tắc tính điểm |
| `ContactPage.js` | `/contact` | Liên hệ |
| `DocumentListPage.js` | `/documents` | Danh sách tài liệu |
| `MiniGamePage.js` | `/mini-game` | Mini game |
| `PointHistoryPage.js` | `/point-history` | Lịch sử điểm |
| `RewardSelectionPage.js` | `/reward-selection` | Chọn phần thưởng |
| `RewardWinnersPage.js` | `/reward-winners` | Danh sách người thắng |
| `MaintenancePage.js` | *(conditional)* | Trang bảo trì |
| `NotFoundPage.js` | `*` | 404 |
| `ServerErrorPage.js` | `/500` | 500 |

#### Admin Pages (`src/pages/`)

| File | Route | Mô tả |
|---|---|---|
| `AdminLoginPage.js` | `/admin/login` | Đăng nhập admin |
| `AdminDashboard.js` | `/admin/dashboard` | Dashboard admin |
| `AdminDashboardConfig.js` | `/admin/dashboard-config` | Config dashboard |
| `AdminGeneralConfig.js` | `/admin/general-config` | Cấu hình chung |
| `AdminIntroductionConfig.js` | `/admin/introduction-config` | Config trang giới thiệu |
| `AdminLoginPageConfig.js` | `/admin/login-config` | Config trang login |
| `AdminMiniGames.js` | `/admin/mini-games` | Quản lý mini games |
| `AdminNotificationConfig.js` | `/admin/notification-config` | Config thông báo |
| `AdminScoringRulesConfig.js` | `/admin/scoring-rules-config` | Config quy tắc điểm |
| `AdminRewardSelections.js` | `/admin/rewards` | Quản lý phần thưởng |
| `admin/SurveyListPage.js` | `/admin/surveys` | Danh sách khảo sát |
| `admin/SurveyFormPage.js` | `/admin/surveys/new` | Tạo/sửa khảo sát |
| `admin/SurveyResponsesPage.js` | `/admin/surveys/:id/responses` | Xem phản hồi khảo sát |

### Services (`src/services/`)

- **`googleSheetsService.js`** — đọc/ghi config từ Google Sheets qua Apps Script
- **`apiService.js`** / **`apiMonitor.js`** — gọi BI API, theo dõi lỗi
- **`authService.js`** — quản lý JWT, kiểm tra đăng nhập
- Các service khác cho notifications, rewards, surveys, v.v.

### App.js — Các tính năng đặc biệt

- **Console suppression** trong production (`console.log = () => {}`)
- **Config preloading**: tải admin configs từ Google Sheets → `localStorage` khi app khởi động
- **PageViewTracker**: ghi nhận page view sau 30 giây (chỉ khi đã đăng nhập)
- **ScrollToTop**: cuộn lên đầu trang khi chuyển route (fix lỗi iPhone)

---

## 5. Luồng Dữ Liệu

### Đăng nhập

```
User nhập credentials
    → POST /api/login (Firebase Hosting rewrite)
        → Cloud Function `login`
            → POST https://bi.meraplion.com/local/login
                ← JWT token
        ← JWT token
    ← Lưu vào localStorage
```

### Lấy điểm

```
Dashboard mount
    → GET /api/getPoints?userId=xxx (Firebase Hosting rewrite)
        → Cloud Function `getPoints`
            → GET https://bi.meraplion.com/local/getPoints (Bearer JWT)
                ← Dữ liệu điểm
        ← Dữ liệu điểm
    ← Render UI
```

### Config động (Admin → User)

```
Admin thay đổi config
    → Gọi Google Apps Script URL (POST)
        → Ghi vào Google Sheets
Admin lưu
    → User refresh app
        → App đọc Google Sheets qua Apps Script (GET)
            ← JSON config (banner, rules, rewards, v.v.)
        ← Render UI theo config mới
```

---

## 6. Cấu Hình Môi Trường

File `.env` (tạo tại root dự án, **không commit**):

```env
# Google Apps Script endpoint cho config admin
REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Google Apps Script endpoint chỉ cho admin configs
REACT_APP_ADMIN_CONFIG_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ADMIN_SCRIPT_ID/exec

# Base URL của MerapLion BI API
REACT_APP_API_BASE_URL=https://bi.meraplion.com/local

# Phiên bản API (dùng để versioning)
REACT_APP_API_VERSION=ambassador.2026.01.01

# Bearer token để gọi BI API (chỉ dùng trong Cloud Functions)
REACT_APP_API_TOKEN=your_bearer_token_here

# Bật/tắt theo dõi page views
REACT_APP_TRACK_PAGE_VIEW=true

# Thời gian delay trước khi ghi nhận page view (ms)
REACT_APP_PAGE_VIEW_DELAY=30000
```

File `.env.production`:

```env
GENERATE_SOURCEMAP=false
```

> ⚠️ **Lưu ý bảo mật:** Các giá trị `REACT_APP_*` sẽ được bundle vào JavaScript client-side. Không đặt secret thực sự nhạy cảm ở đây — bearer token nên chỉ tồn tại trong Cloud Functions environment variables.

---

## 7. Hướng Dẫn Deploy

### Yêu Cầu

- Node.js ≥ 18
- Firebase CLI: `npm install -g firebase-tools`
- Đã đăng nhập: `firebase login`
- Project ID: `ambassador-7849e`

### Deploy nhanh với script

```bash
chmod +x deploy.sh
./deploy.sh
```

Script sẽ hỏi lần lượt:
1. Pull code mới từ git không? (`y/n`)
2. Chạy `npm install` không? (`y/n`)
3. Build và deploy lên Firebase Hosting

### Deploy với Service Account (không cần `firebase login`)

Dùng khi chạy trong CI/CD hoặc môi trường không có browser để xác thực:

```bash
cd "/Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador 2" && \
GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json" \
npx -y firebase-tools deploy --only hosting --project ambassador-7849e
```

> ⚠️ Yêu cầu file `firebase-service-account.json` tồn tại tại root dự án và có quyền **Firebase Hosting Admin**.

### Deploy thủ công — Chỉ Hosting

```bash
# 1. Cài dependencies
npm install

# 2. Build production
npm run build

# 3. Deploy lên Firebase Hosting
firebase deploy --only hosting
```

### Deploy thủ công — Chỉ Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Deploy toàn bộ (Hosting + Functions)

```bash
npm run build
firebase deploy
```

### Kiểm tra sau deploy

```bash
# Xem danh sách hosting channels
firebase hosting:channel:list

# Xem logs Cloud Functions
firebase functions:log
```

**URL Production:** `https://ambassador-7849e.web.app` hoặc custom domain đã cấu hình.

### Lưu Ý Về `firebase.json`

```json
{
  "hosting": {
    "public": "build",
    "rewrites": [
      { "source": "/api/login", "function": "login" },
      { "source": "/api/getPoints", "function": "getPoints" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|gif|svg|ico|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      },
      {
        "source": "/index.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  },
  "functions": {
    "runtime": "nodejs18",
    "source": "functions"
  }
}
```

---

## 8. Cloud Functions

File: `functions/index.js`

### `login` — Proxy đăng nhập

```
POST /api/login
Body: { username, password }
→ Forward tới BI API với Bearer token header
← Trả về JWT hoặc lỗi
```

### `getPoints` — Proxy lấy điểm

```
GET /api/getPoints?userId=xxx
→ Forward tới BI API với Bearer token + userId
← Trả về dữ liệu điểm ambassador
```

### Cập nhật environment variables cho Functions

```bash
firebase functions:config:set api.token="YOUR_BEARER_TOKEN"
firebase deploy --only functions
```

---

## 9. Google Sheets / Apps Script

Dự án dùng **2 Google Apps Script** endpoints:

| Biến môi trường | Mục đích |
|---|---|
| `REACT_APP_GOOGLE_SCRIPT_URL` | Đọc/ghi tất cả config (banner, rules, rewards, surveys) |
| `REACT_APP_ADMIN_CONFIG_SCRIPT_URL` | Chỉ dùng cho admin config panel |

### Các loại data lưu trên Sheets

- Cấu hình dashboard (banner, thông báo)
- Quy tắc tính điểm
- Danh sách phần thưởng & winners
- Nội dung trang giới thiệu
- Khảo sát & phản hồi
- Cấu hình trang login

### Cơ chế cache

Config được cache trong `localStorage` với TTL. Khi app khởi động, nếu cache hết hạn → fetch lại từ Sheets.

---

## 10. Admin Panel

Truy cập: `/admin/login`

Xác thực admin bằng password hash (bcrypt). Sau khi đăng nhập, admin có thể:

- Chỉnh sửa toàn bộ nội dung hiển thị cho users
- Quản lý mini games và surveys
- Xem & export dữ liệu phản hồi khảo sát
- Bật/tắt chế độ bảo trì
- Cấu hình scoring rules, rewards, notifications

Tất cả thay đổi admin được đồng bộ lên Google Sheets và phản ánh cho tất cả users ngay lập tức.

---

## 11. Bảo Mật

### ⚠️ Các vấn đề cần xử lý ngay

| Vấn đề | Mức độ | Hành động |
|---|---|---|
| `firebase-service-account.json` committed to repo | **CRITICAL** | Xóa khỏi git history, rotate key, thêm vào `.gitignore` |
| Bearer token trong `.env` commit lên repo | **HIGH** | Chuyển sang Firebase Functions config, xóa khỏi `.env` |
| API token trong `REACT_APP_API_TOKEN` | **HIGH** | Token này sẽ bị bundle vào JS public — chỉ dùng trong Cloud Functions |

### Thực hành bảo mật hiện tại

- Cloud Functions làm proxy để ẩn Bearer token khỏi client
- Console logs bị tắt trong production
- Admin route được bảo vệ bằng password hash
- Source maps bị tắt trong production build

### Các file cần thêm vào `.gitignore`

```
.env
.env.local
.env.production.local
firebase-service-account.json
```

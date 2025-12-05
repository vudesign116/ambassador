# 🔑 Hướng dẫn cấp quyền Cloud Functions

## Dành cho Firebase Project Owner

### Mục đích
Cấp quyền cho service account để deploy Cloud Functions (ẩn API token an toàn).

---

## Cách 1: Firebase Console (DỄ NHẤT)

### Bước 1: Mở IAM Settings
1. Truy cập: https://console.firebase.google.com/project/ambassador-7849e/settings/iam
2. Hoặc: https://console.cloud.google.com/iam-admin/iam?project=ambassador-7849e

### Bước 2: Tìm Service Account
Tìm service account có dạng:
```
firebase-adminsdk-xxxxx@ambassador-7849e.iam.gserviceaccount.com
```

### Bước 3: Edit Permissions (Click ✏️ icon)
Thêm các roles sau:

#### ✅ Required Roles:
- **Cloud Functions Admin** (`roles/cloudfunctions.admin`)
- **Service Account User** (`roles/iam.serviceAccountUser`)
- **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
- **Firebase Admin** (`roles/firebase.admin`)

#### 📋 Optional (for full access):
- **Cloud Scheduler Admin** (`roles/cloudscheduler.admin`)
- **Pub/Sub Editor** (`roles/pubsub.editor`)

### Bước 4: Save Changes
Click **SAVE** để lưu thay đổi.

---

## Cách 2: gcloud CLI (CHO TECHNICAL USERS)

### Prerequisites
```bash
# Owner phải đăng nhập vào gcloud
gcloud auth login
gcloud config set project ambassador-7849e
```

### Grant Permissions

#### Tìm service account email:
```bash
gcloud iam service-accounts list --project=ambassador-7849e
```

#### Grant các roles cần thiết:
```bash
# Thay SERVICE_ACCOUNT_EMAIL bằng email thực tế
SERVICE_ACCOUNT_EMAIL="firebase-adminsdk-xxxxx@ambassador-7849e.iam.gserviceaccount.com"

# Cloud Functions Admin
gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudfunctions.admin"

# Service Account User
gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Cloud Build Editor
gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# Firebase Admin
gcloud projects add-iam-policy-binding ambassador-7849e \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/firebase.admin"
```

---

## Cách 3: Enable Cloud Functions API (NẾU CHƯA ENABLE)

```bash
# Owner chạy lệnh này
gcloud services enable cloudfunctions.googleapis.com --project=ambassador-7849e
gcloud services enable cloudbuild.googleapis.com --project=ambassador-7849e
gcloud services enable cloudscheduler.googleapis.com --project=ambassador-7849e
```

---

## Verify Permissions

Sau khi cấp quyền, verify bằng cách:

```bash
# Kiểm tra roles của service account
gcloud projects get-iam-policy ambassador-7849e \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:SERVICE_ACCOUNT_EMAIL"
```

Hoặc thử init Cloud Functions:
```bash
firebase init functions --project ambassador-7849e
```

Nếu thành công sẽ thấy:
```
✔ Functions setup complete!
```

---

## Troubleshooting

### Lỗi: "Permission denied"
- **Nguyên nhân:** Service account chưa có đủ quyền
- **Giải pháp:** Thêm tất cả roles ở trên

### Lỗi: "API not enabled"
- **Nguyên nhân:** Cloud Functions API chưa được enable
- **Giải pháp:** Chạy `gcloud services enable` ở Cách 3

### Lỗi: "Billing not enabled"
- **Nguyên nhân:** Project chưa enable billing
- **Giải pháp:** 
  1. Truy cập: https://console.cloud.google.com/billing
  2. Link credit card/billing account
  3. Note: Cloud Functions có **Free tier** 2 triệu invocations/tháng

---

## Tài liệu tham khảo

- [Firebase IAM Roles](https://firebase.google.com/docs/projects/iam/roles-predefined-product)
- [Cloud Functions IAM](https://cloud.google.com/functions/docs/concepts/iam)
- [gcloud IAM commands](https://cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding)

---

**Sau khi cấp quyền xong, báo lại để tiếp tục setup Cloud Functions!** ✅

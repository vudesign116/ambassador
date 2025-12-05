# Firebase Deployment Guide - MerapLion Ambassador

## 📋 **Pre-Deployment Checklist**

### ✅ **Code Status**
- [x] No compilation errors
- [x] All ESLint warnings are non-critical
- [x] Mock data disabled (production mode)
- [x] Activity log delay set to 30s
- [x] API endpoints configured correctly
- [x] Error handling implemented
- [x] Security features in place

### ✅ **Configuration Files**
- [x] `.env` configured with production settings
- [x] `package.json` ready for build
- [x] All dependencies installed
- [ ] Firebase config files (will create below)

---

## 🚀 **Firebase Deployment Steps**

### **Step 1: Install Firebase Tools**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### **Step 2: Login to Firebase**

```bash
# Login with your Google account
firebase login

# This will open a browser window for authentication
```

### **Step 3: Initialize Firebase Project**

```bash
cd /Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador

# Initialize Firebase in your project
firebase init

# Select the following options:
# ❯ Hosting: Configure files for Firebase Hosting
# 
# ? Please select an option: (Use arrow keys)
#   > Use an existing project  (select your Firebase project)
#
# ? What do you want to use as your public directory? 
#   > build
#
# ? Configure as a single-page app (rewrite all urls to /index.html)? 
#   > Yes
#
# ? Set up automatic builds and deploys with GitHub? 
#   > No (we'll do manual deployment first)
#
# ? File build/index.html already exists. Overwrite? 
#   > No
```

### **Step 4: Build Production Files**

```bash
# Create optimized production build
npm run build

# This creates a 'build' folder with optimized files
```

### **Step 5: Deploy to Firebase**

```bash
# Deploy to Firebase Hosting
firebase deploy

# Or deploy only hosting:
firebase deploy --only hosting
```

### **Step 6: Verify Deployment**

After deployment, Firebase will provide you with URLs:
- **Hosting URL**: https://your-project-id.web.app
- **Hosting URL (custom)**: https://your-project-id.firebaseapp.com

---

## 📝 **Firebase Configuration Files**

### **1. firebase.json** (Firebase Hosting Config)

Create this file in project root:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|jsx)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### **2. .firebaserc** (Firebase Project Config)

Create this file in project root:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

**Note:** Replace `your-project-id` with your actual Firebase project ID.

---

## 🔐 **Environment Variables for Firebase**

Firebase Hosting doesn't support `.env` files directly. You have 2 options:

### **Option 1: Build with Environment Variables (Recommended)**

```bash
# Build with environment variables embedded
npm run build

# The .env file will be read during build
# and values will be embedded in the build files
```

### **Option 2: Use Firebase Environment Config**

```bash
# Set Firebase environment variables
firebase functions:config:set \
  google.script_url="YOUR_GOOGLE_SCRIPT_URL" \
  tracking.page_view="true" \
  tracking.delay="30000"

# Deploy with config
firebase deploy
```

---

## 🌐 **Custom Domain Setup (Optional)**

### **Add Custom Domain:**

1. Go to Firebase Console → Hosting → Add custom domain
2. Enter your domain: `ambassador.meraplion.com`
3. Follow DNS configuration instructions:
   - Add TXT record for verification
   - Add A records for domain connection
4. Wait for SSL certificate provisioning (can take 24 hours)

---

## 📊 **Post-Deployment Verification**

### **1. Check Core Functionality**

- [ ] Login with phone number
- [ ] Dashboard loads correctly
- [ ] Document list displays
- [ ] Reward selection works
- [ ] Admin panel accessible
- [ ] API calls successful

### **2. Test on Different Devices**

- [ ] Desktop browser
- [ ] Mobile browser (iOS)
- [ ] Mobile browser (Android)
- [ ] Tablet

### **3. Performance Check**

```bash
# Test with Lighthouse
# Open deployed URL in Chrome
# Press F12 → Lighthouse → Generate Report
```

**Target Scores:**
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80

---

## 🔄 **Continuous Deployment**

### **Manual Deployment Script**

Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run tests (if any)
# npm test

# Build production
echo "📦 Building production files..."
npm run build

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment completed!"
echo "🌐 Visit your site at: https://your-project-id.web.app"
```

Make it executable:
```bash
chmod +x deploy.sh
```

### **GitHub Actions (Optional)**

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          REACT_APP_GOOGLE_SCRIPT_URL: ${{ secrets.GOOGLE_SCRIPT_URL }}
          REACT_APP_TRACK_PAGE_VIEW: true
          REACT_APP_PAGE_VIEW_DELAY: 30000
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## 🛠️ **Troubleshooting**

### **Issue 1: Build Fails**

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Issue 2: Deployment Fails**

```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools

# Re-login
firebase logout
firebase login
```

### **Issue 3: 404 Errors on Refresh**

Make sure `firebase.json` has the rewrite rule:
```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

### **Issue 4: Environment Variables Not Working**

Environment variables are embedded during build:
```bash
# Check if .env is being read
cat .env

# Rebuild with fresh environment
rm -rf build
npm run build
```

---

## 📈 **Monitoring & Analytics**

### **Firebase Hosting Metrics**

View in Firebase Console → Hosting:
- Total requests
- Bandwidth usage
- Response times
- Error rates

### **Google Analytics (Optional)**

Add to `public/index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔒 **Security Checklist**

- [x] No sensitive data in client code
- [x] API tokens not exposed in frontend
- [x] CORS properly configured
- [x] Input validation on all forms
- [x] XSS protection (React default)
- [x] HTTPS enabled (Firebase default)

---

## 💰 **Firebase Hosting Pricing**

**Spark Plan (Free):**
- 10 GB storage
- 360 MB/day bandwidth
- Custom domain support

**Blaze Plan (Pay as you go):**
- $0.026/GB stored
- $0.15/GB bandwidth
- All Spark features included

---

## 📞 **Support & Resources**

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Firebase Console**: https://console.firebase.google.com
- **Firebase CLI Docs**: https://firebase.google.com/docs/cli
- **Status Page**: https://status.firebase.google.com

---

## ✅ **Quick Deployment Commands**

```bash
# One-time setup
npm install -g firebase-tools
firebase login
firebase init hosting

# Every deployment
npm run build
firebase deploy

# Or use the deploy script
./deploy.sh
```

---

**Last Updated:** 2025-10-16  
**Version:** 6.5 - Production Ready  
**Status:** ✅ Ready for Firebase Deployment

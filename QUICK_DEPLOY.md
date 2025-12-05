# 🚀 Quick Firebase Deployment Guide

## Fast Track - Deploy in 5 Minutes

### Prerequisites
- Node.js installed
- Google account
- Terminal access

---

## Step-by-Step Commands

### 1️⃣ Install Firebase CLI (First time only)
```bash
npm install -g firebase-tools
```

### 2️⃣ Login to Firebase
```bash
firebase login
```
This opens your browser for Google authentication.

### 3️⃣ Create Firebase Project
Go to https://console.firebase.google.com
- Click "Add project"
- Enter project name (e.g., "meraplion-ambassador")
- Disable Google Analytics (optional)
- Click "Create project"

### 4️⃣ Initialize Firebase in Your Project
```bash
cd /Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador
firebase init hosting
```

**Answer the prompts:**
- "Use existing project" → Select your project
- "Public directory" → `build`
- "Single-page app" → `Yes`
- "Overwrite index.html" → `No`
- "GitHub deploys" → `No`

### 5️⃣ Update .firebaserc
The file was created automatically. Verify it contains:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 6️⃣ Build Your App
```bash
npm run build
```

### 7️⃣ Deploy to Firebase
```bash
firebase deploy
```

### 8️⃣ Done! 🎉
Firebase will show you the hosting URL:
```
✔  Deploy complete!

Hosting URL: https://your-project-id.web.app
```

---

## 🔄 Update Existing Deployment

```bash
# Quick redeploy
npm run build && firebase deploy
```

Or use the deployment script:
```bash
./deploy.sh
```

---

## 🛠️ Troubleshooting

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Not authorized"
```bash
firebase logout
firebase login
```

### "Build failed"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📱 Test Your Deployment

1. Open the Firebase URL in your browser
2. Try logging in with: `0982085810`
3. Verify all pages work
4. Test on mobile device

---

## 📞 Need Help?

- Firebase Docs: https://firebase.google.com/docs/hosting
- Firebase Console: https://console.firebase.google.com
- Support: https://firebase.google.com/support

---

## ✅ Checklist

- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] Project created in Firebase Console
- [ ] Firebase initialized in project
- [ ] Build successful
- [ ] Deployed to Firebase
- [ ] Site accessible at hosting URL
- [ ] Login tested
- [ ] Mobile tested

---

**Time to Deploy:** ~5 minutes  
**Difficulty:** Easy ⭐  
**Status:** Ready! ✅

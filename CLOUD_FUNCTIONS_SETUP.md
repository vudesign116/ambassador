# Firebase Cloud Functions Setup Guide

## 🔧 Problem
API `bi.meraplion.com` has CORS restrictions that block requests from `ambassador-7849e.web.app` domain.

## 💡 Solution
Use Firebase Cloud Functions as a proxy to bypass CORS and hide Bearer token.

## 📝 Steps to Enable Cloud Functions

### Step 1: Enable Cloud Functions API

1. **Open Firebase Console:**
   https://console.firebase.google.com/project/ambassador-7849e/overview

2. **Click "Functions" in left menu**

3. **Click "Get Started" or "Upgrade Project"**
   - You may need to upgrade to **Blaze Plan** (pay-as-you-go)
   - Free tier: 2M invocations/month, 400K GB-seconds/month
   - Should be free for this app (low traffic)

4. **Enable the following APIs:**
   - Cloud Functions API
   - Cloud Build API
   - Artifact Registry API

### Step 2: Deploy Cloud Functions

After enabling APIs, run:

```bash
cd /Users/anhvu/Documents/GitHub/pingme-ai-assistant/ambassador
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/firebase-service-account.json"
npx firebase deploy --only functions
```

### Step 3: Test Cloud Functions

**Test Login API:**
```bash
curl -X POST https://ambassador-7849e.web.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0982688284"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "phone": "0982688284",
    "ma_kh_dms": "...",
    "name": "...",
    "rewardStatus": { ... }
  }
}
```

## 🎯 What Cloud Functions Do

### 1. `/api/login` - Login Proxy
- Hides Bearer token from client
- Calls `bi.meraplion.com/local/nvbc_login/` internally
- Calls `bi.meraplion.com/local/nvbc_get_point/` for reward status
- Returns combined data
- **No CORS issues** (same domain as React app)

### 2. `/api/getPoints` - Get Points Proxy
- Gets reward points for a phone number
- Hides Bearer token

## 📊 Benefits

✅ **No CORS issues** - Cloud Function is on same domain
✅ **Security** - Bearer token hidden on server side
✅ **Works on all networks** - No company network dependency
✅ **Faster** - Combines 2 API calls into 1

## 🔄 Current Status

- ✅ Code deployed
- ✅ Hosting updated
- ⏳ **Cloud Functions pending** (need to enable APIs first)
- ⏳ React app using Cloud Function (will work after functions deployed)

## 🧪 Testing

After deployment, test on:
- ✅ Wifi công ty
- ✅ Wifi nhà
- ✅ 4G/5G mobile
- ✅ Any network

All should work! 🚀

## 💰 Cost Estimate

**Free tier (monthly):**
- 2,000,000 invocations
- 400,000 GB-seconds
- 200,000 CPU-seconds

**This app usage estimate:**
- ~100 logins/day = 3,000 logins/month
- Well within free tier!

**Billing:** Only charged if exceed free tier.

# Google Drive Image Upload - Apps Script Setup

## 📋 Overview

This guide helps you add image upload functionality to your existing Google Apps Script, allowing admin to upload banner images to Google Drive and display them on all devices.

---

## 🎯 What We're Adding

**Feature:** Upload images from admin panel → Store in Google Drive → Get public URL → Display on all devices

**Benefits:**
- ✅ Images accessible from any device (phone, tablet, computer)
- ✅ No localStorage limitations
- ✅ Centralized image management
- ✅ Automatic compression before upload
- ✅ Public URLs that work everywhere

---

## 🔧 Apps Script Code to Add

### **Step 1: Open Your Apps Script**

1. Go to: https://script.google.com
2. Open your existing project (the one with `doPost()` function)
3. Or visit your script URL and click "Edit"

### **Step 2: Add Drive Upload Function**

Add this code to your `Code.gs` file:

```javascript
/**
 * Upload image to Google Drive
 * Creates a folder if it doesn't exist and stores the image publicly
 */
function uploadImageToDrive(data) {
  try {
    var fileName = data.fileName || 'image-' + Date.now() + '.jpg';
    var mimeType = data.mimeType || 'image/jpeg';
    var base64Data = data.base64Data;
    var folderName = data.folder || 'ambassador-images';
    var makePublic = data.makePublic !== false; // Default true
    
    Logger.log('📤 Uploading: ' + fileName + ' to folder: ' + folderName);
    
    // Decode base64
    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data), 
      mimeType, 
      fileName
    );
    
    // Get or create folder
    var folder = getOrCreateFolder(folderName);
    
    // Upload file
    var file = folder.createFile(blob);
    
    Logger.log('✅ File created: ' + file.getId());
    
    // Make public if requested
    if (makePublic) {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log('🌐 File is now public');
    }
    
    // Get public URL
    var url = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    return {
      success: true,
      url: url,
      fileId: file.getId(),
      fileName: fileName,
      size: file.getSize()
    };
    
  } catch (error) {
    Logger.log('❌ Upload error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get or create folder in Drive
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    Logger.log('📁 Folder exists: ' + folderName);
    return folders.next();
  } else {
    Logger.log('📁 Creating folder: ' + folderName);
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Delete image from Drive
 */
function deleteImageFromDrive(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    
    Logger.log('🗑️ File deleted: ' + fileId);
    
    return {
      success: true
    };
    
  } catch (error) {
    Logger.log('❌ Delete error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

### **Step 3: Update Your doPost Function**

Find your existing `doPost()` function and add the image upload actions:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    Logger.log('📥 Received action: ' + action);
    
    // ... existing actions ...
    
    // 🆕 Add these new actions
    if (action === 'uploadImage') {
      return ContentService
        .createTextOutput(JSON.stringify(uploadImageToDrive(data)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'deleteImage') {
      return ContentService
        .createTextOutput(JSON.stringify(deleteImageFromDrive(data.fileId)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... rest of your existing code ...
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### **Step 4: Deploy**

1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (required for CORS)
5. Click **Deploy**
6. Copy the deployment URL (it should be the same as your existing one)

---

## 🧪 Testing

### **Test in Apps Script Editor**

```javascript
function testUpload() {
  // Create a small test image (1x1 red pixel)
  var base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  var result = uploadImageToDrive({
    fileName: 'test-image.png',
    mimeType: 'image/png',
    base64Data: base64,
    folder: 'test-uploads',
    makePublic: true
  });
  
  Logger.log(result);
  
  if (result.success) {
    Logger.log('✅ Upload successful!');
    Logger.log('📎 URL: ' + result.url);
    Logger.log('🆔 File ID: ' + result.fileId);
  } else {
    Logger.log('❌ Upload failed: ' + result.error);
  }
}
```

Run this function to test.

### **Test from React App**

After deploying Apps Script, test from browser console:

```javascript
fetch('YOUR_APPS_SCRIPT_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'uploadImage',
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    base64Data: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...', // actual base64
    folder: 'test-uploads',
    makePublic: true
  })
})
.then(res => res.json())
.then(data => console.log('Result:', data));
```

Expected response:
```json
{
  "success": true,
  "url": "https://drive.google.com/uc?export=view&id=1abc...",
  "fileId": "1abc123...",
  "fileName": "test.jpg",
  "size": 12345
}
```

---

## 📁 Drive Folder Structure

After first upload, you'll see in your Google Drive:

```
My Drive/
└── ambassador-images/          ← New folder (auto-created)
    ├── banner-login-123.jpg
    ├── banner-dashboard-456.jpg
    └── icon-reward-789.png
```

All files in this folder are:
- ✅ Public (anyone with link can view)
- ✅ Organized by type
- ✅ Easy to manage manually if needed

---

## 🔐 Permissions & Security

### **Apps Script Permissions**

When first running, Google will ask for permissions:
- ✅ **View and manage your Drive files** - Needed to upload
- ✅ **Connect to external service** - Needed for API calls

### **File Access**

- Files are set to: **Anyone with the link can view**
- No edit permissions given
- Owner: Your Google account
- Can manually change permissions in Drive if needed

### **API Security**

- ✅ Apps Script URL is public (required for web app)
- ✅ No sensitive data in uploads
- ✅ Only images can be uploaded (enforced by frontend)
- ⚠️ Consider adding API key if abuse occurs

---

## 🎯 Integration with Admin Panel

The React app will automatically use this once Apps Script is deployed:

### **Admin uploads image:**
```javascript
import { uploadCompressedImage } from '../services/googleDriveService';

const handleUpload = async (file) => {
  const result = await uploadCompressedImage(file, 'ambassador-images');
  
  if (result.success) {
    // Save URL to config
    const config = {
      bannerImage: result.url,
      fileId: result.fileId
    };
    localStorage.setItem('admin_login_page_config', JSON.stringify(config));
  }
};
```

### **User page displays:**
```javascript
const LoginPage = () => {
  const [bannerUrl, setBannerUrl] = useState('');
  
  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('admin_login_page_config'));
    if (config && config.bannerImage) {
      setBannerUrl(config.bannerImage);
    }
  }, []);
  
  return (
    <div style={{ backgroundImage: `url(${bannerUrl})` }}>
      {/* Login form */}
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### **Error: "Exception: Access denied: DriveApp"**

**Solution:** Re-authorize the script
1. Apps Script Editor → Run → `testUpload`
2. Click "Review permissions"
3. Choose your Google account
4. Click "Advanced" → "Go to [Your Project]"
5. Click "Allow"

### **Error: "CORS policy: No 'Access-Control-Allow-Origin'"**

**Solution:** Ensure deployed as **Web app** with access: **Anyone**
1. Deploy → Manage deployments
2. Edit deployment
3. Who has access: **Anyone**
4. Update

### **Error: "File uploaded but URL returns 404"**

**Solution:** Check file permissions
1. Go to Drive folder
2. Right-click file → Share
3. Change to "Anyone with the link"
4. Click "Copy link"
5. Use format: `https://drive.google.com/uc?export=view&id=FILE_ID`

### **Upload works but image not showing**

**Check:**
1. URL format correct? `https://drive.google.com/uc?export=view&id=...`
2. File is public?
3. Image format supported? (JPG, PNG, WebP)
4. Network blocking Drive? (Try different network/VPN)

### **localStorage still used?**

The system will transition:
- Old: Save base64 to localStorage (single device)
- New: Save Drive URL to localStorage (works everywhere)

Old configs with base64 will still work on that device, but new uploads use Drive.

---

## 📊 Monitoring & Management

### **View Upload Logs**

Apps Script Editor → Executions:
- See all upload attempts
- Error messages
- Response times

### **Manage Files**

Google Drive → `ambassador-images` folder:
- View all uploaded images
- Download backups
- Delete old images
- Check file sizes

### **Storage Quota**

- Free Google Drive: 15 GB
- Each image: ~100-500 KB (compressed)
- Capacity: ~30,000-150,000 images
- More than enough for this use case!

---

## 🎉 Benefits Summary

### **Before (localStorage):**
- ❌ Images only on upload device
- ❌ Not accessible from phone
- ❌ localStorage size limits (5-10 MB)
- ❌ Lost when clearing browser data

### **After (Google Drive):**
- ✅ Images accessible everywhere
- ✅ Works on all devices
- ✅ No size limits (up to 15 GB free)
- ✅ Permanent storage
- ✅ Easy backup & management
- ✅ Public URLs that always work

---

## 🚀 Next Steps

1. ✅ Add code to Apps Script
2. ✅ Deploy as web app
3. ✅ Test upload function
4. ✅ Update React app (already done)
5. ✅ Test from admin panel
6. ✅ Verify on mobile device

---

## 📞 Support

**Apps Script Issues:**
- Check Executions tab for errors
- View logs: `Logger.log()` statements
- Test functions individually

**Drive Issues:**
- Check folder permissions
- Verify file is public
- Try direct Drive URL

**Integration Issues:**
- Check browser console
- Verify Apps Script URL in `.env`
- Test with curl/Postman first

---

**Status:** 🔄 Ready to implement  
**Effort:** ~15 minutes  
**Difficulty:** Easy (copy-paste code)  
**Impact:** 🚀 Huge (fixes mobile banner issue!)

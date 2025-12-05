/**
 * Google Drive Upload Service
 * Uploads images to Google Drive and returns public URL
 * Uses existing Google Apps Script endpoint
 */

const DRIVE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbxRGUN3F3ZaTvL64T4BxUKbCaL2uuO7CjSQ7FEX3Zc886zkQ8IX4XH-xZVEPEOns5Qm/exec';

/**
 * Upload image to Google Drive
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder name in Drive (default: 'ambassador-images')
 * @returns {Promise<{success: boolean, url: string, fileId: string, error?: string}>}
 */
export const uploadImageToDrive = async (file, folder = 'ambassador-images') => {
  try {
    console.log('📤 Uploading to Google Drive:', file.name);

    // Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Prepare request data
    const requestData = {
      action: 'uploadImage',
      fileName: file.name,
      mimeType: file.type,
      base64Data: base64,
      folder: folder,
      makePublic: true
    };

    console.log('🔄 Sending to Google Apps Script...');

    // Send to Apps Script
    const response = await fetch(DRIVE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log('✅ Upload successful:', result.url);

    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      fileName: file.name,
      size: file.size
    };

  } catch (error) {
    console.error('❌ Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Google Drive
 * @param {string} fileId - Drive file ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImageFromDrive = async (fileId) => {
  try {
    console.log('🗑️ Deleting from Google Drive:', fileId);

    const response = await fetch(DRIVE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteImage',
        fileId: fileId
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Delete failed');
    }

    console.log('✅ Delete successful');
    return { success: true };

  } catch (error) {
    console.error('❌ Delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Compress image before uploading
 * @param {File} file - Image file
 * @param {number} maxWidth - Max width (default: 1920)
 * @param {number} quality - Quality 0-1 (default: 0.8)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log(`📦 Compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Upload with compression
 * @param {File} file - Image file
 * @param {string} folder - Drive folder
 * @returns {Promise<{success: boolean, url: string, originalSize: number, compressedSize: number}>}
 */
export const uploadCompressedImage = async (file, folder = 'ambassador-images') => {
  try {
    const originalSize = file.size;

    // Compress first
    console.log('🔄 Compressing image...');
    const compressedFile = await compressImage(file);
    const compressedSize = compressedFile.size;

    // Upload to Drive
    const result = await uploadImageToDrive(compressedFile, folder);

    if (result.success) {
      return {
        ...result,
        originalSize: Math.round(originalSize / 1024), // KB
        compressedSize: Math.round(compressedSize / 1024) // KB
      };
    }

    return result;

  } catch (error) {
    console.error('❌ Upload with compression error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  uploadImageToDrive,
  deleteImageFromDrive,
  compressImage,
  uploadCompressedImage
};

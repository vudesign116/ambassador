/**
 * Image Utilities for Admin Config
 * Compress and validate images before saving to localStorage
 */

/**
 * Compress image to reduce localStorage usage
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width (default: 1200px)
 * @param {number} maxHeight - Maximum height (default: 1200px)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Compressed base64 image
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before upload
 * @param {File} file - Image file to validate
 * @param {number} maxSizeKB - Maximum file size in KB (default: 500KB)
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImage = (file, maxSizeKB = 500) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file' };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File phải là ảnh (JPG, PNG, GIF, WEBP)' 
    };
  }
  
  // Check file size
  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > maxSizeKB) {
    return { 
      valid: false, 
      error: `File quá lớn. Tối đa ${maxSizeKB}KB (file hiện tại: ${Math.round(fileSizeKB)}KB)` 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Get base64 image size in KB
 * @param {string} base64String - Base64 encoded image
 * @returns {number} - Size in KB
 */
export const getBase64Size = (base64String) => {
  if (!base64String) return 0;
  
  // Remove data:image/xxx;base64, prefix
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate size (base64 is ~33% larger than binary)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInKB = sizeInBytes / 1024;
  
  return Math.round(sizeInKB * 100) / 100; // Round to 2 decimal places
};

/**
 * Complete image upload handler with validation and compression
 * @param {File} file - Image file to upload
 * @param {Object} options - Configuration options
 * @param {number} options.maxSizeKB - Max file size before compression (default: 500KB)
 * @param {number} options.maxWidth - Max width after compression (default: 1200px)
 * @param {number} options.maxHeight - Max height after compression (default: 1200px)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<Object>} - { success: boolean, data: string, error: string, originalSize: number, compressedSize: number }
 */
export const handleImageUpload = async (file, options = {}) => {
  const {
    maxSizeKB = 500,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8
  } = options;
  
  try {
    // Validate file
    const validation = validateImage(file, maxSizeKB);
    if (!validation.valid) {
      return {
        success: false,
        data: null,
        error: validation.error,
        originalSize: Math.round(file.size / 1024)
      };
    }
    
    // Compress image
    const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);
    
    // Check compressed size
    const compressedSizeKB = getBase64Size(compressedBase64);
    const originalSizeKB = Math.round(file.size / 1024);
    
    console.log(`📦 Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (saved ${Math.round((1 - compressedSizeKB / originalSizeKB) * 100)}%)`);
    
    return {
      success: true,
      data: compressedBase64,
      error: null,
      originalSize: originalSizeKB,
      compressedSize: compressedSizeKB
    };
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    return {
      success: false,
      data: null,
      error: 'Không thể xử lý ảnh. Vui lòng thử lại.',
      originalSize: Math.round(file.size / 1024)
    };
  }
};

/**
 * Check localStorage available space
 * @returns {Object} - { used: number, total: number, available: number, percentage: number }
 */
export const checkLocalStorageSpace = () => {
  let total = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2; // UTF-16 = 2 bytes per char
    }
  }
  
  const totalKB = total / 1024;
  const totalMB = totalKB / 1024;
  const limitMB = 5; // Chrome/Safari typical limit
  const availableMB = limitMB - totalMB;
  const percentage = (totalMB / limitMB) * 100;
  
  return {
    used: Math.round(totalKB * 100) / 100,
    usedMB: Math.round(totalMB * 100) / 100,
    total: limitMB * 1024,
    totalMB: limitMB,
    available: Math.round(availableMB * 1024 * 100) / 100,
    availableMB: Math.round(availableMB * 100) / 100,
    percentage: Math.round(percentage * 100) / 100
  };
};

/**
 * Format bytes to human readable
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default {
  compressImage,
  validateImage,
  getBase64Size,
  handleImageUpload,
  checkLocalStorageSpace,
  formatBytes
};

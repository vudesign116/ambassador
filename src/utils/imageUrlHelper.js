/**
 * Image URL Helper
 * Convert various image URLs to direct accessible formats
 */

/**
 * Convert Google Drive share link to direct image URL
 * @param {string} url - Google Drive share URL
 * @returns {string} Direct image URL
 */
export const convertGoogleDriveUrl = (url) => {
  if (!url) return url;
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/\/file\/d\/([^/]+)/);
  if (match1) {
    const fileId = match1[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/[?&]id=([^&]+)/);
  if (match2) {
    const fileId = match2[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Already direct URL or other service
  return url;
};

/**
 * Validate if URL is a valid image URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if starts with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  
  // Check common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  if (imageExtensions.test(url)) return true;
  
  // Check for known image hosting services
  const imageHosts = [
    'imgur.com',
    'i.imgur.com',
    'drive.google.com',
    'googleusercontent.com',
    'cloudinary.com',
    'imgbb.com',
    'postimg.cc',
    'ibb.co',
    'flickr.com',
    'photobucket.com'
  ];
  
  return imageHosts.some(host => url.includes(host));
};

/**
 * Preload image to check if it's valid
 * @param {string} url - Image URL
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 10 seconds
    setTimeout(() => resolve(false), 10000);
  });
};

/**
 * Get image dimensions
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

/**
 * Process and validate banner URL
 * @param {string} url - Raw URL from admin
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const processBannerUrl = async (url) => {
  try {
    // Trim whitespace
    url = url.trim();
    
    // Validate format
    if (!isValidImageUrl(url)) {
      return {
        success: false,
        error: 'URL không hợp lệ. Vui lòng dùng link ảnh từ Google Drive, Imgur, hoặc Cloudinary.'
      };
    }
    
    // Convert Google Drive URLs
    const directUrl = convertGoogleDriveUrl(url);
    
    // Preload to check if accessible
    console.log('🔍 Checking image URL:', directUrl);
    const isAccessible = await preloadImage(directUrl);
    
    if (!isAccessible) {
      return {
        success: false,
        error: 'Không thể tải ảnh từ URL này. Kiểm tra quyền truy cập (public) và thử lại.'
      };
    }
    
    // Get dimensions
    const dimensions = await getImageDimensions(directUrl);
    console.log('✅ Image loaded:', dimensions);
    
    return {
      success: true,
      url: directUrl,
      dimensions
    };
    
  } catch (error) {
    console.error('❌ Error processing banner URL:', error);
    return {
      success: false,
      error: 'Lỗi khi xử lý URL. Vui lòng thử lại.'
    };
  }
};

export default {
  convertGoogleDriveUrl,
  isValidImageUrl,
  preloadImage,
  getImageDimensions,
  processBannerUrl
};

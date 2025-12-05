/**
 * Storage Helper - Utilities for localStorage management
 */

/**
 * Get current localStorage usage
 * @returns {Object} { used: number, total: number, percentage: number }
 */
export const getLocalStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  const totalKB = (total / 1024).toFixed(2);
  const estimatedLimit = 5 * 1024; // ~5MB typical limit
  const percentage = ((total / 1024 / estimatedLimit) * 100).toFixed(2);
  
  return {
    used: total,
    usedKB: totalKB,
    estimatedLimitKB: estimatedLimit,
    percentage: percentage
  };
};

/**
 * Check if localStorage has enough space for new data
 * @param {string} data - Data to be stored
 * @returns {boolean}
 */
export const hasEnoughSpace = (data) => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is full or unavailable:', e);
    return false;
  }
};

/**
 * Compress image to reduce Base64 size
 * @param {string} base64Image - Base64 encoded image
 * @param {number} maxWidth - Maximum width (default 1200px)
 * @param {number} quality - JPEG quality (default 0.8)
 * @returns {Promise<string>} - Compressed Base64 image
 */
export const compressImage = (base64Image, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
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

      // Convert to JPEG with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};

/**
 * Log localStorage usage for all admin configs
 */
export const logStorageUsage = () => {
  const usage = getLocalStorageUsage();
  console.log('=== localStorage Usage ===');
  console.log(`Total: ${usage.usedKB} KB / ~${usage.estimatedLimitKB} KB (${usage.percentage}%)`);
  
  const adminKeys = [
    'admin_login_page_config',
    'admin_introduction_config',
    'admin_scoring_rules_config',
    'admin_badges_config',
    'admin_minigames',
    'admin_general_config'
  ];
  
  adminKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      const sizeKB = (data.length / 1024).toFixed(2);
      console.log(`${key}: ${sizeKB} KB`);
    }
  });
};

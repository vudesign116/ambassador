// API Helper for syncing viewing history to server

/**
 * Posts viewing history to configured API endpoint
 * @param {string} ma_kh_dms - Customer code (e.g., "M1401079")
 * @param {string} phone - Phone number (e.g., "0123456789")
 * @param {string} document_id - Document ID being viewed
 * @param {number} watch_duration_seconds - Total seconds watched
 * @param {number} time_rate - Time rate (0.5, 1.0, etc.)
 * @param {number} base_point - Base points for document
 * @param {number} effective_point - Effective points earned
 * @returns {Promise<object>} API response
 */
export const postViewingHistory = async (ma_kh_dms, phone, document_id, watch_duration_seconds = 0, time_rate = 1.0, base_point = 0, effective_point = 0) => {
  try {
    // Get API endpoint from localStorage
    let apiEndpoint = localStorage.getItem('app_sync_point_api_endpoint');
    
    if (!apiEndpoint || apiEndpoint.trim() === '') {
      console.log('[API] No API endpoint configured, skipping POST');
      return { success: false, reason: 'no_endpoint' };
    }

    // 🧪 TEST MODE: Add ?test=1 to bypass business logic (remove this line in production)
    if (!apiEndpoint.includes('?test=1')) {
      apiEndpoint += '?test=1';
      console.log('[API] 🧪 TEST MODE: Using test=1 parameter');
    }

    // Clean and validate required data (remove whitespace)
    const cleanMaKhDms = (ma_kh_dms || '').toString().trim();
    const cleanPhone = (phone || '').toString().trim();
    const cleanDocId = (document_id || '').toString().trim(); // Convert to string
    
    if (!cleanMaKhDms || !cleanPhone || !cleanDocId) {
      console.log('[API] Missing required data:', { ma_kh_dms: cleanMaKhDms, phone: cleanPhone, document_id: cleanDocId });
      return { success: false, reason: 'missing_data' };
    }

    // Create UTC+7 timestamp in format: "2025-12-16 10:30:00" (no T, no Z)
    const now = new Date();
    // Add 7 hours for UTC+7
    const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    // Format as YYYY-MM-DD HH:MM:SS
    const year = utc7Time.getUTCFullYear();
    const month = String(utc7Time.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc7Time.getUTCDate()).padStart(2, '0');
    const hours = String(utc7Time.getUTCHours()).padStart(2, '0');
    const minutes = String(utc7Time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc7Time.getUTCSeconds()).padStart(2, '0');
    const inserted_at = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Prepare data as array with single record (use cleaned data)
    const payload = [
      {
        ma_kh_dms: cleanMaKhDms,
        phone: cleanPhone,
        document_id: cleanDocId,
        watch_duration_seconds: parseInt(watch_duration_seconds) || 0,
        time_rate: parseFloat(time_rate.toFixed(2)) || 0, // Round to 2 decimals
        base_point: parseFloat(base_point) || 0,
        effective_point: parseFloat(effective_point) || 0,
        inserted_at
      }
    ];

    console.log('[API] Posting viewing history:', payload);

    // Make POST request (no Bearer token required for this endpoint)
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[API] POST response:', result);

    // Check if backend returned success
    if (result.status === 'ok') {
      return { 
        success: true, 
        data: result,
        message: result.success_message || 'Thành công'
      };
    } else {
      // Backend returned error (duplicate key, etc.)
      return { 
        success: false, 
        reason: result.error_message || result.message || 'Unknown error',
        data: result
      };
    }

  } catch (error) {
    console.error('[API] POST failed:', error);
    return { success: false, reason: error.message };
  }
};

/**
 * Test function to verify API connection
 */
export const testViewingHistoryAPI = async () => {
  const testData = {
    ma_kh_dms: 'M1401079',
    phone: '0123456789',
    document_id: 'test_doc_123'
  };

  console.log('[API] Testing with:', testData);
  const result = await postViewingHistory(
    testData.ma_kh_dms,
    testData.phone,
    testData.document_id
  );
  
  console.log('[API] Test result:', result);
  return result;
};

// Expose test function to window for console testing
if (typeof window !== 'undefined') {
  window.testViewingHistoryAPI = testViewingHistoryAPI;
}

/**
 * Get user info from login API (includes ma_kh_dms)
 * @param {string} phone - Phone number
 * @returns {Promise<object>} { success: boolean, data: { phone, name, ma_kh_dms }, reason?: string }
 */
export const getUserInfo = async (phone) => {
  try {
    const cleanPhone = (phone || '').toString().trim();
    
    if (!cleanPhone) {
      return { success: false, reason: 'missing_phone' };
    }

    const apiUrl = `https://bi.meraplion.com/local/get_data/get_nvbc_login/?test=1&phone=${cleanPhone}`;
    console.log('[API] Getting user info via login:', cleanPhone);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[API] HTTP error:', response.status, response.statusText);
      return { success: false, reason: `http_error_${response.status}` };
    }

    const result = await response.json();
    console.log('[API] User info response:', result);

    // Check if login successful (has phone and ma_kh_dms)
    if (result.phone && result.ma_kh_dms) {
      return {
        success: true,
        data: {
          phone: result.phone,
          name: result.name || '',
          ma_kh_dms: result.ma_kh_dms,
        }
      };
    } else if (result.mess_error) {
      // Phone not found in system
      return {
        success: false,
        reason: 'phone_not_found',
        data: result
      };
    } else {
      return {
        success: false,
        reason: 'unknown_error',
        data: result
      };
    }
  } catch (error) {
    console.error('[API] Error getting user info:', error);
    return { success: false, reason: error.message };
  }
};

/**
 * Get user points from API
 * @param {string} phone - Phone number
 * @returns {Promise<object>} { success: boolean, data: { point: number }, reason?: string }
 */
export const getUserPoints = async (phone) => {
  try {
    const cleanPhone = (phone || '').toString().trim();
    
    if (!cleanPhone) {
      return { success: false, reason: 'missing_phone' };
    }

    const apiUrl = `https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone=${encodeURIComponent(cleanPhone)}&test=1`;
    console.log('[API] Getting user points:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[API] HTTP error:', response.status, response.statusText);
      return { success: false, reason: `http_error_${response.status}` };
    }

    const result = await response.json();
    console.log('[API] User points response:', result);

    // Check if API returned success status
    if (result.status === 'ok') {
      return {
        success: true,
        data: {
          point: result.point || 0,
          phone: result.phone || cleanPhone,
        }
      };
    } else {
      return {
        success: false,
        reason: result.error_message || 'unknown_error',
        data: result
      };
    }
  } catch (error) {
    console.error('[API] Error getting user points:', error);
    return { success: false, reason: error.message };
  }
};

/**
 * Submit referral (người giới thiệu)
 * @param {string} inviteePhone - Phone của người được giới thiệu (người login)
 * @param {string} referralPhone - Phone của người giới thiệu
 * @returns {Promise<object>} { success: boolean, data?: object, reason?: string }
 */
export const submitReferral = async (inviteePhone, referralPhone) => {
  try {
    const cleanInviteePhone = (inviteePhone || '').toString().trim();
    const cleanReferralPhone = (referralPhone || '').toString().trim();
    
    if (!cleanInviteePhone || !cleanReferralPhone) {
      return { success: false, reason: 'missing_phone' };
    }

    // Create UTC+7 timestamp in ISO format: "2025-12-10T09:30:123"
    const now = new Date();
    const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const insertedAt = utc7Time.toISOString().slice(0, -1); // Remove 'Z' at end

    const apiUrl = 'https://bi.meraplion.com/local/post_data/insert_nvbc_ref_month_regis/?test=1';
    const payload = [{
      invitee_phone: cleanInviteePhone,
      referral_phone: cleanReferralPhone,
      inserted_at: insertedAt
    }];

    console.log('[API] Submitting referral:', payload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Parse JSON response even if status is 400
    let result;
    try {
      result = await response.json();
      console.log('[API] Referral response:', result);
    } catch (parseError) {
      console.error('[API] Failed to parse response:', parseError);
      return { success: false, reason: `http_error_${response.status}` };
    }

    // Check if API returned success status
    if (result.status === 'ok') {
      return {
        success: true,
        data: result
      };
    } else {
      // API returned error with error_message
      return {
        success: false,
        reason: result.error_message || 'unknown_error',
        data: result
      };
    }
  } catch (error) {
    console.error('[API] Error submitting referral:', error);
    return { success: false, reason: error.message };
  }
};

// Export default object with all functions
export default {
  postViewingHistory,
  testViewingHistoryAPI,
  getUserInfo,
  getUserPoints,
  submitReferral,
};

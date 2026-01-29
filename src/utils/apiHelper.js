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
    // ✅ Production API endpoint with test=0
    let apiEndpoint = localStorage.getItem('app_sync_point_api_endpoint') || 
                      'https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=0';
    
    if (!apiEndpoint || apiEndpoint.trim() === '') {
      console.log('[API] No API endpoint configured, using default');
      apiEndpoint = 'https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=0';
    }

    // Clean and validate required data (remove whitespace)
    const cleanMaKhDms = (ma_kh_dms || '').toString().trim();
    const cleanPhone = (phone || '').toString().trim();
    const cleanDocId = (document_id || '').toString().trim(); // Convert to string
    
    if (!cleanMaKhDms || !cleanPhone || !cleanDocId) {
      console.log('[API] Missing required data:', { ma_kh_dms: cleanMaKhDms, phone: cleanPhone, document_id: cleanDocId });
      return { success: false, reason: 'missing_data' };
    }

    // Create GMT+7 (Vietnam) timestamp in format: "2025-12-16 10:30:00" (no T, no Z)
    const now = new Date();
    now.setHours(now.getHours() + 7); // Add 7 hours for Vietnam timezone
    // Format as YYYY-MM-DD HH:MM:SS
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
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
    console.log('[API] Endpoint:', apiEndpoint);
    console.log('[API] Payload details:', {
      ma_kh_dms: payload[0].ma_kh_dms,
      phone: payload[0].phone,
      document_id: payload[0].document_id,
      watch_duration_seconds: payload[0].watch_duration_seconds,
      time_rate: payload[0].time_rate,
      base_point: payload[0].base_point,
      effective_point: payload[0].effective_point,
      inserted_at: payload[0].inserted_at
    });

    // Make POST request (no Bearer token required for this endpoint)
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[API] Response status:', response.status, response.statusText);

    // Parse response JSON first (works for both success and error)
    const result = await response.json();
    console.log('[API] Response body:', result);

    if (!response.ok) {
      // Extract error message from response body
      const errorMessage = result.error_message || result.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('[API] Server returned error:', errorMessage);
      
      // Return error with message from server
      return { 
        success: false, 
        reason: errorMessage,
        data: result,
        status: response.status
      };
    }

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
    console.error('[API] Error details:', {
      message: error.message,
      stack: error.stack
    });
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

    const apiUrl = `https://bi.meraplion.com/local/get_data/get_nvbc_login/?phone=${cleanPhone}&test=0`;
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

    const apiUrl = `https://bi.meraplion.com/local/get_data/get_nvbc_point/?phone=${encodeURIComponent(cleanPhone)}&test=0`;
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

    // Create GMT+7 (Vietnam) timestamp in format: "2025-12-10T09:30:123"
    const now = new Date();
    now.setHours(now.getHours() + 7); // Add 7 hours for Vietnam timezone
    const insertedAt = now.toISOString().slice(0, -1); // Remove 'Z' at end

    const apiUrl = 'https://bi.meraplion.com/local/post_data/insert_nvbc_ref_month_regis/?test=0';
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

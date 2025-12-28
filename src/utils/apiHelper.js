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

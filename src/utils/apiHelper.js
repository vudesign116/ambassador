// API Helper for syncing viewing history to server

/**
 * Posts viewing history to configured API endpoint
 * @param {string} ma_kh_dms - Customer code (e.g., "M1401079")
 * @param {string} phone - Phone number (e.g., "0123456789")
 * @param {string} document_id - Document ID being viewed
 * @returns {Promise<object>} API response
 */
export const postViewingHistory = async (ma_kh_dms, phone, document_id) => {
  try {
    // Get API endpoint from localStorage
    const apiEndpoint = localStorage.getItem('app_sync_point_api_endpoint');
    
    if (!apiEndpoint || apiEndpoint.trim() === '') {
      console.log('[API] No API endpoint configured, skipping POST');
      return { success: false, reason: 'no_endpoint' };
    }

    // Clean and validate required data (remove whitespace)
    const cleanMaKhDms = (ma_kh_dms || '').toString().trim();
    const cleanPhone = (phone || '').toString().trim();
    const cleanDocId = document_id;
    
    if (!cleanMaKhDms || !cleanPhone || !cleanDocId) {
      console.log('[API] Missing required data:', { ma_kh_dms: cleanMaKhDms, phone: cleanPhone, document_id: cleanDocId });
      return { success: false, reason: 'missing_data' };
    }

    // Create UTC+7 timestamp without 'Z' suffix
    const now = new Date();
    // Add 7 hours for UTC+7
    const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    // Format as ISO string then remove 'Z'
    const inserted_at = utc7Time.toISOString().replace('Z', '');

    // Prepare data as array with single record (use cleaned data)
    const payload = [
      {
        ma_kh_dms: cleanMaKhDms,
        phone: cleanPhone,
        document_id: cleanDocId,
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
    console.log('[API] POST successful:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[API] POST failed:', error);
    return { success: false, error: error.message };
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

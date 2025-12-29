/**
 * Reward API Service
 * POST reward selection data to external API
 */

class RewardApiService {
  constructor() {
    this.getApiEndpoint = this.getApiEndpoint.bind(this);
    this.postRewardSelection = this.postRewardSelection.bind(this);
  }

  /**
   * Get API endpoint from localStorage
   */
  getApiEndpoint() {
    return localStorage.getItem('app_reward_api_endpoint') || 
           'https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/';
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    // Try both 'authToken' (from login) and 'token' (fallback)
    return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
  }

  /**
   * POST reward selection to external API
   * @param {Object} rewardData - Reward selection data
   * @param {string} rewardData.phone - User phone number
   * @param {string} rewardData.monthlyReward - Monthly reward name
   * @param {string} rewardData.dgccReward - DGCC reward name
   * @param {string} rewardData.cgspReward - CGSP reward name
   */
  async postRewardSelection(rewardData) {
    const endpoint = this.getApiEndpoint();
    
    if (!endpoint) {
      console.warn('⚠️ Reward API endpoint not configured');
      return { success: false, error: 'API endpoint not configured' };
    }

    try {
      const phone = rewardData.phone || localStorage.getItem('phoneNumber') || '';
      const token = this.getAuthToken();
      
      // Prepare payload - API expects ARRAY of objects (jsonb_populate_recordset)
      const payloadItem = {
        phone: phone,
        value: rewardData.monthlyReward || '',     // Tên quà monthly
        value1: rewardData.dgccReward || '',       // Tên quà DGCC
        value2: rewardData.cgspReward || '',       // Tên quà CGSP
        inserted_at: new Date().toISOString()      // ISO timestamp
      };
      
      // Wrap in array as API expects "array of objects"
      const payload = [payloadItem];

      console.log('📤 Posting reward selection to API:', endpoint);
      console.log('📦 Payload (array):', payload);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      // Strategy 1: Try WITHOUT Authorization first (most APIs don't need auth for inserts)
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      console.log('📡 Response status (no auth):', response.status);

      // If 401 and we have token, try WITH Authorization
      if (response.status === 401 && token) {
        console.log('🔄 Retrying with Authorization header...');
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
          mode: 'cors'
        });
        
        console.log('📡 Response status (with auth):', response.status);
      }

      if (!response.ok) {
        // Try to get error details
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
        } catch (e) {
          console.error('❌ Could not read error response');
        }
        throw new Error(`API responded with status ${response.status}${errorText ? ': ' + errorText : ''}`);
      }

      const result = await response.json();
      console.log('✅ Reward selection posted successfully:', result);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Failed to post reward selection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    const endpoint = this.getApiEndpoint();
    
    console.log('🔗 Testing reward API connection...');
    console.log('Endpoint:', endpoint);
    console.log('Token:', this.getAuthToken() ? 'Present' : 'Missing');

    try {
      const testData = {
        phone: '0000000000',
        monthlyReward: 'Test Monthly Reward',
        dgccReward: 'Test DGCC Reward',
        cgspReward: 'Test CGSP Reward'
      };

      const result = await this.postRewardSelection(testData);
      
      if (result.success) {
        console.log('✅ Connection test successful');
      } else {
        console.log('❌ Connection test failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Connection test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * GET reward status from API
   * @param {string} phoneNumber - User phone number
   * @returns {Promise<Object>} Reward status data
   */
  async getRewardStatus(phoneNumber) {
    // ✅ New API endpoint (no auth required)
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local';
    const endpoint = `${apiBaseUrl}/get_data/get_nvbc_point/?phone=${phoneNumber}&test=1`;
    
    const token = this.getAuthToken();

    try {
      console.log('🔍 GET Reward Status from API:', endpoint);
      console.log('📞 Phone:', phoneNumber);

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Sending request WITH Authorization token');
      } else {
        console.warn('⚠️ No token found - API may fail');
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers,
        mode: 'cors'
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          // Only log first 200 chars (avoid huge HTML in console)
          console.error('❌ API Error Response:', errorText.substring(0, 200) + '...');
        } catch (e) {
          console.error('❌ Could not read error response');
        }
        
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ API did not return JSON, got:', contentType);
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      console.log('✅ Reward Status API Response:', data);
      
      // Validate response structure
      if (typeof data.show_reward_selection === 'undefined') {
        console.warn('⚠️ API response missing "show_reward_selection" field');
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Get Reward Status Error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const rewardApiService = new RewardApiService();

// Make available globally for console testing
if (typeof window !== 'undefined') {
  window.rewardApiService = rewardApiService;
}

export default rewardApiService;

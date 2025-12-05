// API Configuration and Helper Functions
// Centralized API client with token management

import { getApiToken } from '../utils/tokenHelper';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local';
    // Use obfuscated token from helper (safer than plain env variable)
    this.apiToken = getApiToken();
  }

  // Get authorization header
  getAuthHeaders() {
    // Try to get token from localStorage first (from login)
    const userToken = localStorage.getItem('authToken');
    
    // Fallback to obfuscated token if no user token
    const token = userToken || this.apiToken;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Login API
  async login(phoneNumber) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseURL}/nvbc_login/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone: phoneNumber }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  // Get user points and reward status
  async getUserPoints(phoneNumber) {
    try {
      const response = await fetch(`${this.baseURL}/nvbc_get_point/?phone=${phoneNumber}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get points API error:', error);
      throw error;
    }
  }

  // Submit reward selection
  async submitReward(rewardData) {
    try {
      const response = await fetch(`${this.baseURL}/nvbc_submit_reward/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(rewardData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Submit reward API error:', error);
      throw error;
    }
  }

  // Get API base URL (for external use)
  getBaseURL() {
    return this.baseURL;
  }

  // Get current API token (for debugging)
  getCurrentToken() {
    return localStorage.getItem('authToken') || this.apiToken;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

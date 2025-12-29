/**
 * Google Sheets Integration Service V3 - SIMPLIFIED
 * 
 * Chỉ sync 2 loại data:
 * 1. Survey Responses - Khảo sát
 * 2. Activities - Login logs & thời gian trên web
 */

import apiMonitor from './apiMonitor';

class GoogleSheetsService {
  constructor() {
    // Data sync URL (survey, activity, rewards)
    this.scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
    this.enabled = !!this.scriptUrl;
    
    // Admin config sync URL (cross-device)
    this.adminConfigUrl = process.env.REACT_APP_ADMIN_CONFIG_SCRIPT_URL || '';
    this.adminConfigEnabled = !!this.adminConfigUrl;
    
    if (!this.enabled) {
      console.warn('⚠️ Google Sheets integration not configured. Set REACT_APP_GOOGLE_SCRIPT_URL in .env');
    }
    
    if (!this.adminConfigEnabled) {
      console.warn('⚠️ Admin config sync not configured. Set REACT_APP_ADMIN_CONFIG_SCRIPT_URL in .env');
    }
  }

  /**
   * Sync survey response to Google Sheets
   */
  async syncSurveyResponse(response, survey = null) {
    if (!this.enabled) {
      return false;
    }

    try {
      const maDMS = localStorage.getItem('ma_kh_dms') || response.userId || response.phoneNumber;
      const userName = localStorage.getItem('userName') || '';
      
      const data = {
        type: 'survey_response',
        timestamp: new Date().toISOString(),
        data: {
          responseId: response.id,
          surveyId: response.surveyId,
          surveyTitle: survey?.title || survey?.name || '',  // ⭐ THÊM TÊN KHẢO SÁT
          userId: maDMS,
          phoneNumber: response.phoneNumber,
          userName: userName,
          answers: response.answers,
          questions: survey?.questions || [],
          submittedAt: response.submittedAt
        }
      };

      await this._sendToSheet(data);
      console.log('✅ Survey synced to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync survey:', error);
      return false;
    }
  }

  /**
   * Sync user activity to Google Sheets
   * Activity types: login, logout, page_view
   */
  async syncActivity(activity) {
    if (!this.enabled) {
      return false;
    }

    try {
      const maDMS = localStorage.getItem('ma_kh_dms') || activity.userId || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      const userName = localStorage.getItem('userName') || '';
      
      const data = {
        type: 'activity',
        timestamp: new Date().toISOString(),
        data: {
          activityId: activity.id || `act_${Date.now()}`,
          userId: maDMS,
          phoneNumber: phoneNumber,
          userName: userName,
          activityType: activity.type, // login, logout, page_view
          description: activity.description || this._getActivityDescription(activity),
          duration: activity.duration || 0,
          page: activity.page || window.location.pathname,
          metadata: activity.metadata || {},
          timestamp: activity.timestamp || new Date().toISOString()
        }
      };

      await this._sendToSheet(data);
      return true;
    } catch (error) {
      console.error('❌ Failed to sync activity:', error);
      return false;
    }
  }

  /**
   * Helper: Generate activity description
   */
  _getActivityDescription(activity) {
    const descriptions = {
      'login': 'User logged in',
      'logout': 'User logged out',
      'page_view': `Viewed ${activity.page || 'page'}`,
      'survey_completed': 'Completed survey',
      'game_played': 'Played mini game',
      'category_viewed': activity.description || `Viewed category ${activity.page}`,
      'document_viewed': activity.description || 'Viewed document'
    };
    
    return descriptions[activity.type] || activity.type;
  }

  /**
   * Track login activity
   */
  async trackLogin(metadata = {}) {
    return this.syncActivity({
      type: 'login',
      description: 'User logged in',
      duration: 0,
      page: '/login',
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * Track logout activity
   */
  async trackLogout(metadata = {}) {
    return this.syncActivity({
      type: 'logout',
      description: 'User logged out',
      duration: 0,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * Track page view with duration
   */
  async trackPageView(page, duration = 0, metadata = {}) {
    return this.syncActivity({
      type: 'page_view',
      description: `Viewed ${page}`,
      duration: duration,
      page: page,
      metadata: {
        ...metadata
      }
    });
  }

  /**
   * Send data to Google Sheets
   */
  async _sendToSheet(data) {
    if (!this.scriptUrl) {
      throw new Error('Google Script URL not configured');
    }

    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(data)
      });

      // Note: no-cors mode returns opaque response, so we can't check status
      // If no error thrown, assume success
      return true;
    } catch (error) {
      console.error('Network error syncing to Google Sheets:', error);
      
      // Ghi nhận lỗi vào apiMonitor
      apiMonitor.recordError({
        message: 'Failed to sync to Google Sheets: ' + error.message,
        status: error.status || 'NETWORK_ERROR',
        originalError: error
      });
      
      throw error;
    }
  }

  /**
   * Save admin config to Google Sheets (cross-device sync)
   */
  async saveAdminConfig(configName, configData) {
    if (!this.adminConfigEnabled) {
      console.warn('⚠️ Admin config sync not enabled, saving to localStorage only');
      return false;
    }

    try {
      const data = {
        type: 'admin_config',
        data: {
          configName: configName,
          configData: configData,
          updatedBy: localStorage.getItem('userName') || 'Admin',
          timestamp: new Date().toISOString()
        }
      };

      console.log(`📤 Saving admin config "${configName}" to Google Sheets...`);
      console.log('📦 Data to save:', configData);
      console.log('🔗 URL:', this.adminConfigUrl);

      // Use admin config URL with no-cors mode (required for Google Apps Script)
      // Note: With no-cors, we cannot read the response, but the request will succeed
      await fetch(this.adminConfigUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(data)
      }).catch(error => {
        // Ghi nhận lỗi vào apiMonitor
        apiMonitor.recordError({
          message: 'Failed to save admin config: ' + error.message,
          status: error.status || 'NETWORK_ERROR',
          originalError: error
        });
        throw error;
      });

      // With no-cors mode, we assume success if no error was thrown
      console.log(`✅ Admin config "${configName}" sent to Google Sheets (no-cors mode)`);
      console.log('⏳ Waiting 3 seconds before verification...');
      
      // Verify by loading the config back after a short delay
      setTimeout(async () => {
        try {
          console.log(`🔍 Verifying save for "${configName}"...`);
          const verified = await this.loadAdminConfig(configName);
          
          if (verified) {
            console.log('📥 Loaded back from Sheets:', verified);
            const savedMatch = JSON.stringify(verified) === JSON.stringify(configData);
            
            if (savedMatch) {
              console.log(`✅ VERIFIED: Config "${configName}" saved successfully!`);
            } else {
              console.warn(`⚠️ WARNING: Config "${configName}" data mismatch!`);
              console.log('Expected:', configData);
              console.log('Got:', verified);
            }
          } else {
            console.error(`❌ FAILED: Config "${configName}" not found in Google Sheets!`);
            console.log('❗ Possible issues:');
            console.log('  1. Google Apps Script URL incorrect');
            console.log('  2. Script not deployed or has errors');
            console.log('  3. Network/firewall blocking request');
          }
        } catch (verifyError) {
          console.error(`❌ Could not verify save for "${configName}":`, verifyError);
        }
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save admin config:', error);
      return false;
    }
  }

  /**
   * Load admin config from Google Sheets
   */
  async loadAdminConfig(configName) {
    if (!this.adminConfigEnabled) {
      console.warn('⚠️ Admin config sync not enabled, loading from localStorage only');
      return null;
    }

    try {
      console.log(`📥 Loading admin config "${configName}" from Google Sheets...`);
      
      // Add cache busting to ensure fresh data
      const cacheBuster = Date.now();
      
      // Send request to load config using admin config URL
      const response = await fetch(
        `${this.adminConfigUrl}?action=getConfig&name=${configName}&_=${cacheBuster}`, 
        {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        
        // Ghi nhận lỗi vào apiMonitor
        apiMonitor.recordError(error);
        
        throw error;
      }

      const result = await response.json();
      
      if (result.success && result.config) {
        console.log(`✅ Admin config "${configName}" loaded from Google Sheets:`, result.config);
        return result.config;
      } else {
        console.log(`ℹ️ No config found for "${configName}" in Google Sheets`);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load admin config:', error);
      
      // Ghi nhận lỗi vào apiMonitor
      apiMonitor.recordError({
        message: 'Failed to load admin config: ' + error.message,
        status: error.status || 'NETWORK_ERROR',
        originalError: error
      });
      
      return null;
    }
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection() {
    if (!this.enabled) {
      return { success: false, error: 'Google Sheets not configured' };
    }

    try {
      const testData = {
        type: 'activity',
        timestamp: new Date().toISOString(),
        data: {
          activityId: 'test_' + Date.now(),
          userId: 'TEST_DMS',
          phoneNumber: '0000000000',
          userName: 'Test User',
          activityType: 'test',
          description: 'Connection test from browser',
          duration: 0,
          page: '/test',
          metadata: { source: 'connection_test' },
          timestamp: new Date().toISOString()
        }
      };

      await this._sendToSheet(testData);
      return { success: true, message: 'Connected! Check Google Sheets for test row.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // SURVEY MANAGEMENT (Google Sheets Storage)
  // =============================================

  /**
   * Save survey to Google Sheets (create or update)
   */
  async saveSurvey(surveyData) {
    if (!this.enabled) {
      console.warn('⚠️ Google Sheets not configured');
      return { success: false, error: 'Google Sheets not configured' };
    }

    try {
      const data = {
        type: 'survey',
        data: {
          ...surveyData,
          id: surveyData.id || `survey_${Date.now()}`,
          createdAt: surveyData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await this._sendToSheet(data);
      console.log('✅ Survey saved to Google Sheets:', data.data.id);
      return { success: true, id: data.data.id };
    } catch (error) {
      console.error('❌ Failed to save survey:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all surveys from Google Sheets
   */
  async getAllSurveys() {
    if (!this.enabled) {
      console.warn('⚠️ Google Sheets not configured');
      return { success: false, error: 'Google Sheets not configured', data: [] };
    }

    try {
      const response = await fetch(this.scriptUrl + '?action=getSurveys', {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Surveys loaded from Google Sheets:', result.data.length);
        return { success: true, data: result.data || [] };
      } else {
        console.log('ℹ️ No surveys found in Google Sheets');
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('❌ Failed to load surveys:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get survey by ID from Google Sheets
   */
  async getSurveyById(surveyId) {
    try {
      const result = await this.getAllSurveys();
      
      if (!result.success) {
        console.warn('⚠️ Failed to get surveys from Google Sheets');
        return { success: false, error: result.error || 'Failed to load surveys' };
      }
      
      if (result.data && Array.isArray(result.data)) {
        // Compare IDs as strings to handle number vs string mismatch
        const survey = result.data.find(s => String(s.id) === String(surveyId));
        if (survey) {
          console.log('✅ Found survey in Google Sheets:', surveyId);
          return { success: true, data: survey };
        }
      }
      
      console.log('ℹ️ Survey not found in Google Sheets:', surveyId);
      return { success: false, error: 'Survey not found' };
    } catch (error) {
      console.error('❌ Error getting survey by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete survey from Google Sheets
   */
  async deleteSurvey(surveyId) {
    if (!this.enabled) {
      return { success: false, error: 'Google Sheets not configured' };
    }

    try {
      const data = {
        type: 'delete_survey',
        data: {
          surveyId: surveyId,
          deletedAt: new Date().toISOString()
        }
      };

      await this._sendToSheet(data);
      console.log('✅ Survey deleted from Google Sheets:', surveyId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete survey:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();

// Export class for testing
export default GoogleSheetsService;

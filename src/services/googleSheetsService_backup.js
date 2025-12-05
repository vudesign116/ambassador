/**
 * Google Sheets Integration Service
 * 
 * Sync data from localStorage to Google Sheets for easy export
 * No backend required, 100% free
 */

class GoogleSheetsService {
  constructor() {
    // Paste your Google Apps Script Web App URL here
    // Get it from: Extensions → Apps Script → Deploy → Web App
    this.scriptUrl = process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
    this.enabled = !!this.scriptUrl;
  }

  /**
   * Sync survey response to Google Sheets
   */
  async syncSurveyResponse(response, survey = null) {
    if (!this.enabled) {
      console.warn('Google Sheets integration not configured');
      return false;
    }

    try {
      // Get Mã DMS from localStorage
      const maDMS = localStorage.getItem('ma_kh_dms') || response.userId || response.phoneNumber;
      const userName = localStorage.getItem('userName') || '';
      
      const data = {
        type: 'survey_response',
        timestamp: new Date().toISOString(),
        data: {
          responseId: response.id,
          surveyId: response.surveyId,
          userId: maDMS, // Mã DMS from login API
          phoneNumber: response.phoneNumber,
          userName: userName,
          answers: response.answers,
          questions: survey?.questions || [], // Pass questions for readable format
          submittedAt: response.submittedAt
        }
      };

      await this._sendToSheet(data);
      console.log('✅ Survey response synced to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync survey response:', error);
      return false;
    }
  }

  /**
   * Sync reward selection to Google Sheets
   */
  async syncRewardSelection(selection) {
    if (!this.enabled) {
      console.warn('Google Sheets integration not configured');
      return false;
    }

    try {
      // Get Mã DMS from localStorage
      const maDMS = localStorage.getItem('ma_kh_dms') || selection.userId || selection.phoneNumber;
      const userName = localStorage.getItem('userName') || selection.userName || '';
      
      const data = {
        type: 'reward_selection',
        timestamp: new Date().toISOString(),
        data: {
          selectionId: selection.id,
          userId: maDMS, // Mã DMS from login API
          phoneNumber: selection.phoneNumber,
          userName: userName,
          rewardId: selection.rewardId,
          rewardName: selection.rewardName,
          giftName: selection.giftName,
          userPoints: selection.userPoints,
          quarter: selection.quarter,
          year: selection.year,
          status: selection.status,
          selectedAt: selection.selectedAt
        }
      };

      await this._sendToSheet(data);
      console.log('✅ Reward selection synced to Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync reward selection:', error);
      return false;
    }
  }

  /**
   * Sync user activity to Google Sheets
   */
  async syncActivity(activity) {
    if (!this.enabled) {
      return false;
    }

    try {
      // Get Mã DMS from localStorage
      const maDMS = localStorage.getItem('ma_kh_dms') || activity.userId || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      const userName = localStorage.getItem('userName') || '';
      
      const data = {
        type: 'activity',
        timestamp: new Date().toISOString(),
        data: {
          activityId: activity.id || `act_${Date.now()}`,
          userId: maDMS, // Mã DMS from login API
          phoneNumber: phoneNumber,
          userName: userName,
          activityType: activity.type,
          description: activity.description || `${activity.type} on ${activity.page}`,
          points: activity.points || 0,
          metadata: activity.metadata,
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
   * Sync point history to Google Sheets
   */
  async syncPointHistory(history) {
    if (!this.enabled) {
      return false;
    }

    try {
      // Get Mã DMS from localStorage
      const maDMS = localStorage.getItem('ma_kh_dms') || history.userId || '';
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      const userName = localStorage.getItem('userName') || '';
      
      const data = {
        type: 'point_history',
        timestamp: new Date().toISOString(),
        data: {
          historyId: history.id || `hist_${Date.now()}`,
          userId: maDMS, // Mã DMS from login API
          phoneNumber: phoneNumber,
          userName: userName,
          action: history.action || 'earn', // earn, redeem, adjust
          points: history.points || 0,
          previousBalance: history.previousBalance || 0,
          newBalance: history.newBalance || 0,
          description: history.description || history.category,
          relatedType: history.relatedType || history.source,
          relatedId: history.relatedId || '',
          timestamp: history.date || history.timestamp || new Date().toISOString()
        }
      };

      await this._sendToSheet(data);
      return true;
    } catch (error) {
      console.error('❌ Failed to sync point history:', error);
      return false;
    }
  }

  /**
   * Batch sync multiple records
   */
  async batchSync(records) {
    if (!this.enabled) {
      return false;
    }

    try {
      const promises = records.map(record => this._sendToSheet(record));
      await Promise.all(promises);
      console.log(`✅ Batch synced ${records.length} records`);
      return true;
    } catch (error) {
      console.error('❌ Failed to batch sync:', error);
      return false;
    }
  }

  /**
   * Send data to Google Sheets via Apps Script
   */
  async _sendToSheet(data) {
    if (!this.scriptUrl) {
      throw new Error('Google Script URL not configured');
    }

    // Add user info to all records
    const enrichedData = {
      ...data,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    };

    const response = await fetch(this.scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedData)
    });

    // Note: no-cors mode means we can't read the response
    // Assume success if no error thrown
    return true;
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection() {
    if (!this.enabled) {
      return {
        success: false,
        message: 'Google Sheets URL not configured'
      };
    }

    try {
      await this._sendToSheet({
        type: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Connection test' }
      });

      return {
        success: true,
        message: 'Connected to Google Sheets successfully!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set Google Script URL
   */
  setScriptUrl(url) {
    this.scriptUrl = url;
    this.enabled = !!url;
    console.log('✅ Google Sheets URL configured');
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();

// Export class for testing
export default GoogleSheetsService;

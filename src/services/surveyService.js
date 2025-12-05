import { db } from './firebase';
import { googleSheetsService } from './googleSheetsService';

class SurveyService {
  async createSurvey(surveyData) {
    try {
      const survey = {
        ...surveyData,
        id: surveyData.id || `survey_${Date.now()}`,
        createdAt: surveyData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await googleSheetsService.saveSurvey(survey);
      
      if (result.success) {
        console.log('Survey saved to Google Sheets:', result.id);
        this._clearSurveysCache();
        return { success: true, id: result.id };
      } else {
        console.warn('Google Sheets failed, using Firebase fallback');
        const docRef = await db.collection('surveys').add(survey);
        this._clearSurveysCache();
        return { success: true, id: docRef.id };
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllSurveys() {
    try {
      const cacheKey = 'surveys_cache';
      const cacheTimestampKey = 'surveys_cache_timestamp';
      const CACHE_TTL = 5 * 60 * 1000;

      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey);

      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CACHE_TTL) {
          console.log('Using cached surveys (age: ' + Math.round(age / 1000) + 's)');
          const parsed = JSON.parse(cachedData);
          
          if (age > 60 * 1000) {
            this._refreshSurveysInBackground(cacheKey, cacheTimestampKey);
          }
          
          return { success: true, data: parsed };
        }
      }

      console.log('Loading surveys from Google Sheets...');
      const result = await googleSheetsService.getAllSurveys();
      
      if (result.success) {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        localStorage.setItem(cacheTimestampKey, Date.now().toString());
        console.log('Surveys loaded and cached:', result.data.length, 'surveys');
        return result;
      } else {
        console.warn('Google Sheets failed, using Firebase fallback');
        const snapshot = await db.collection('surveys').orderBy('createdAt', 'desc').get();
        const surveys = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        localStorage.setItem(cacheKey, JSON.stringify(surveys));
        localStorage.setItem(cacheTimestampKey, Date.now().toString());
        
        return { success: true, data: surveys };
      }
    } catch (error) {
      console.error('Error getting all surveys:', error);
      return { success: false, error: error.message };
    }
  }

  async _refreshSurveysInBackground(cacheKey, cacheTimestampKey) {
    try {
      console.log('Refreshing surveys cache in background...');
      const result = await googleSheetsService.getAllSurveys();
      if (result.success) {
        localStorage.setItem(cacheKey, JSON.stringify(result.data));
        localStorage.setItem(cacheTimestampKey, Date.now().toString());
        console.log('Cache refreshed in background');
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  }

  async getActiveSurveys() {
    try {
      const result = await this.getAllSurveys();
      if (result.success) {
        const activeSurveys = result.data.filter(survey => survey.isActive);
        return { success: true, data: activeSurveys };
      }
      return result;
    } catch (error) {
      console.error('Error getting active surveys:', error);
      return { success: false, error: error.message };
    }
  }

  async getSurveyById(surveyId) {
    try {
      const result = await googleSheetsService.getSurveyById(surveyId);
      
      if (result.success && result.data) {
        console.log('Survey loaded from Google Sheets:', surveyId);
        return result;
      } else {
        console.warn('Survey not in Google Sheets, checking Firebase');
        const doc = await db.collection('surveys').doc(surveyId).get();
        if (doc.exists) {
          return { 
            success: true, 
            data: { id: doc.id, ...doc.data() }
          };
        } else {
          return { success: false, error: 'Survey not found' };
        }
      }
    } catch (error) {
      console.error('Error getting survey by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSurvey(surveyId, updates) {
    try {
      console.log('📝 Updating survey:', surveyId);
      console.log('📦 Updates:', updates);
      
      const existingResult = await this.getSurveyById(surveyId);
      
      if (!existingResult.success) {
        console.error('❌ Survey not found:', surveyId);
        return { success: false, error: 'Survey not found' };
      }

      console.log('📋 Existing survey data:', existingResult.data);

      const updatedSurvey = {
        ...existingResult.data,
        ...updates,
        id: surveyId, // Force ID to stay the same
        updatedAt: new Date().toISOString()
      };
      
      console.log('💾 Saving updated survey:', updatedSurvey);
      
      const result = await googleSheetsService.saveSurvey(updatedSurvey);
      
      if (result.success) {
        console.log('Survey updated in Google Sheets:', surveyId);
        this._clearSurveysCache();
        return { success: true, id: surveyId };
      } else {
        console.warn('Google Sheets failed, using Firebase fallback');
        await db.collection('surveys').doc(surveyId).update(updatedSurvey);
        this._clearSurveysCache();
        return { success: true, id: surveyId };
      }
    } catch (error) {
      console.error('Error updating survey:', error);
      return { success: false, error: error.message };
    }
  }

  _clearSurveysCache() {
    localStorage.removeItem('surveys_cache');
    localStorage.removeItem('surveys_cache_timestamp');
    console.log('Surveys cache cleared');
  }

  async deleteSurvey(surveyId) {
    try {
      const result = await googleSheetsService.deleteSurvey(surveyId);
      
      if (result.success) {
        console.log('Survey deleted from Google Sheets:', surveyId);
        this._clearSurveysCache();
        return { success: true };
      } else {
        console.warn('Google Sheets failed, using Firebase fallback');
        await db.collection('surveys').doc(surveyId).delete();
        this._clearSurveysCache();
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      return { success: false, error: error.message };
    }
  }

  async toggleSurveyStatus(surveyId, isActive) {
    return this.updateSurvey(surveyId, { isActive });
  }

  async submitResponse(responseData) {
    try {
      const response = {
        ...responseData,
        id: `response_${Date.now()}`,
        submittedAt: new Date().toISOString()
      };
      
      await db.collection('survey_responses').add(response);
      return { success: true };
    } catch (error) {
      console.error('Error submitting response:', error);
      return { success: false, error: error.message };
    }
  }

  async getSurveyResponses(surveyId) {
    try {
      const snapshot = await db.collection('survey_responses')
        .where('surveyId', '==', surveyId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: responses };
    } catch (error) {
      console.error('Error getting survey responses:', error);
      return { success: false, error: error.message };
    }
  }

  async hasUserCompletedSurvey(surveyId, userId) {
    try {
      console.log('🔍 Checking survey completion:', surveyId, userId);
      
      // Check in Firebase - fix for SDK compatibility
      const snapshot = await db.collection('survey_responses')
        .where('surveyId', '==', surveyId)
        .where('userId', '==', userId)
        .get();
      
      // Check both empty and docs.length for compatibility
      const hasResponses = snapshot && snapshot.docs && snapshot.docs.length > 0;
      const completed = hasResponses;
      
      // 🐛 Debug: Log all matching documents
      if (hasResponses) {
        console.log(`📋 Found ${snapshot.docs.length} response(s) for survey ${surveyId}:`);
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('  - Response ID:', doc.id);
          console.log('    userId:', data.userId);
          console.log('    phoneNumber:', data.phoneNumber);
          console.log('    submittedAt:', data.submittedAt);
        });
      } else {
        console.log(`✅ User ${userId} has NOT completed survey ${surveyId} - showing survey`);
      }
      
      console.log(`📊 Survey ${surveyId} completion for user ${userId}:`, completed);
      
      return { success: true, completed };
    } catch (error) {
      console.error('❌ Error checking survey completion:', error);
      // On error, assume NOT completed to show survey
      return { success: false, completed: false };
    }
  }
}

const surveyServiceInstance = new SurveyService();
export const surveyService = surveyServiceInstance;
export default surveyServiceInstance;

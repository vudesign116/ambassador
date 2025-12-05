import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';

// Survey Service - Firebase Production Version
class SurveyService {
  // Create a new survey
  async createSurvey(surveyData) {
    try {
      const survey = {
        ...surveyData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'surveys'), survey);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all surveys
  async getAllSurveys() {
    try {
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      const surveys = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamp to ISO string for consistency
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        startDate: doc.data().startDate,
        endDate: doc.data().endDate
      }));
      return { success: true, data: surveys };
    } catch (error) {
      console.error('Error getting surveys:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active surveys (for user display)
  async getActiveSurveys() {
    try {
      const q = query(
        collection(db, 'surveys'),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const surveys = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));

      // Filter by date range (client-side since Firestore doesn't support complex date queries easily)
      const now = new Date();
      const activeSurveys = surveys.filter(survey => {
        const startDate = new Date(survey.startDate);
        const endDate = new Date(survey.endDate);
        return now >= startDate && now <= endDate;
      });

      return { success: true, data: activeSurveys };
    } catch (error) {
      console.error('Error getting active surveys:', error);
      return { success: false, error: error.message };
    }
  }

  // Get survey by ID
  async getSurveyById(surveyId) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { 
            id: docSnap.id, 
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
            updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt
          } 
        };
      } else {
        return { success: false, error: 'Survey not found' };
      }
    } catch (error) {
      console.error('Error getting survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Update survey
  async updateSurvey(surveyId, updates) {
    try {
      const docRef = doc(db, 'surveys', surveyId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete survey
  async deleteSurvey(surveyId) {
    try {
      await deleteDoc(doc(db, 'surveys', surveyId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle survey active status
  async toggleSurveyStatus(surveyId, isActive) {
    return this.updateSurvey(surveyId, { isActive });
  }

  // Submit survey response
  async submitResponse(responseData) {
    try {
      const response = {
        ...responseData,
        submittedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'survey_responses'), response);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error submitting response:', error);
      return { success: false, error: error.message };
    }
  }

  // Get responses for a survey
  async getSurveyResponses(surveyId) {
    try {
      const q = query(
        collection(db, 'survey_responses'),
        where('surveyId', '==', surveyId)
      );
      const querySnapshot = await getDocs(q);
      const responses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString() || doc.data().submittedAt
      }));
      return { success: true, data: responses };
    } catch (error) {
      console.error('Error getting responses:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has completed survey
  async hasUserCompletedSurvey(surveyId, userId) {
    try {
      const q = query(
        collection(db, 'survey_responses'),
        where('surveyId', '==', surveyId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return { success: true, completed: !querySnapshot.empty };
    } catch (error) {
      console.error('Error checking survey completion:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SurveyService();

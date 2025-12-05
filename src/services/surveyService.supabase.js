import { supabase } from './supabase';

// Survey Service - Supabase PostgreSQL Version
class SurveyService {
  // Create a new survey
  async createSurvey(surveyData) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert([{
          ...surveyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id, data };
    } catch (error) {
      console.error('Error creating survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all surveys
  async getAllSurveys() {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting surveys:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active surveys (for user display)
  async getActiveSurveys() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting active surveys:', error);
      return { success: false, error: error.message };
    }
  }

  // Get survey by ID
  async getSurveyById(surveyId) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Update survey
  async updateSurvey(surveyId, updates) {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', surveyId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete survey
  async deleteSurvey(surveyId) {
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting survey:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle survey active status
  async toggleSurveyStatus(surveyId, isActive) {
    return this.updateSurvey(surveyId, { is_active: isActive });
  }

  // Submit survey response
  async submitResponse(responseData) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([{
          survey_id: responseData.surveyId,
          user_id: responseData.userId,
          phone_number: responseData.phoneNumber,
          answers: responseData.answers,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id, data };
    } catch (error) {
      console.error('Error submitting response:', error);
      return { success: false, error: error.message };
    }
  }

  // Get responses for a survey
  async getSurveyResponses(surveyId) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting responses:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has completed survey
  async hasUserCompletedSurvey(surveyId, userId) {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', surveyId)
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;
      return { success: true, completed: data.length > 0 };
    } catch (error) {
      console.error('Error checking survey completion:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time subscription for new responses (bonus feature!)
  subscribeToResponses(surveyId, callback) {
    return supabase
      .channel('survey_responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'survey_responses',
          filter: `survey_id=eq.${surveyId}`
        },
        callback
      )
      .subscribe();
  }
}

export default new SurveyService();

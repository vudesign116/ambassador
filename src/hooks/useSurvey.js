import { useState, useEffect } from 'react';
import surveyService from '../services/surveyService';

// Hook to manage surveys
export const useSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = async () => {
    setLoading(true);
    const result = await surveyService.getAllSurveys();
    if (result.success) {
      setSurveys(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return { surveys, loading, error, refetch: fetchSurveys };
};

// Hook to get active surveys for users
export const useActiveSurveys = (userId) => {
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSurveys = async () => {
      setLoading(true);
      const result = await surveyService.getActiveSurveys();
      if (result.success) {
        // If userId provided, filter out completed surveys and skipped surveys
        if (userId) {
          const uncompletedSurveys = [];
          for (const survey of result.data) {
            // Check if user completed survey
            const completionCheck = await surveyService.hasUserCompletedSurvey(survey.id, userId);
            if (completionCheck.success && completionCheck.completed) {
              continue; // Skip completed surveys
            }
            
            // Check if user skipped survey 2+ times
            const skipKey = `survey_skip_${survey.id}_${userId}`;
            const skipCount = parseInt(localStorage.getItem(skipKey) || '0', 10);
            if (skipCount >= 2) {
              console.log(`📋 Survey ${survey.id} skipped ${skipCount} times - hiding from user`);
              continue; // Skip surveys that were skipped 2+ times
            }
            
            uncompletedSurveys.push(survey);
          }
          setActiveSurveys(uncompletedSurveys);
        } else {
          // No userId - show all active surveys
          console.log('📋 Showing all active surveys (no userId provided)');
          setActiveSurveys(result.data);
        }
      }
      setLoading(false);
    };

    fetchActiveSurveys();
  }, [userId]);

  return { activeSurveys, loading };
};

// Hook to get single survey
export const useSurvey = (surveyId) => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;
      setLoading(true);
      const result = await surveyService.getSurveyById(surveyId);
      if (result.success) {
        setSurvey(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetchSurvey();
  }, [surveyId]);

  return { survey, loading, error };
};

// Hook to get survey responses
export const useSurveyResponses = (surveyId) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResponses = async () => {
    if (!surveyId) return;
    setLoading(true);
    const result = await surveyService.getSurveyResponses(surveyId);
    if (result.success) {
      setResponses(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();
  }, [surveyId]);

  return { responses, loading, error, refetch: fetchResponses };
};

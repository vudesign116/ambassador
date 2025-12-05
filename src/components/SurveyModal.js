import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import SurveyQuestion from './SurveyQuestion';
import surveyService from '../services/surveyService';
import { googleSheetsService } from '../services/googleSheetsService';

const SurveyModal = ({ survey, visible, onClose, userId }) => {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear error when user answers
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const validateAnswers = () => {
    const newErrors = {};
    let isValid = true;

    survey.questions.forEach(question => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'Câu hỏi này là bắt buộc';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      message.error('Vui lòng trả lời tất cả câu hỏi bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const responseData = {
        surveyId: survey.id,
        userId: userId,
        phoneNumber: localStorage.getItem('phoneNumber'),
        answers: answers
      };

      // Save to localStorage
      const result = await surveyService.submitResponse(responseData);
      
      if (result.success) {
        // 🆕 Sync survey response to Google Sheets (async, không chờ)
        const fullResponse = {
          id: result.id || Date.now().toString(),
          surveyId: survey.id,
          userId: userId,
          phoneNumber: localStorage.getItem('phoneNumber'),
          answers: answers,
          submittedAt: new Date().toISOString()
        };
        
        // Pass survey object để có questions info cho readable format
        googleSheetsService.syncSurveyResponse(fullResponse, survey)
          .then(() => console.log('✅ Survey response synced to Google Sheets'))
          .catch(err => console.warn('⚠️ Failed to sync survey response:', err));
        
        // 🆕 Track survey_completed activity
        googleSheetsService.syncActivity({
          type: 'survey_completed',
          description: `Hoàn thành khảo sát: ${survey.title}`,
          page: '/dashboard',
          duration: 0,
          metadata: {
            surveyId: survey.id,
            surveyTitle: survey.title,
            questionCount: survey.questions?.length || 0,
            timestamp: new Date().toISOString()
          }
        }).catch(err => console.warn('Failed to track survey completion:', err));
        
        message.success('Cảm ơn bạn đã hoàn thành khảo sát!');
        setAnswers({});
        setErrors({});
        onClose();
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Track số lần bỏ qua survey này
    const skipKey = `survey_skip_${survey.id}_${userId}`;
    const skipCount = parseInt(localStorage.getItem(skipKey) || '0', 10);
    const newSkipCount = skipCount + 1;
    
    localStorage.setItem(skipKey, newSkipCount.toString());
    console.log(`User skipped survey ${survey.id}: ${newSkipCount} times`);
    
    // Nếu bỏ qua 2 lần, đánh dấu là không muốn làm nữa
    if (newSkipCount >= 2) {
      console.log(`User skipped survey ${survey.id} twice - won't show again`);
      // Có thể thêm logic ẩn survey vĩnh viễn ở đây nếu cần
    }
    
    onClose();
  };

  if (!survey) return null;

  return (
    <Modal
      title={survey.title}
      open={visible}
      onCancel={handleSkip}
      width={600}
      footer={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '12px' 
        }}>
          <Button 
            key="cancel" 
            onClick={handleSkip}
            style={{ flex: 1 }}
          >
            Bỏ qua
          </Button>
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            style={{ flex: 1 }}
          >
            Gửi khảo sát
          </Button>
        </div>
      }
    >
      {survey.bannerUrl && (
        <div style={{ marginBottom: '16px', marginTop: '-8px' }}>
          <img 
            src={survey.bannerUrl} 
            alt="Survey Banner" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px'
            }} 
          />
        </div>
      )}

      {survey.description && (
        <div style={{ marginBottom: '24px', color: '#666' }}>
          {survey.description}
        </div>
      )}

      {survey.questions.map((question) => (
        <SurveyQuestion
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => handleAnswerChange(question.id, value)}
          error={errors[question.id]}
        />
      ))}
    </Modal>
  );
};

export default SurveyModal;

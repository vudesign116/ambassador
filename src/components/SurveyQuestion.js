import React from 'react';
import { Input, Checkbox, Radio, Select, Rate, Space } from 'antd';

const { TextArea } = Input;

// Dynamic question renderer based on question type
const SurveyQuestion = ({ question, value, onChange, error }) => {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            placeholder={question.placeholder || 'Nhập câu trả lời...'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            status={error ? 'error' : ''}
          />
        );

      case 'textarea':
        return (
          <TextArea
            rows={4}
            placeholder={question.placeholder || 'Nhập câu trả lời...'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            status={error ? 'error' : ''}
          />
        );

      case 'single-choice':
      case 'radio':
        return (
          <Radio.Group
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {(question.options || []).map((option, index) => {
                // Handle both string and object format
                const optionValue = typeof option === 'string' ? option : (option.value || option.label);
                const optionLabel = typeof option === 'string' ? option : (option.label || option.value);
                
                return (
                  <Radio 
                    key={index} 
                    value={optionValue}
                    style={{ 
                      display: 'block',
                      height: '32px',
                      lineHeight: '32px',
                      marginBottom: '8px'
                    }}
                  >
                    {optionLabel}
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        );

      case 'multiple-choice':
      case 'checkbox':
        return (
          <Checkbox.Group
            value={value || []}
            onChange={onChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {(question.options || []).map((option, index) => {
                const optionValue = typeof option === 'string' ? option : (option.value || option.label);
                const optionLabel = typeof option === 'string' ? option : (option.label || option.value);
                
                return (
                  <Checkbox 
                    key={index} 
                    value={optionValue}
                    style={{ 
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    {optionLabel}
                  </Checkbox>
                );
              })}
            </Space>
          </Checkbox.Group>
        );

      case 'select':
        return (
          <Select
            placeholder="Chọn một đáp án"
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
            status={error ? 'error' : ''}
          >
            {question.options.map((option, index) => (
              <Select.Option key={index} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        );

      case 'rating':
        return (
          <Rate
            value={value}
            onChange={onChange}
            count={question.maxRating || 5}
          />
        );

      default:
        return <Input disabled placeholder="Loại câu hỏi không được hỗ trợ" />;
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>
          {question.question}
          {question.required && <span style={{ color: 'red' }}> *</span>}
        </strong>
        {question.description && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {question.description}
          </div>
        )}
      </div>
      {renderInput()}
      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SurveyQuestion;

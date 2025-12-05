import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Card,
  Select,
  InputNumber,
  Checkbox,
  message,
  Upload,
  Image,
  Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import surveyService from '../../services/surveyService';
import { useSurvey } from '../../hooks/useSurvey';
import { processBannerUrl } from '../../utils/imageUrlHelper';
import dayjs from 'dayjs';
import '../../styles/AdminSurvey.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const QUESTION_TYPES = [
  { label: 'Văn bản ngắn', value: 'text' },
  { label: 'Văn bản dài', value: 'textarea' },
  { label: 'Chọn nhiều (Checkbox)', value: 'checkbox' },
  { label: 'Chọn một (Radio)', value: 'radio' },
  { label: 'Danh sách chọn (Select)', value: 'select' },
  { label: 'Đánh giá sao (Rating)', value: 'rating' }
];

const SurveyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { survey, loading: surveyLoading } = useSurvey(id);
  
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [questions, setQuestions] = useState([{
    id: Date.now().toString(),
    type: 'text',
    question: '',
    required: false,
    options: []
  }]);

  useEffect(() => {
    if (isEdit && survey) {
      form.setFieldsValue({
        title: survey.title,
        description: survey.description,
        dateRange: [dayjs(survey.startDate), dayjs(survey.endDate)],
        isActive: survey.isActive
      });
      setQuestions(survey.questions || []);
      setBannerUrl(survey.bannerUrl || '');
    }
  }, [survey, isEdit, form]);

  // Handle banner URL submit
  const handleBannerUrlSubmit = async () => {
    if (!bannerUrlInput.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading(true);
    
    try {
      const result = await processBannerUrl(bannerUrlInput);
      
      if (result.success) {
        setBannerUrl(result.url);
        message.success('✅ URL banner đã được lưu!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving banner URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading(false);
    }
  };

  // Handle banner upload (convert to base64)
  const handleBannerUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: false,
      options: []
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      message.warning('Khảo sát phải có ít nhất 1 câu hỏi');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const needsOptions = (type) => {
    return ['checkbox', 'radio', 'select'].includes(type);
  };

  const handleSubmit = async (values) => {
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        message.error(`Câu hỏi ${i + 1} không được để trống`);
        return;
      }
      if (needsOptions(q.type) && (!q.options || q.options.length === 0)) {
        message.error(`Câu hỏi ${i + 1} cần có ít nhất 1 lựa chọn`);
        return;
      }
      if (needsOptions(q.type)) {
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length === 0) {
          message.error(`Câu hỏi ${i + 1} cần có ít nhất 1 lựa chọn hợp lệ`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const surveyData = {
        title: values.title,
        description: values.description || '',
        bannerUrl: bannerUrl || '', // ✅ Save banner URL to survey
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        isActive: values.isActive !== undefined ? values.isActive : true,
        questions: questions.map(q => ({
          ...q,
          options: needsOptions(q.type) ? q.options.filter(opt => opt.trim()) : undefined
        }))
      };

      let result;
      if (isEdit) {
        // ✅ Update existing survey (not create new one)
        result = await surveyService.updateSurvey(id, surveyData);
      } else {
        result = await surveyService.createSurvey(surveyData);
      }

      if (result.success) {
        message.success(isEdit ? 'Cập nhật khảo sát thành công' : 'Tạo khảo sát thành công');
        navigate('/admin/surveys');
      } else {
        message.error('Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && surveyLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải...</div>;
  }

  return (
    <div className="survey-form-page">
      <div className="header-gradient">
        <button
          className="btn-link"
          onClick={() => navigate('/admin/surveys')}
          style={{ marginBottom: '16px', fontSize: '16px' }}
        >
          ← Quay lại danh sách
        </button>
        <h2 className="header-title">
          {isEdit ? 'SỬA KHẢO SÁT' : 'TẠO KHẢO SÁT MỚI'}
        </h2>
      </div>

      <div className="container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Card title="Thông tin khảo sát" style={{ marginBottom: '16px' }}>
            <Form.Item
              label="Tiêu đề khảo sát"
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="VD: Khảo sát hài lòng Q1/2025" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
            >
              <TextArea rows={3} placeholder="Mô tả ngắn về khảo sát..." />
            </Form.Item>

            <Form.Item label="Banner khảo sát (tùy chọn)">
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Option 1: Paste URL */}
                <div style={{ width: '100%' }}>
                  <Typography.Text strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Typography.Text>
                  <Input.Search
                    placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
                    value={bannerUrlInput}
                    onChange={(e) => setBannerUrlInput(e.target.value)}
                    onSearch={handleBannerUrlSubmit}
                    enterButton={
                      <Button 
                        type="primary" 
                        icon={<LinkOutlined />}
                        loading={urlLoading}
                      >
                        Lưu URL
                      </Button>
                    }
                    loading={urlLoading}
                    size="middle"
                    style={{ marginTop: 8, marginBottom: 12 }}
                  />
                </div>

                {/* Option 2: Upload file */}
                <div>
                  <Typography.Text strong>Option 2: Upload file (localStorage)</Typography.Text>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleBannerUpload}
                    style={{ marginTop: 8 }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {bannerUrl ? 'Thay đổi banner' : 'Tải lên banner'}
                    </Button>
                  </Upload>
                </div>

                {bannerUrl && (
                  <div style={{ marginTop: '12px' }}>
                    <Image
                      src={bannerUrl}
                      alt="Banner"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <Button 
                      danger 
                      size="small" 
                      style={{ marginTop: '8px' }}
                      onClick={() => { setBannerUrl(''); setBannerUrlInput(''); }}
                    >
                      Xóa banner
                    </Button>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#666' }}>
                  Banner sẽ hiển thị ở đầu khảo sát. Kích thước đề xuất: 800x300px
                </div>
              </Space>
            </Form.Item>

            <Form.Item
              label="Thời gian hiển thị"
              name="dateRange"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Checkbox>Bật khảo sát ngay</Checkbox>
            </Form.Item>
          </Card>

          <Card
            title="Danh sách câu hỏi"
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addQuestion}
              >
                Thêm câu hỏi
              </Button>
            }
          >
            {questions.map((question, index) => (
              <Card
                key={question.id}
                size="small"
                title={`Câu hỏi ${index + 1}`}
                extra={
                  questions.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeQuestion(index)}
                    >
                      Xóa
                    </Button>
                  )
                }
                style={{ marginBottom: '16px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>
                      Loại câu hỏi
                    </label>
                    <Select
                      value={question.type}
                      onChange={(value) => updateQuestion(index, 'type', value)}
                      style={{ width: '100%' }}
                      options={QUESTION_TYPES}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>
                      Nội dung câu hỏi <span style={{ color: 'red' }}>*</span>
                    </label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="VD: Bạn có hài lòng với dịch vụ?"
                    />
                  </div>

                  {question.type === 'text' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        Placeholder (tùy chọn)
                      </label>
                      <Input
                        value={question.placeholder}
                        onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                        placeholder="VD: Nhập họ tên của bạn..."
                      />
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        Số sao tối đa
                      </label>
                      <InputNumber
                        min={3}
                        max={10}
                        value={question.maxRating || 5}
                        onChange={(value) => updateQuestion(index, 'maxRating', value)}
                      />
                    </div>
                  )}

                  {needsOptions(question.type) && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        Các lựa chọn <span style={{ color: 'red' }}>*</span>
                      </label>
                      {question.options?.map((option, optionIndex) => (
                        <Space key={optionIndex} style={{ display: 'flex', marginBottom: '8px' }}>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                            placeholder={`Lựa chọn ${optionIndex + 1}`}
                          />
                          {question.options.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => removeOption(index, optionIndex)}
                            />
                          )}
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => addOption(index)}
                        block
                      >
                        + Thêm lựa chọn
                      </Button>
                    </div>
                  )}

                  <div>
                    <Checkbox
                      checked={question.required}
                      onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    >
                      Bắt buộc trả lời
                    </Checkbox>
                  </div>
                </Space>
              </Card>
            ))}
          </Card>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space>
              <Button onClick={() => navigate('/admin/surveys')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {isEdit ? 'Cập nhật' : 'Tạo khảo sát'}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SurveyFormPage;

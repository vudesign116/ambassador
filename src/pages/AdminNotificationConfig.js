import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Alert, Typography, Card, Form, Switch, Upload, message, Space } from 'antd';
import { SaveOutlined, UploadOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminNotificationConfig = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadConfigFromStorage();
  }, [navigate]);

  const loadConfigFromStorage = async () => {
    const savedConfig = await loadConfig('admin_notification_config');
    if (savedConfig) {
      form.setFieldsValue({
        enabled: savedConfig.enabled || false,
        title: savedConfig.title || '',
        message: savedConfig.message || '',
        url: savedConfig.url || '',
        image: savedConfig.image || ''
      });
      setPreviewImage(savedConfig.image || '');
    } else {
      form.setFieldsValue({
        enabled: false,
        title: '',
        message: '',
        url: '',
        image: ''
      });
    }
  };

  const handleImageUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading(true);
    
    try {
      const result = await processBannerUrl(imageUrl);
      
      if (result.success) {
        setPreviewImage(result.url);
        form.setFieldsValue({ image: result.url });
        message.success('✅ URL ảnh đã được lưu!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving image URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    // Check if file is valid
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể tải lên file hình ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      setPreviewImage(imageData);
      form.setFieldsValue({ image: imageData });
      message.success('Tải hình ảnh thành công!');
    };
    
    reader.readAsDataURL(file);
    return false; // Prevent default upload behavior
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const config = {
        enabled: values.enabled || false,
        title: values.title || '',
        message: values.message || '',
        url: values.url || '',
        image: values.image || '',
        updatedAt: Date.now()
      };

      await saveConfig('admin_notification_config', config);
      
      // Set flag to show notification on next dashboard visit
      if (config.enabled) {
        localStorage.setItem('notification_pending', 'true');
      } else {
        localStorage.removeItem('notification_pending');
      }
      
      setLoading(false);
      message.success('✅ Đã lưu cấu hình thông báo! (Sync mọi thiết bị)');
    } catch (error) {
      message.error('Vui lòng kiểm tra lại các trường thông tin');
    }
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    if (!values.title && !values.message && !previewImage) {
      message.warning('Vui lòng nhập thông tin thông báo để xem preview');
      return;
    }
    setShowPreview(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/admin')}>← Quay lại Dashboard</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Title level={2}>🔔 Cấu hình thông báo</Title>
        <Text type="secondary">Quản lý thông báo popup hiển thị cho người dùng</Text>
      </div>

      <Form form={form} layout="vertical">
        <Card title="Nội dung thông báo" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Bật/Tắt thông báo"
            name="enabled"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="BẬT" 
              unCheckedChildren="TẮT"
            />
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input 
              placeholder="VD: Thông báo quan trọng" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Nội dung thông báo"
            name="message"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea 
              placeholder="VD: Sắp đến ngày xếp hạng cuối tháng. Hãy hoàn thành các nhiệm vụ để đạt thứ hạng cao nhất!"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            name="image"
          >
            {/* Option 1: Paste URL */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Text>
              <Input.Search
                placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onSearch={handleImageUrlSubmit}
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
                size="large"
                style={{ marginTop: 8 }}
              />
            </div>

            {/* Option 2: Upload file */}
            <div>
              <Text strong>Option 2: Upload file (localStorage)</Text>
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
                style={{ marginTop: 8 }}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Chọn hình ảnh
                </Button>
              </Upload>
            </div>

            {previewImage && (
              <div style={{ marginTop: 16, position: 'relative' }}>
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 300, 
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }} 
                />
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setPreviewImage('');
                    form.setFieldsValue({ image: '' });
                    message.success('Đã xóa hình ảnh');
                  }}
                  style={{ 
                    marginTop: 8,
                    width: '100%'
                  }}
                >
                  Xóa hình ảnh
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="URL (không bắt buộc)"
            name="url"
            extra="Nếu có URL, khi click nút 'Tiếp tục' sẽ mở trang này"
          >
            <Input 
              placeholder="VD: https://example.com/promotion" 
              size="large"
            />
          </Form.Item>
        </Card>

        <Space size="middle">
          <Button 
            type="primary" 
            size="large" 
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            Lưu cấu hình
          </Button>
          <Button 
            size="large" 
            icon={<EyeOutlined />}
            onClick={handlePreview}
          >
            Xem trước
          </Button>
        </Space>
      </Form>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowPreview(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: 16,
              maxWidth: 400,
              width: '90%',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Notification" 
                style={{ width: '100%', display: 'block' }}
              />
            )}
            <div style={{ padding: 24 }}>
              <Title level={4} style={{ marginBottom: 12 }}>
                {form.getFieldValue('title') || 'Tiêu đề thông báo'}
              </Title>
              <Text style={{ fontSize: 15, lineHeight: 1.6, display: 'block', marginBottom: 24 }}>
                {form.getFieldValue('message') || 'Nội dung thông báo sẽ hiển thị ở đây...'}
              </Text>
              <Button 
                type="primary" 
                size="large" 
                block
                onClick={() => setShowPreview(false)}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationConfig;

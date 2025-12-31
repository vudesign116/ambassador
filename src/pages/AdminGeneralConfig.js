import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputNumber, Input, Alert, Typography, Card, Form, message, Switch } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;

const AdminGeneralConfig = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enable50Percent, setEnable50Percent] = useState(true); // Track switch state

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadConfigFromStorage();
  }, [navigate]);

  const loadConfigFromStorage = async () => {
    const savedConfig = await loadConfig('admin_general_config');
    if (savedConfig) {
      form.setFieldsValue(savedConfig);
      setEnable50Percent(savedConfig.enable50PercentMilestone !== false); // Update state
    } else {
      // Default values
      form.setFieldsValue({
        enable50PercentMilestone: true, // Mặc định bật mốc 50%
        pointsViewDuration50: 60,    // 50% points at 60s
        pointsViewDuration100: 120,  // 100% points at 120s
        reviewCooldownMinutes: 5
      });
      setEnable50Percent(true); // Update state
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Save to Google Sheets (cross-device sync)
      await saveConfig('admin_general_config', values);
      
      setLoading(false);
      message.success('✅ Đã lưu cấu hình! (Sync mọi thiết bị)');
    } catch (error) {
      setLoading(false);
      message.error('Vui lòng kiểm tra lại các trường thông tin');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Cấu hình chung</Title>
        <Text type="secondary">Cấu hình thời gian tính điểm và các thông số hệ thống</Text>
      </div>

      <Form form={form} layout="vertical">
        <Card title="⏱️ Cấu hình thời gian" style={{ marginBottom: 24 }}>
          <Form.Item
            name="enable50PercentMilestone"
            valuePropName="checked"
            style={{ marginBottom: 16 }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 16px', 
              background: '#f0f5ff',
              borderRadius: 8,
              border: '1px solid #d6e4ff'
            }}>
              <Switch 
                checked={enable50Percent}
                onChange={(checked) => {
                  setEnable50Percent(checked);
                  form.setFieldsValue({ enable50PercentMilestone: checked });
                }}
              />
              <div style={{ marginLeft: 12, flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1890ff' }}>
                  {enable50Percent ? '✅ Bật mốc 50% điểm' : '❌ Tắt mốc 50% điểm'}
                </strong>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {enable50Percent
                    ? 'Hệ thống tính điểm theo 2 mốc: 50% và 100%' 
                    : 'Hệ thống chỉ tính điểm theo 1 mốc: 100%'}
                </div>
              </div>
            </div>
          </Form.Item>

          <Alert
            message={enable50Percent
              ? "📊 Hệ thống tính điểm theo 2 mốc thời gian" 
              : "📊 Hệ thống tính điểm theo 1 mốc thời gian"}
            description={
              <div>
                {enable50Percent ? (
                  <div>
                    <p style={{ marginBottom: 8 }}>
                      • <strong>Mốc 50%:</strong> Xem đủ thời gian này → Nhận 50% điểm<br/>
                      • <strong>Mốc 100%:</strong> Xem đủ thời gian này → Nhận 100% điểm
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                      Ví dụ: Tài liệu có 4 điểm, xem 60s được 2 điểm (50%), xem 120s được 4 điểm (100%)
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: 8 }}>
                      • <strong>Mốc 100%:</strong> Xem đủ thời gian này → Nhận 100% điểm
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                      Ví dụ: Tài liệu có 4 điểm, xem 120s được 4 điểm (100%). Không có thông báo mốc 50%, bấm Close sẽ POST API ngay.
                    </p>
                  </div>
                )}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Thời gian xem để nhận 50% điểm (giây)"
            name="pointsViewDuration50"
            rules={[
              { required: enable50Percent, message: 'Vui lòng nhập thời gian' },
              { type: 'number', min: 1, message: 'Phải lớn hơn 0' }
            ]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {enable50Percent
                  ? `Người dùng xem ${form.getFieldValue('pointsViewDuration50') || 60} giây → Nhận 50% điểm`
                  : 'Tính năng mốc 50% đang tắt'}
              </Text>
            }
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="60"
              disabled={!enable50Percent}
            />
          </Form.Item>

          <Form.Item
            label="Thời gian xem để nhận 100% điểm (giây)"
            name="pointsViewDuration100"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian' },
              { type: 'number', min: 1, message: 'Phải lớn hơn 0' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const duration50 = getFieldValue('pointsViewDuration50');
                  if (!enable50Percent || !value || !duration50 || value >= duration50) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mốc 100% phải >= mốc 50%'));
                },
              }),
            ]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Người dùng xem {form.getFieldValue('pointsViewDuration100') || 120} giây → Nhận 100% điểm
              </Text>
            }
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="120" />
          </Form.Item>

          <Form.Item
            label="Thời gian chờ sau khi xem (phút)"
            name="reviewCooldownMinutes"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thời gian disable video/pdf sau khi xem: {form.getFieldValue('reviewCooldownMinutes') || 5} phút
              </Text>
            }
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="5" />
          </Form.Item>
        </Card>
      </Form>

      <Button
        type="primary"
        size="large"
        icon={<SaveOutlined />}
        onClick={handleSave}
        loading={loading}
        block
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: '48px'
        }}
      >
        Lưu cấu hình
      </Button>
    </div>
  );
};

export default AdminGeneralConfig;

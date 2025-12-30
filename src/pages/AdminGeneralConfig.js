import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputNumber, Input, Alert, Typography, Card, Form, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;

const AdminGeneralConfig = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
    } else {
      // Default values
      form.setFieldsValue({
        pointsViewDuration50: 60,    // 50% points at 60s
        pointsViewDuration100: 120,  // 100% points at 120s
        reviewCooldownMinutes: 5,
        apiEndpoint: 'https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1',
        rewardApiEndpoint: 'https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/?test=1'
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await saveConfig('admin_general_config', values);
      
      // Update the actual app configuration (these are runtime settings, keep in localStorage)
      localStorage.setItem('app_points_view_duration_50', values.pointsViewDuration50.toString());
      localStorage.setItem('app_points_view_duration_100', values.pointsViewDuration100.toString());
      localStorage.setItem('app_review_cooldown', (values.reviewCooldownMinutes * 60 * 1000).toString());
      
      // Backward compatibility - keep old key for apps that still use it
      localStorage.setItem('app_points_view_duration', values.pointsViewDuration100.toString());
      
      // API endpoint chỉ dùng để POST lịch sử điểm lên server, không ảnh hưởng các API khác
      if (values.apiEndpoint) {
        localStorage.setItem('app_sync_point_api_endpoint', values.apiEndpoint);
      } else {
        localStorage.removeItem('app_sync_point_api_endpoint');
      }
      
      // Reward API endpoint - POST data chọn quà
      if (values.rewardApiEndpoint) {
        localStorage.setItem('app_reward_api_endpoint', values.rewardApiEndpoint);
      } else {
        localStorage.removeItem('app_reward_api_endpoint');
      }
      
      setLoading(false);
      message.success('✅ Đã lưu cấu hình! (Sync mọi thiết bị)');
    } catch (error) {
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
          <Alert
            message="📊 Hệ thống tính điểm theo 2 mốc thời gian"
            description={
              <div>
                <p style={{ marginBottom: 8 }}>
                  • <strong>Mốc 50%:</strong> Xem đủ thời gian này → Nhận 50% điểm<br/>
                  • <strong>Mốc 100%:</strong> Xem đủ thời gian này → Nhận 100% điểm
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                  Ví dụ: Tài liệu có 4 điểm, xem 60s được 2 điểm (50%), xem 120s được 4 điểm (100%)
                </p>
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
              { required: true, message: 'Vui lòng nhập thời gian' },
              { type: 'number', min: 1, message: 'Phải lớn hơn 0' }
            ]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Người dùng xem {form.getFieldValue('pointsViewDuration50') || 60} giây → Nhận 50% điểm
              </Text>
            }
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="60" />
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
                  if (!value || !duration50 || value >= duration50) {
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

        <Card title="🔌 Cấu hình API đồng bộ dữ liệu" style={{ marginBottom: 24 }}>
          <Form.Item
            label="API Endpoint để POST lịch sử điểm lên server (tùy chọn)"
            name="apiEndpoint"
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                VD: https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/
              </Text>
            }
          >
            <Input placeholder="https://api.example.com/sync-point-history" />
          </Form.Item>

          <Form.Item
            label="API Endpoint để POST dữ liệu chọn quà"
            name="rewardApiEndpoint"
            rules={[{ required: true, message: 'Vui lòng nhập API endpoint' }]}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                API để gửi dữ liệu khi user chọn quà hàng tháng/DGCC/CGSP
              </Text>
            }
          >
            <Input placeholder="https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/" />
          </Form.Item>

          <Alert
            message="Lưu ý về API"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li><strong>API lịch sử điểm:</strong> POST khi user xem tài liệu và tích điểm</li>
                <li><strong>API chọn quà:</strong> POST khi user chọn quà với format: phone, value (monthly), value1 (DGCC), value2 (CGSP), inserted_at</li>
                <li>Không ảnh hưởng đến các API khác (login, documents, get point history, etc.)</li>
                <li>API cần hỗ trợ Bearer token authentication</li>
              </ul>
            }
            type="info"
            showIcon
          />
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import ambassadorLogo from '../images/MAmbassador-logo.png';

const { Title, Text } = Typography;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Hash password using SHA-256
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'MAmbassador_Salt_2024'); // Add salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleLogin = async (values) => {
    setError('');
    setLoading(true);

    try {
      // Hardcoded admin credentials
      const ADMIN_USERNAME = 'mr_admin';
      // Hash of 'abc123!#' with salt 'MAmbassador_Salt_2024'
      const ADMIN_PASSWORD_HASH = 'dc1b84dd50fbc8a9e508bf84063adaa8b9e63b2e2306a5110a02be603a383220';
      
      // Hash the input password
      const inputPasswordHash = await hashPassword(values.password);

      setTimeout(() => {
        if (values.username === ADMIN_USERNAME && inputPasswordHash === ADMIN_PASSWORD_HASH) {
          // Save admin session (with timestamp for session expiry)
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminUsername', values.username);
          localStorage.setItem('adminLoginTime', Date.now().toString());
          navigate('/admin');
        } else {
          setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      setError('Đã xảy ra lỗi khi đăng nhập');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '480px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        styles={{ body: { padding: '48px 40px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img 
            src={ambassadorLogo} 
            alt="M.Ambassador Logo" 
            style={{ width: '140px', marginBottom: '24px' }}
          />
          <Title level={2} style={{ marginBottom: '10px' }}>
            Admin Panel
          </Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
            Đăng nhập để quản lý hệ thống
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="admin-login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập" 
              style={{ height: '50px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              style={{ height: '50px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '54px',
                fontSize: '17px',
                fontWeight: '600',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;

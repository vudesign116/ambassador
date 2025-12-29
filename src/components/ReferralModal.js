import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import apiHelper from '../utils/apiHelper';

/**
 * ReferralModal - Modal để nhập số điện thoại người giới thiệu
 * Hiển thị khi user login lần đầu (point = 0)
 */
const ReferralModal = ({ visible, onClose, userPhone, userMaKhDms }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  console.log('[ReferralModal] Rendered - visible:', visible, 'userPhone:', userPhone, 'userMaKhDms:', userMaKhDms);

  // Xử lý submit form
  const handleSubmit = async (values) => {
    const { referralPhone } = values;
    
    setLoading(true);
    try {
      // 1. Kiểm tra thông tin người giới thiệu (dùng login API để lấy ma_kh_dms)
      console.log('[Referral] Checking referral phone:', referralPhone);
      const checkResult = await apiHelper.getUserInfo(referralPhone);
      
      if (!checkResult.success) {
        if (checkResult.reason === 'phone_not_found') {
          message.error('Số điện thoại người giới thiệu không tồn tại trong hệ thống!');
        } else {
          message.error('Không thể kiểm tra thông tin người giới thiệu. Vui lòng thử lại!');
        }
        setLoading(false);
        return;
      }

      const referralMaKhDms = checkResult.data?.ma_kh_dms;
      console.log('[Referral] User ma_kh_dms:', userMaKhDms, 'Referral ma_kh_dms:', referralMaKhDms);

      // 2. Kiểm tra cùng nhà thuốc
      if (userMaKhDms !== referralMaKhDms) {
        Modal.error({
          title: 'Không cùng nhà thuốc',
          content: 'Người giới thiệu không cùng 1 nhà thuốc, vui lòng kiểm tra lại SĐT người giới thiệu.',
          okText: 'Đã hiểu',
        });
        setLoading(false);
        return;
      }

      // 3. Submit referral
      console.log('[Referral] Same store confirmed. Submitting referral...');
      const submitResult = await apiHelper.submitReferral(userPhone, referralPhone);

      if (submitResult.success) {
        message.success('Đã lưu thông tin người giới thiệu thành công! 🎉');
        form.resetFields();
        onClose(true); // Close with success flag
      } else {
        // Show error_message from API (e.g., "Người giới thiệu đã được sử dụng...")
        const errorMsg = submitResult.reason || 'Không thể lưu thông tin. Vui lòng thử lại!';
        message.error(errorMsg);
        console.error('[Referral] Submit failed:', submitResult);
      }
    } catch (error) {
      console.error('[Referral] Error:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý bỏ qua
  const handleSkip = () => {
    Modal.confirm({
      title: 'Bỏ qua nhập người giới thiệu?',
      content: 'Bạn có thể nhập thông tin này sau. Bạn có chắc muốn bỏ qua?',
      okText: 'Bỏ qua',
      cancelText: 'Ở lại',
      onOk: () => {
        form.resetFields();
        onClose(false); // Close without submitting
      },
    });
  };

  // Validate số điện thoại
  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập số điện thoại!'));
    }
    
    // Remove spaces and special characters
    const cleanPhone = value.replace(/[\s\-\.]/g, '');
    
    // Check Vietnamese phone format (10-11 digits, starts with 0)
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return Promise.reject(new Error('Số điện thoại không hợp lệ!'));
    }

    // Check if same as user's phone
    if (cleanPhone === userPhone) {
      return Promise.reject(new Error('Không thể tự giới thiệu chính mình!'));
    }

    return Promise.resolve();
  };

  return (
    <>
      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .referral-icon {
          animation: float 3s ease-in-out infinite;
        }
        
        .referral-content {
          animation: fadeInUp 0.5s ease-out;
        }
      `}} />
    
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '8px 0'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <UserAddOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <span style={{ 
              fontSize: 18, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Người giới thiệu
            </span>
          </div>
        }
        open={visible}
        onCancel={handleSkip}
        footer={null}
        width={500}
        centered
        maskClosable={false}
        style={{ borderRadius: 12 }}
      >
        {/* Hero Section with Icon */}
        <div className="referral-content" style={{ 
          textAlign: 'center', 
          marginBottom: 20,
          padding: '12px 0'
        }}>
          <div className="referral-icon" style={{
            fontSize: 64,
            marginBottom: 12
          }}>
            🌟
          </div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 18,
            fontWeight: 600,
            color: '#1890ff'
          }}>
            Bạn có người giới thiệu không?
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: 13, 
            color: '#666',
            lineHeight: 1.5
          }}>
            Nhập số điện thoại người giới thiệu (cùng nhà thuốc)<br/>
            để người giới thiệu <strong style={{ color: '#52c41a' }}>được ghi nhận</strong> 🎉
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="referralPhone"
            label={
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Số điện thoại người giới thiệu
              </span>
            }
            rules={[{ validator: validatePhone }]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
              placeholder="Nhập số điện thoại (VD: 0987654321)"
              size="large"
              maxLength={15}
              disabled={loading}
              style={{ 
                borderRadius: 8,
                fontSize: 14
              }}
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            gap: 10, 
            justifyContent: 'flex-end',
            marginTop: 16
          }}>
            <Button 
              onClick={handleSkip} 
              disabled={loading}
              size="large"
              style={{ 
                borderRadius: 8,
                minWidth: 90
              }}
            >
              Bỏ qua
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{ 
                borderRadius: 8,
                minWidth: 110,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              Xác nhận
            </Button>
          </div>
        </Form>

        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
          borderRadius: 8,
          border: '2px solid #fdcb6e',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'rgba(255,255,255,0.3)\'/%3E%3C/svg%3E")',
            opacity: 0.5
          }}></div>
          <p style={{ 
            margin: 0, 
            fontSize: 12, 
            color: '#6c5ce7',
            fontWeight: 500,
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span>
              <strong>Lưu ý:</strong> Người giới thiệu phải là nhân viên cùng nhà thuốc với bạn.
            </span>
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ReferralModal;

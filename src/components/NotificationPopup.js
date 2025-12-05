import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography } from 'antd';

const { Title, Text } = Typography;

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Check if there's a pending notification
    const notificationPending = localStorage.getItem('notification_pending');
    const phoneNumber = localStorage.getItem('phoneNumber');
    const lastShownKey = `notification_last_shown_${phoneNumber}`;
    const lastShown = localStorage.getItem(lastShownKey);
    
    if (notificationPending === 'true') {
      const savedConfig = localStorage.getItem('admin_notification_config');
      if (savedConfig) {
        const notificationConfig = JSON.parse(savedConfig);
        
        // Only show if enabled and hasn't been shown yet for this user
        if (notificationConfig.enabled) {
          const configTimestamp = notificationConfig.updatedAt || 0;
          const lastShownTimestamp = lastShown ? parseInt(lastShown) : 0;
          
          // Show if it's a new notification or updated after last shown
          if (configTimestamp > lastShownTimestamp) {
            setConfig(notificationConfig);
            setVisible(true);
          }
        }
      }
    }
  }, []);

  const handleClose = () => {
    const phoneNumber = localStorage.getItem('phoneNumber');
    const lastShownKey = `notification_last_shown_${phoneNumber}`;
    
    // Save the timestamp when notification was shown
    localStorage.setItem(lastShownKey, Date.now().toString());
    
    // Handle URL if provided
    if (config && config.url) {
      window.open(config.url, '_blank');
    }
    
    setVisible(false);
  };

  if (!config) return null;

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      closable={false}
      centered
      width={400}
      styles={{
        body: { padding: 0 }
      }}
      className="notification-popup-modal"
    >
      <div style={{ borderRadius: 16, overflow: 'hidden' }}>
        {config.image && (
          <img 
            src={config.image} 
            alt="Notification" 
            style={{ width: '100%', display: 'block' }}
          />
        )}
        <div style={{ padding: 24 }}>
          {config.title && (
            <Title level={4} style={{ marginBottom: 12, textAlign: 'center' }}>
              {config.title}
            </Title>
          )}
          {config.message && (
            <Text 
              style={{ 
                fontSize: 15, 
                lineHeight: 1.6, 
                display: 'block', 
                marginBottom: 24,
                textAlign: 'center' 
              }}
            >
              {config.message}
            </Text>
          )}
          <Button 
            type="primary" 
            size="large" 
            block
            onClick={handleClose}
            style={{ fontWeight: 600 }}
          >
            {config.url ? 'Xem chi tiết' : 'Tiếp tục'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationPopup;

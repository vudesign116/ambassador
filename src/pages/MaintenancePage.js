import React from 'react';
import { Button, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import '../styles/MaintenancePage.css';

const { Title, Paragraph } = Typography;

const MaintenancePage = ({ onRetry }) => {
  const clearMaintenanceMode = () => {
    console.log('🧹 Clearing maintenance mode...');
    
    // Clear localStorage
    localStorage.removeItem('maintenanceMode');
    localStorage.removeItem('maintenanceError');
    
    // Clear API Monitor errors nếu có thể access
    if (window.apiMonitor) {
      console.log('🔄 Resetting API Monitor...');
      window.apiMonitor.reset();
    }
    
    console.log('✅ Maintenance mode cleared!');
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh button clicked');
    clearMaintenanceMode();
    
    if (onRetry) {
      onRetry();
    } else {
      // Force reload trang
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    console.log('🏠 Home button clicked');
    clearMaintenanceMode();
    
    // Verify localStorage đã clear
    console.log('Maintenance mode after clear:', localStorage.getItem('maintenanceMode'));
    
    // FORCE navigate và reload bằng window.location.replace
    // Replace không tạo history entry mới, force browser reload page
    window.location.replace('/');
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        <div className="maintenance-content">
          {/* Icon Animation */}
          <div className="icon-wrapper">
            <svg className="maintenance-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              
              {/* Wrench */}
              <g className="wrench-group">
                <path d="M140 60 L140 80 L120 80 L120 60 Z" fill="url(#gradient1)" className="wrench-handle"/>
                <circle cx="130" cy="50" r="20" fill="none" stroke="url(#gradient1)" strokeWidth="8" className="wrench-head"/>
                <circle cx="130" cy="50" r="8" fill="url(#gradient1)" className="wrench-bolt"/>
              </g>
              
              {/* Gear */}
              <g className="gear-group">
                <circle cx="70" cy="130" r="35" fill="none" stroke="url(#gradient1)" strokeWidth="8"/>
                <circle cx="70" cy="130" r="15" fill="url(#gradient1)"/>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <rect
                    key={i}
                    x="65"
                    y="90"
                    width="10"
                    height="15"
                    fill="url(#gradient1)"
                    transform={`rotate(${angle} 70 130)`}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* Content */}
          <Title level={1} className="maintenance-title">
            Hệ thống đang bảo trì
          </Title>
          
          <Paragraph className="maintenance-subtitle">
            Xin lỗi vì sự bất tiện này. Hệ thống hiện đang gặp sự cố kết nối hoặc đang được bảo trì.
          </Paragraph>

          <Paragraph className="maintenance-message">
            Chúng tôi đang khắc phục vấn đề và sẽ sớm quay lại hoạt động.
          </Paragraph>

          {/* Tips */}
          <div className="tips-container">
            <div className="tip-item">
              <span className="tip-icon">🌐</span>
              <span>Kiểm tra kết nối internet của bạn</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏱️</span>
              <span>Làm mới trang sau vài phút</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔄</span>
              <span>Xóa cache trình duyệt và thử lại</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="button-group">
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              className="btn-retry"
            >
              Thử lại
            </Button>
            <Button
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="btn-home"
            >
              Về trang chủ
            </Button>
          </div>

          {/* Footer */}
          <div className="maintenance-footer">
            <Paragraph className="footer-text">
              Nếu bạn cần hỗ trợ khẩn cấp, vui lòng liên hệ với đội ngũ hỗ trợ kỹ thuật.
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

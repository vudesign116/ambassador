import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const ServerErrorPage = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="full-height" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Result
        status="500"
        title="500"
        subTitle="Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau!"
        extra={[
          <Button 
            type="primary" 
            key="reload"
            icon={<ReloadOutlined />}
            onClick={handleReload}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              marginRight: 8
            }}
          >
            Thử Lại
          </Button>,
          <Button 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
            size="large"
          >
            Về Trang Chủ
          </Button>
        ]}
      />
    </div>
  );
};

export default ServerErrorPage;

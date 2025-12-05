import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="full-height" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
        extra={[
          <Button 
            type="primary" 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Về Trang Chủ
          </Button>
        ]}
      />
    </div>
  );
};

export default NotFoundPage;

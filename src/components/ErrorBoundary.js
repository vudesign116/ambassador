import React from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="Có lỗi xảy ra!"
            subTitle="Xin lỗi, ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại!"
            extra={[
              <Button 
                type="primary" 
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Tải Lại Trang
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

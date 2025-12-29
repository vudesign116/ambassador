import React, { Component } from 'react';
import MaintenancePage from '../pages/MaintenancePage';

/**
 * APIErrorBoundary - Tự động chuyển sang trang bảo trì khi gặp lỗi API
 * 
 * Xử lý các lỗi:
 * - 400 Bad Request
 * - 500 Internal Server Error
 * - Network errors / Connection failures
 * - Timeout errors
 */
class APIErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorDetails: null,
      maintenanceMode: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state để hiển thị fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('APIErrorBoundary caught an error:', error, errorInfo);
    
    // Kiểm tra nếu là lỗi API
    if (this.isAPIError(error)) {
      this.setState({
        maintenanceMode: true,
        errorDetails: {
          message: error.message,
          status: error.status || error.code,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  componentDidMount() {
    // Lắng nghe sự kiện maintenance mode từ window
    window.addEventListener('maintenanceMode', this.handleMaintenanceMode);
    
    // Kiểm tra maintenance mode từ localStorage
    const savedMaintenanceMode = localStorage.getItem('maintenanceMode');
    if (savedMaintenanceMode === 'true') {
      console.log('⚠️ Maintenance mode detected in localStorage');
      const errorDetails = JSON.parse(localStorage.getItem('maintenanceError') || '{}');
      this.setState({
        maintenanceMode: true,
        errorDetails
      });
    } else {
      console.log('✅ No maintenance mode in localStorage');
    }
  }

  componentWillUnmount() {
    window.removeEventListener('maintenanceMode', this.handleMaintenanceMode);
  }

  handleMaintenanceMode = (event) => {
    const { error } = event.detail || {};
    
    this.setState({
      maintenanceMode: true,
      errorDetails: error
    });

    // Lưu vào localStorage
    localStorage.setItem('maintenanceMode', 'true');
    if (error) {
      localStorage.setItem('maintenanceError', JSON.stringify(error));
    }
  };

  isAPIError = (error) => {
    // Kiểm tra các loại lỗi API
    const apiErrorPatterns = [
      /failed to fetch/i,
      /network error/i,
      /timeout/i,
      /400/,
      /500/,
      /502/,
      /503/,
      /504/,
      /bad request/i,
      /internal server error/i,
      /service unavailable/i
    ];

    const errorMessage = error.message || error.toString();
    return apiErrorPatterns.some(pattern => pattern.test(errorMessage));
  };

  handleRetry = () => {
    // Clear maintenance mode
    localStorage.removeItem('maintenanceMode');
    localStorage.removeItem('maintenanceError');
    
    // Reset state
    this.setState({
      hasError: false,
      errorDetails: null,
      maintenanceMode: false
    });

    // Reload trang
    window.location.reload();
  };

  render() {
    if (this.state.maintenanceMode) {
      return (
        <MaintenancePage
          onRetry={this.handleRetry}
          errorDetails={this.state.errorDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default APIErrorBoundary;

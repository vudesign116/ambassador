/**
 * API Monitor Service
 * 
 * Tự động theo dõi và xử lý lỗi API:
 * - 400 Bad Request
 * - 500 Internal Server Error
 * - Network errors
 * - Timeout errors
 * 
 * Khi phát hiện lỗi, tự động trigger maintenance mode
 */

class APIMonitor {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 2; // GIẢM XUỐNG 2 để test dễ hơn (gốc: 3)
    this.errorWindow = 60000; // 1 phút
    this.errors = [];
    this.isMaintenanceMode = false;
    
    // DEBUG MODE: Set to true để trigger ngay khi có lỗi critical
    this.debugMode = process.env.REACT_APP_MAINTENANCE_DEBUG === 'true';
    
    if (this.debugMode) {
      console.warn('⚠️ API Monitor DEBUG MODE ENABLED - Will trigger maintenance on first critical error');
    }
  }

  /**
   * Kiểm tra xem có phải lỗi nghiêm trọng không
   */
  isCriticalError(error) {
    if (!error) return false;

    const status = error.status || error.code;
    const message = error.message || '';

    // Danh sách lỗi nghiêm trọng
    const criticalStatuses = [400, 500, 502, 503, 504];
    const criticalPatterns = [
      /failed to fetch/i,
      /network error/i,
      /timeout/i,
      /bad request/i,
      /internal server error/i,
      /service unavailable/i,
      /gateway timeout/i,
      /connection refused/i,
      /CORS/i
    ];

    // Kiểm tra status code
    if (status && criticalStatuses.includes(parseInt(status))) {
      return true;
    }

    // Kiểm tra message
    return criticalPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Ghi nhận lỗi API
   */
  recordError(error) {
    const now = Date.now();
    
    // Thêm lỗi vào danh sách
    this.errors.push({
      error,
      timestamp: now
    });

    // Lọc bỏ lỗi cũ (ngoài time window)
    this.errors = this.errors.filter(e => now - e.timestamp < this.errorWindow);

    // Đếm số lỗi nghiêm trọng trong window
    const criticalErrors = this.errors.filter(e => this.isCriticalError(e.error));
    
    console.warn(`🔴 API Error recorded: ${criticalErrors.length}/${this.maxErrors}`, error);

    // DEBUG MODE: Trigger ngay nếu có lỗi critical
    if (this.debugMode && this.isCriticalError(error)) {
      console.error('🚨 DEBUG MODE: Triggering maintenance immediately!');
      this.triggerMaintenanceMode(error);
      return;
    }

    // Nếu vượt quá ngưỡng, trigger maintenance mode
    if (criticalErrors.length >= this.maxErrors) {
      this.triggerMaintenanceMode(error);
    }
  }

  /**
   * Kích hoạt maintenance mode
   */
  triggerMaintenanceMode(error) {
    if (this.isMaintenanceMode) return;

    this.isMaintenanceMode = true;
    
    const errorDetails = {
      message: error.message || 'Không thể kết nối đến server',
      status: error.status || error.code,
      timestamp: new Date().toISOString(),
      errorCount: this.errors.length
    };

    console.error('Triggering maintenance mode:', errorDetails);

    // Dispatch event để APIErrorBoundary nhận được
    const event = new CustomEvent('maintenanceMode', {
      detail: { error: errorDetails }
    });
    window.dispatchEvent(event);
  }

  /**
   * Reset error counter
   */
  reset() {
    this.errors = [];
    this.errorCount = 0;
    this.isMaintenanceMode = false;
    localStorage.removeItem('maintenanceMode');
    localStorage.removeItem('maintenanceError');
  }

  /**
   * Kiểm tra xem có đang ở maintenance mode không
   */
  isInMaintenanceMode() {
    return this.isMaintenanceMode || localStorage.getItem('maintenanceMode') === 'true';
  }
}

// Tạo singleton instance
const apiMonitor = new APIMonitor();

/**
 * Wrapper cho fetch API để tự động monitor lỗi
 */
const monitoredFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // Kiểm tra status code
    if (!response.ok) {
      const error = new Error(`HTTP Error ${response.status}`);
      error.status = response.status;
      error.response = response;

      // Ghi nhận lỗi
      apiMonitor.recordError(error);

      throw error;
    }

    return response;
  } catch (error) {
    // Ghi nhận lỗi network/timeout
    if (error.name === 'TypeError' || error.name === 'AbortError') {
      const networkError = new Error('Network error: ' + error.message);
      networkError.originalError = error;
      apiMonitor.recordError(networkError);
    } else {
      apiMonitor.recordError(error);
    }

    throw error;
  }
};

/**
 * Interceptor cho XMLHttpRequest
 */
const setupXHRInterceptor = () => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(...args) {
    this._url = args[1];
    return originalOpen.apply(this, args);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('error', function() {
      const error = new Error(`XHR Error: ${this._url}`);
      error.status = this.status;
      apiMonitor.recordError(error);
    });

    this.addEventListener('load', function() {
      if (this.status >= 400) {
        const error = new Error(`XHR Error ${this.status}: ${this._url}`);
        error.status = this.status;
        apiMonitor.recordError(error);
      }
    });

    return originalSend.apply(this, args);
  };
};

// Tự động setup interceptor khi load
if (typeof window !== 'undefined') {
  setupXHRInterceptor();
  // Expose apiMonitor to window for debugging and manual control
  window.apiMonitor = apiMonitor;
}

export default apiMonitor;
export { monitoredFetch, setupXHRInterceptor };

/**
 * Points Manager - Quản lý điểm tập trung
 * Đồng bộ giữa điểm từ API và điểm kiếm được trên browser
 */

// Thời gian chờ để xem lại document - đọc từ admin config, default 5 phút
const getReviewCooldownMs = () => {
  const configValue = localStorage.getItem('app_review_cooldown');
  if (configValue) {
    const ms = parseInt(configValue);
    console.log('📋 Review cooldown from config:', ms / 1000 / 60, 'minutes');
    return ms;
  }
  console.log('⚠️ No review cooldown config, using default: 5 minutes');
  return 5 * 60 * 1000; // Default 5 phút
};

/**
 * Get storage key với phone number prefix
 * Đảm bảo mỗi user có data riêng biệt
 */
const getStorageKey = (baseKey) => {
  const phoneNumber = localStorage.getItem('phoneNumber');
  if (!phoneNumber) {
    console.warn('No phone number found in localStorage');
    return baseKey; // Fallback to base key
  }
  return `${phoneNumber}_${baseKey}`;
};

// Base keys (sẽ được prefix với phone number)
const BASE_KEYS = {
  EARNED_POINTS: 'earnedPoints', // Danh sách điểm kiếm được trong session
  VIEWED_DOCUMENTS: 'viewedDocuments', // Danh sách document đã xem (với timestamp)
  LAST_SYNC_TIME: 'lastSyncTime', // Thời gian sync lần cuối
  API_TOTAL_POINTS: 'apiTotalPoints', // Tổng điểm từ API
  API_HISTORY: 'apiPointHistory' // Lịch sử điểm từ API
};

/**
 * Lưu điểm từ API vào localStorage
 * @param {number} totalPoints - Tổng điểm
 * @param {Array} history - Lịch sử điểm từ lich_su_diem
 * @param {Array} contentlist - Danh sách tài liệu từ API để map type
 */
export const saveAPIPoints = (totalPoints, history = [], contentlist = []) => {
  // Tạo map document_id -> type từ contentlist
  const documentTypeMap = {};
  if (contentlist && Array.isArray(contentlist)) {
    contentlist.forEach(category => {
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach(doc => {
          documentTypeMap[doc.document_id] = doc.type || 'pdf';
        });
      }
    });
  }
  
  // Enrich history với type từ contentlist
  const enrichedHistory = history.map(item => ({
    ...item,
    type: documentTypeMap[item.document_id] || 'pdf'
  }));
  
  localStorage.setItem(getStorageKey(BASE_KEYS.API_TOTAL_POINTS), totalPoints.toString());
  localStorage.setItem(getStorageKey(BASE_KEYS.API_HISTORY), JSON.stringify(enrichedHistory));
  localStorage.setItem(getStorageKey(BASE_KEYS.LAST_SYNC_TIME), new Date().toISOString());
};

/**
 * Lấy tổng điểm từ API
 */
export const getAPITotalPoints = () => {
  const points = localStorage.getItem(getStorageKey(BASE_KEYS.API_TOTAL_POINTS));
  return points ? parseInt(points, 10) : 0;
};

/**
 * Lấy lịch sử điểm từ API
 */
export const getAPIHistory = () => {
  const history = localStorage.getItem(getStorageKey(BASE_KEYS.API_HISTORY));
  return history ? JSON.parse(history) : [];
};

/**
 * Thêm điểm mới vào session (khi xem tài liệu)
 */
export const addEarnedPoint = (documentData) => {
  const earnedPoints = getEarnedPoints();
  const viewedDocs = getViewedDocuments();
  
  const docId = documentData.document_id.toString();
  
  // Kiểm tra xem document đã được xem chưa và còn trong cooldown không
  const viewedDoc = viewedDocs.find(item => item.id === docId);
  if (viewedDoc) {
    const timeSinceView = Date.now() - new Date(viewedDoc.timestamp).getTime();
    const cooldownMs = getReviewCooldownMs();
    if (timeSinceView < cooldownMs) {
      console.log('Document still in cooldown period, no points added');
      return false;
    }
    // Đã hết cooldown, cho phép xem lại
    console.log('Cooldown period expired, allowing re-view');
  }

  // Thêm hoặc cập nhật timestamp trong danh sách đã xem
  const existingIndex = viewedDocs.findIndex(item => item.id === docId);
  if (existingIndex >= 0) {
    viewedDocs[existingIndex].timestamp = new Date().toISOString();
  } else {
    viewedDocs.push({ id: docId, timestamp: new Date().toISOString() });
  }
  localStorage.setItem(getStorageKey(BASE_KEYS.VIEWED_DOCUMENTS), JSON.stringify(viewedDocs));

  // Thêm điểm mới
  const newPoint = {
    ma_kh_dms: documentData.ma_kh_dms || localStorage.getItem('ma_kh_dms') || '',
    phone: documentData.phone || localStorage.getItem('phoneNumber') || '',
    document_id: documentData.document_id,
    document_name: documentData.document_name,
    inserted_at: new Date().toISOString(),
    point: documentData.point,
    category: documentData.category || '',
    type: documentData.type || 'pdf', // 'pdf' hoặc 'video'
    isNewlyViewed: true // Đánh dấu là mới xem trên thiết bị này
  };

  earnedPoints.push(newPoint);
  localStorage.setItem(getStorageKey(BASE_KEYS.EARNED_POINTS), JSON.stringify(earnedPoints));
  
  // Note: POST to server is handled in DocumentListPage after 60s viewing
  // No auto-sync here to avoid duplicate POST requests
  
  return true;
};

/**
 * Lấy danh sách điểm kiếm được trong session
 */
export const getEarnedPoints = () => {
  const points = localStorage.getItem(getStorageKey(BASE_KEYS.EARNED_POINTS));
  return points ? JSON.parse(points) : [];
};

/**
 * Lấy danh sách document đã xem (với timestamp)
 */
export const getViewedDocuments = () => {
  const docs = localStorage.getItem(getStorageKey(BASE_KEYS.VIEWED_DOCUMENTS));
  if (!docs) return [];
  
  const parsed = JSON.parse(docs);
  
  // Migrate old format (array of strings) to new format (array of objects)
  if (parsed.length > 0 && typeof parsed[0] === 'string') {
    const migrated = parsed.map(id => ({ 
      id, 
      timestamp: new Date().toISOString() 
    }));
    localStorage.setItem(getStorageKey(BASE_KEYS.VIEWED_DOCUMENTS), JSON.stringify(migrated));
    return migrated;
  }
  
  return parsed;
};

/**
 * Đánh dấu documents từ API history là đã xem
 */
export const markAPIHistoryAsViewed = (apiHistory) => {
  const viewedDocs = getViewedDocuments();
  
  apiHistory.forEach(item => {
    const docId = item.document_id?.toString();
    if (docId) {
      const existingIndex = viewedDocs.findIndex(v => v.id === docId);
      if (existingIndex < 0) {
        // API history được coi là đã xem từ lâu (không block)
        viewedDocs.push({ 
          id: docId, 
          timestamp: item.inserted_at || new Date().toISOString() 
        });
      }
    }
  });
  
  localStorage.setItem(getStorageKey(BASE_KEYS.VIEWED_DOCUMENTS), JSON.stringify(viewedDocs));
};

/**
 * Tính tổng điểm (API + Session)
 */
export const getTotalPoints = () => {
  const apiPoints = getAPITotalPoints();
  const earnedPoints = getEarnedPoints();
  const sessionPoints = earnedPoints.reduce((sum, item) => sum + (item.point || 0), 0);
  
  return apiPoints + sessionPoints;
};

/**
 * Lấy tổng lịch sử điểm (API + Session), sắp xếp theo thời gian mới nhất
 */
export const getCombinedHistory = () => {
  const apiHistory = getAPIHistory();
  const earnedPoints = getEarnedPoints();
  
  // API history không có isNewlyViewed và có thể thiếu type
  const apiHistoryWithDefaults = apiHistory.map(item => ({
    ...item,
    type: item.type || 'pdf',
    isNewlyViewed: false // Điểm từ API không phải là mới xem
  }));
  
  // Earned points đã có isNewlyViewed và type từ khi save
  const combined = [...apiHistoryWithDefaults, ...earnedPoints];
  
  // Sắp xếp theo thời gian mới nhất
  combined.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at));
  
  return combined;
};

/**
 * Lấy dữ liệu cần POST về API (điểm mới trong session)
 */
export const getDataForSync = () => {
  const earnedPoints = getEarnedPoints();
  const phoneNumber = localStorage.getItem('phoneNumber');
  
  return {
    phone: phoneNumber,
    earned_points: earnedPoints,
    total_new_points: earnedPoints.reduce((sum, item) => sum + (item.point || 0), 0),
    sync_time: new Date().toISOString()
  };
};

/**
 * Clear điểm session sau khi sync thành công
 */
export const clearSessionPoints = () => {
  localStorage.removeItem(getStorageKey(BASE_KEYS.EARNED_POINTS));
  // Giữ viewedDocuments để không cho xem lại document đã xem
};

/**
 * Reset tất cả dữ liệu điểm của user hiện tại (khi logout)
 */
export const resetAllPoints = () => {
  const phoneNumber = localStorage.getItem('phoneNumber');
  if (!phoneNumber) return;
  
  Object.values(BASE_KEYS).forEach(baseKey => {
    localStorage.removeItem(getStorageKey(baseKey));
  });
};

/**
 * Kiểm tra document đã được xem chưa và còn trong cooldown không
 * @returns {Object} { viewed: boolean, canReview: boolean, remainingTime: number }
 */
export const isDocumentViewed = (documentId) => {
  const viewedDocs = getViewedDocuments();
  const docId = documentId.toString();
  const viewedDoc = viewedDocs.find(item => item.id === docId);
  
  if (!viewedDoc) {
    return { viewed: false, canReview: true, remainingTime: 0 };
  }
  
  const cooldownMs = getReviewCooldownMs();
  const timeSinceView = Date.now() - new Date(viewedDoc.timestamp).getTime();
  const canReview = timeSinceView >= cooldownMs;
  const remainingTime = canReview ? 0 : Math.ceil((cooldownMs - timeSinceView) / 1000 / 60); // minutes
  
  return { 
    viewed: true, 
    canReview, 
    remainingTime,
    lastViewTime: viewedDoc.timestamp
  };
};

/**
 * Lấy thời gian sync lần cuối
 */
export const getLastSyncTime = () => {
  const time = localStorage.getItem(getStorageKey(BASE_KEYS.LAST_SYNC_TIME));
  return time ? new Date(time) : null;
};

/**
 * POST lịch sử điểm lên server để tổng hợp (nếu có cấu hình API)
 * @param {Object} pointData - Dữ liệu điểm cần đồng bộ
 */
export const syncPointToServer = async (pointData) => {
  const syncApiEndpoint = localStorage.getItem('app_sync_point_api_endpoint');
  
  // Nếu không có API endpoint, bỏ qua việc sync
  if (!syncApiEndpoint) {
    console.log('No sync API endpoint configured, skipping sync');
    return { success: true, skipped: true };
  }
  
  // Validate required data
  if (!pointData.ma_kh_dms || !pointData.phone || !pointData.document_id) {
    console.warn('Missing required data for sync:', pointData);
    return { success: false, error: 'Missing required data' };
  }
  
  try {
    // Create Vietnam timestamp without 'Z' suffix
    // toISOString() returns UTC, so we add 7 hours offset to get VN time
    const now = new Date(pointData.inserted_at || new Date());
    const vnOffset = 7 * 60 * 60 * 1000; // UTC+7
    const inserted_at = new Date(now.getTime() + vnOffset).toISOString().replace('Z', '');
    
    // Prepare payload as array format (API requirement)
    const payload = [
      {
        ma_kh_dms: pointData.ma_kh_dms,
        phone: pointData.phone,
        document_id: pointData.document_id,
        inserted_at: inserted_at
      }
    ];
    
    // POST without Bearer token (API doesn't require authentication)
    const response = await fetch(syncApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error('Failed to sync point to server:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const result = await response.json();
    console.log('Successfully synced point to server:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error syncing point to server:', error);
    return { success: false, error: error.message };
  }
};

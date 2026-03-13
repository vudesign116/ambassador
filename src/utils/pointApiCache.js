/**
 * pointApiCache.js
 * Cache API response vào sessionStorage để tránh gọi lại API nặng (3MB+)
 * khi user điều hướng giữa Dashboard và PointHistory trong cùng 1 session.
 *
 * Chiến lược tối ưu:
 * 1. Lần đầu: fetch API → lưu vào sessionStorage (raw JSON string)
 * 2. Lần sau: đọc thẳng từ sessionStorage (instant, không tốn mạng)
 * 3. TTL: 5 phút — sau đó tự động fetch lại
 * 4. Truncate lich_su_diem cho Dashboard: chỉ giữ records tháng hiện tại
 */

const CACHE_KEY_PREFIX = 'nvbc_point_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

/**
 * Lấy cache key theo phone
 */
const getCacheKey = (phone) => `${CACHE_KEY_PREFIX}${phone}`;

/**
 * Đọc data từ cache (sessionStorage)
 * Trả về null nếu không có hoặc đã hết TTL
 */
export const getFromCache = (phone) => {
  try {
    const raw = sessionStorage.getItem(getCacheKey(phone));
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL_MS;
    if (isExpired) {
      sessionStorage.removeItem(getCacheKey(phone));
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
};

/**
 * Lưu data vào cache (sessionStorage)
 * Thay vì lưu toàn bộ lich_su_diem (13,000+ records),
 * chỉ lưu phần đã filter theo tháng và quý hiện tại.
 */
export const saveToCache = (phone, data) => {
  try {
    // Filter trước khi lưu cache — tránh sessionStorage overflow và đảm bảo đúng dữ liệu
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3);

    const lichSuDiem = Array.isArray(data.lich_su_diem) ? data.lich_su_diem : [];

    // Chỉ lưu records tháng hiện tại (dùng cho Dashboard)
    const currentMonthRecords = lichSuDiem.filter(item => {
      if (!item.inserted_at) return false;
      const d = new Date(item.inserted_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Chỉ lưu records quý hiện tại (dùng cho PointHistory)
    const currentQuarterRecords = lichSuDiem.filter(item => {
      if (!item.inserted_at) return false;
      const d = new Date(item.inserted_at);
      return d.getFullYear() === currentYear && Math.floor(d.getMonth() / 3) === currentQuarter;
    });

    const optimizedData = {
      ...data,
      lich_su_diem: currentQuarterRecords,        // quý hiện tại — đủ cho cả 2 trang
      _lich_su_diem_month: currentMonthRecords,    // tháng hiện tại — đã filter sẵn
      _lich_su_diem_quarter: currentQuarterRecords // quý hiện tại — đã filter sẵn
    };

    sessionStorage.setItem(getCacheKey(phone), JSON.stringify({
      timestamp: Date.now(),
      data: optimizedData
    }));

    console.log(`[pointApiCache] 💾 Cached: ${currentMonthRecords.length} month records, ${currentQuarterRecords.length} quarter records`);
  } catch (e) {
    // sessionStorage full → bỏ qua, không cache
    console.warn('[pointApiCache] Cannot save to sessionStorage:', e.message);
  }
};

/**
 * Xoá cache của 1 user (dùng khi logout)
 */
export const clearCache = (phone) => {
  if (phone) {
    sessionStorage.removeItem(getCacheKey(phone));
  }
};

/**
 * Fetch API với cache.
 * - Nếu có cache còn hiệu lực → trả về ngay, không gọi API
 * - Nếu không có → fetch, lưu cache rồi trả về
 *
 * @param {string} phone - Số điện thoại user
 * @param {boolean} forceRefresh - Bỏ qua cache, luôn fetch mới
 * @returns {Promise<object>} data từ API
 */
export const fetchPointDataWithCache = async (phone, forceRefresh = false) => {
  // 1. Thử đọc từ cache trước
  if (!forceRefresh) {
    const cached = getFromCache(phone);
    if (cached) {
      console.log('[pointApiCache] ✅ Cache hit - skipping API call');
      return cached;
    }
  }

  // 2. Không có cache → fetch API
  console.log('[pointApiCache] 🌐 Cache miss - fetching from API...');
  const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local'}/get_data/get_nvbc_point/?phone=${phone}&test=0`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  // 3. Lưu cache
  saveToCache(phone, data);

  return data;
};

/**
 * Trả về chỉ lich_su_diem của tháng hiện tại (dùng cho Dashboard)
 * Nếu data có sẵn _lich_su_diem_month (từ cache đã filter) → dùng luôn
 */
export const filterCurrentMonthHistory = (lichSuDiem, data = null) => {
  // Nếu data có sẵn pre-filtered từ cache → dùng luôn, không filter lại
  if (data && Array.isArray(data._lich_su_diem_month)) {
    return data._lich_su_diem_month;
  }
  if (!Array.isArray(lichSuDiem)) return [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return lichSuDiem.filter(item => {
    if (!item.inserted_at) return false;
    const d = new Date(item.inserted_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
};

/**
 * Trả về chỉ lich_su_diem của quý hiện tại (dùng cho PointHistory)
 * Nếu data có sẵn _lich_su_diem_quarter (từ cache đã filter) → dùng luôn
 */
export const filterCurrentQuarterHistory = (lichSuDiem, data = null) => {
  // Nếu data có sẵn pre-filtered từ cache → dùng luôn, không filter lại
  if (data && Array.isArray(data._lich_su_diem_quarter)) {
    return data._lich_su_diem_quarter;
  }
  if (!Array.isArray(lichSuDiem)) return [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3);

  return lichSuDiem.filter(item => {
    if (!item.inserted_at) return false;
    const d = new Date(item.inserted_at);
    const quarter = Math.floor(d.getMonth() / 3);
    return d.getFullYear() === currentYear && quarter === currentQuarter;
  });
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Spin, Typography, Space, Tag, Statistic, Empty, Alert, Row, Col } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, FireOutlined, GiftOutlined, PlayCircleOutlined, RocketOutlined } from '@ant-design/icons';
import * as PointsManager from '../utils/pointsManager';
import { fetchPointDataWithCache, filterCurrentQuarterHistory } from '../utils/pointApiCache';
import videoFileIcon from '../images/video-file.png';
import pdfFileIcon from '../images/pdf-file.png';

const { Title, Text } = Typography;

const PointHistoryPage = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralPoints, setReferralPoints] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);
  const [videoPoints, setVideoPoints] = useState(0);
  const [miniGamePoints, setMiniGamePoints] = useState(0);
  const [visibleCount, setVisibleCount] = useState(50); // Chỉ render 50 dòng đầu

  const PAGE_SIZE = 50; // Số dòng hiển thị mỗi lần
  
  // Calculate current quarter (1-4)
  const getCurrentQuarter = () => {
    const month = new Date().getMonth(); // 0-11
    return Math.floor(month / 3) + 1; // 1-4
  };
  const currentQuarter = getCurrentQuarter();

  // Sample data for demo - will be replaced by API call
  const sampleHistory = [
    {
      ma_kh_dms: "001458",
      phone: "0989548952",
      document_id: "1",
      inserted_at: "2025-10-13T09:15:22.159000",
      document_name: "Thông tin sản phẩm MerapLion",
      point: 5
    },
    {
      ma_kh_dms: "001458", 
      phone: "0989548952",
      document_id: "2",
      inserted_at: "2025-10-13T08:45:10.159000",
      document_name: "Video giới thiệu công ty",
      point: 8
    },
    {
      ma_kh_dms: "001458",
      phone: "0989548952", 
      document_id: "3",
      inserted_at: "2025-10-12T16:30:45.159000",
      document_name: "Kiến thức y khoa cơ bản",
      point: 7
    },
    {
      ma_kh_dms: "001458",
      phone: "0989548952",
      document_id: "4", 
      inserted_at: "2025-10-12T14:20:15.159000",
      document_name: "Hướng dẫn tư vấn khách hàng",
      point: 6
    }
  ];

  useEffect(() => {
    loadPointHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateCategoryStats = (data) => {
    // Category mapping
    const categoryMap = {
      'THÔNG TIN VỀ MERAPLION': 'MerapLion',
      'THÔNG TIN SẢN PHẦM': 'Sản phẩm',
      'THÔNG TIN BỆNH HỌC': 'Bệnh học',
      'SỔ TAY NGƯỜI THẦY THUỐC': 'Sổ tay thầy thuốc',
      'TƯ VẤN CÙNG CHUYÊN GIA': 'Tư vấn chuyên gia',
      'MINI_GAME': 'Mini Game'
    };

    const categoryPoints = {};
    const categoryMaxPoints = {};

    // Initialize all categories with 0 points
    Object.values(categoryMap).forEach(cat => {
      categoryPoints[cat] = 0;
      categoryMaxPoints[cat] = 1;
    });

    // Create document to category mapping
    const documentCategoryMap = {};
    if (data.contentlist && Array.isArray(data.contentlist)) {
      data.contentlist.forEach(item => {
        if (item.document_id && item.document_category) {
          documentCategoryMap[item.document_id] = item.document_category;
          // Track max points per category
          const categoryName = categoryMap[item.document_category];
          if (categoryName) {
            categoryMaxPoints[categoryName] = (categoryMaxPoints[categoryName] || 0) + (item.point || 0);
          }
        }
      });
    }

    // Count points from API history (use effective_point from new API)
    // 🚀 data._quarterHistory đã filter sẵn
    const filteredHistory = data._quarterHistory || (data.lich_su_diem || []);
    filteredHistory.forEach(item => {
        const category = documentCategoryMap[item.document_id];
        if (category) {
          const categoryName = categoryMap[category];
          if (categoryName) {
            // Use effective_point from new API structure
            const points = item.effective_point || item.point || 0;
            categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + points;
          }
        }
    });

    // Also count points from session
    const earnedPoints = PointsManager.getEarnedPoints();
    earnedPoints.forEach(item => {
      if (item.category) {
        const categoryName = categoryMap[item.category];
        if (categoryName) {
          categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + (item.point || 0);
        }
      } else if (item.document_id) {
        const category = documentCategoryMap[item.document_id];
        if (category) {
          const categoryName = categoryMap[category];
          if (categoryName) {
            categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + (item.point || 0);
          }
        }
      }
    });

    // Convert to array format for RadarChart
    const stats = Object.keys(categoryPoints).map(name => ({
      name,
      value: categoryPoints[name],
      maxPoints: categoryMaxPoints[name] || 1
    }));

    // Ensure all categories appear
    const allCategories = Object.values(categoryMap);
    allCategories.forEach(categoryName => {
      if (!stats.find(s => s.name === categoryName)) {
        stats.push({
          name: categoryName,
          value: 0,
          maxPoints: categoryMaxPoints[categoryName] || 1
        });
      }
    });

    setCategoryStats(stats);
  };

  const loadPointHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if user is logged in
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) {
        setError('Vui lòng đăng nhập để xem lịch sử điểm');
        setLoading(false);
        return;
      }

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Vui lòng đăng nhập lại để xem lịch sử điểm');
        setLoading(false);
        return;
      }

      // Helper function to check if date is in current quarter
      const currentYear = new Date().getFullYear();
      const currentQuarterNum = currentQuarter; // 1-4
      const isCurrentQuarter = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const quarter = Math.floor(month / 3) + 1; // 1-4
        return year === currentYear && quarter === currentQuarterNum;
      };

      // ✅ Dùng cache helper: nếu Dashboard đã fetch rồi thì đọc thẳng từ cache
      // Tránh gọi lại API 3MB+ mỗi lần vào trang PointHistory
      const data = await fetchPointDataWithCache(phoneNumber);

      if (!data) {
        throw new Error('Failed to fetch point history');
      }

      // 🚀 Tối ưu: filter quý hiện tại trước, không iterate toàn bộ 13,000 records
      // Truyền data để dùng _lich_su_diem_quarter đã filter sẵn từ cache nếu có
      const currentQuarterHistory = filterCurrentQuarterHistory(data.lich_su_diem, data);
      
      // Save API data to manager (with contentlist to map type)
      if (data && typeof data.point === 'number') {
        // 🚀 Chỉ truyền quý hiện tại vào PointsManager
        const contentlist = data.contentlist || [];
        PointsManager.saveAPIPoints(data.point, currentQuarterHistory, contentlist);
        PointsManager.markAPIHistoryAsViewed(currentQuarterHistory);
      }

      // ✅ Build history từ currentQuarterHistory (đã filter sẵn, không iterate 13,000 records)
      const history = currentQuarterHistory.map(item => ({
        ...item,
        type: item.type || 'video',
        document_name: item.document_name || 'Tài liệu'
      }));

      // Calculate video & document points (quarterly only)
      // 🚀 currentQuarterHistory đã filter sẵn — không cần isCurrentQuarter() nữa
      let quarterlyVideoPoints = 0;
      currentQuarterHistory.forEach(item => {
        quarterlyVideoPoints += (item.effective_point || item.point || 0);
      });
      setVideoPoints(quarterlyVideoPoints);

      // TODO: Mini game points from API when available
      setMiniGamePoints(0);

      // Add Streak bonus history - quarterly only
      const streakHistory = [];
      let quarterlyStreakBonus = 0;
      
      // ✅ Check if API returns lich_su_diem_streak array
      if (data.lich_su_diem_streak && Array.isArray(data.lich_su_diem_streak)) {
        data.lich_su_diem_streak.forEach(item => {
          const points = parseFloat(item.effective_point || item.point || item.bonus_point || 0);
          // Use streak_date from API (format: "2025-12-28" without time)
          const streakDate = item.streak_date || item.inserted_at || new Date().toISOString();
          
          if (points > 0) {
            if (isCurrentQuarter(streakDate)) {
              quarterlyStreakBonus += points;
            }
            streakHistory.push({
              document_id: 'streak_' + streakDate,
              document_name: 'Điểm Duy trì (Streak)',
              inserted_at: streakDate,  // Use date as-is from API
              effective_point: points,
              point: points,
              type: 'streak',
              streak_length: item.streak_length
            });
          }
        });
      }
      // Fallback to old streak_last_7_days array
      else if (data.streak_last_7_days && Array.isArray(data.streak_last_7_days)) {
        data.streak_last_7_days.forEach(day => {
          if (day.bonus_point > 0) {
            quarterlyStreakBonus += day.bonus_point; // Assume last 7 days are in current quarter
            streakHistory.push({
              document_id: 'streak_' + day.date,
              document_name: 'Điểm Duy trì (Streak)',
              inserted_at: day.date + 'T23:59:59',
              effective_point: day.bonus_point,
              point: day.bonus_point,
              type: 'streak',
              streak_length: day.streak_length
            });
          }
        });
      }
      setStreakBonus(quarterlyStreakBonus);

      // Add Referral history - quarterly only
      const referralHistory = [];
      let quarterlyReferral = 0;
      
      // ✅ Check if API returns lich_su_diem_referral array
      if (data.lich_su_diem_referral && Array.isArray(data.lich_su_diem_referral)) {
        console.log('[REFERRAL] Found lich_su_diem_referral:', data.lich_su_diem_referral);
        data.lich_su_diem_referral.forEach(item => {
          const referralDate = item.bonus_at || item.inserted_at || new Date().toISOString();
          const points = parseFloat(item.bonus_point || item.effective_point || item.point || 0);
          
          console.log('[REFERRAL] Item:', item, 'Points:', points);
          
          if (isCurrentQuarter(referralDate)) {
            quarterlyReferral += points;
          }
          
          referralHistory.push({
            document_id: 'referral_' + (item.invitee_phone || 'unknown'),
            document_name: 'Điểm Giới thiệu',
            inserted_at: referralDate,
            effective_point: points,
            point: points,
            type: 'referral'
          });
        });
        console.log('[REFERRAL] Quarterly:', quarterlyReferral, 'History:', referralHistory);
      } 
      // Fallback to old single referral_point field
      else if (data.referral_point && data.referral_point > 0) {
        quarterlyReferral = data.referral_point; // Assume it's in current quarter
        // Get referral date from referral_month_regis if available
        const referralDate = data.referral_month_regis || new Date().toISOString();
        referralHistory.push({
          document_id: 'referral',
          document_name: 'Điểm Giới thiệu',
          inserted_at: referralDate,
          effective_point: data.referral_point,
          point: data.referral_point,
          type: 'referral'
        });
      }
      setReferralPoints(quarterlyReferral);

      // Combine all history and sort by date (newest first)
      const combinedHistory = [...history, ...streakHistory, ...referralHistory].sort((a, b) => {
        return new Date(b.inserted_at) - new Date(a.inserted_at);
      });

      setHistoryData(combinedHistory);

      // Calculate category stats for RadarChart
      // Attach _quarterHistory để calculateCategoryStats dùng lại
      data._quarterHistory = currentQuarterHistory;
      calculateCategoryStats(data);
    } catch (err) {
      console.error('Error loading point history:', err);
      // Hiển thị lỗi thực từ API/network để dễ debug
      const errDetail = err?.message || String(err) || 'Unknown error';
      setError(`Không thể tải lịch sử điểm. Lỗi: ${errDetail}`);
      
      // Fallback: Get combined history or sample data
      const history = PointsManager.getCombinedHistory();
      if (history.length > 0) {
        setHistoryData(history);
      } else {
        setHistoryData(sampleHistory);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatWatchDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0 giây';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} giây`;
    } else if (remainingSeconds === 0) {
      return `${minutes} phút`;
    } else {
      return `${minutes}p ${remainingSeconds}s`;
    }
  };

  const getTotalPoints = () => {
    // streak NAM NGOAI lich_su_diem (tach rieng) => PHAI cong vao tong
    // videoPoints = lich_su_diem (chua co streak)
    // streakBonus = lich_su_diem_streak (rieng)
    // referralPoints = lich_su_diem_referral (rieng)
    return videoPoints + streakBonus + referralPoints + miniGamePoints;
  };

  if (loading) {
    return (
      <div className="full-height point-history-page-bg" style={{ paddingBottom: '80px' }}>
        <div className="common-header" style={{ backgroundColor: '#00a99d', color: 'white', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ color: 'white' }} />
          <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>Lịch sử điểm</Title>
          <div style={{ width: '40px' }} />
        </div>
        <div className="container" style={{ paddingTop: 24 }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                Đang tải lịch sử điểm...
              </Text>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-height point-history-page-bg" style={{ paddingBottom: '80px' }}>
        <div className="common-header" style={{ backgroundColor: '#00a99d', color: 'white', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ color: 'white' }} />
          <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>Lịch sử điểm</Title>
          <div style={{ width: '40px' }} />
        </div>
        <div className="container" style={{ paddingTop: 24 }}>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={loadPointHistory}>
                Thử lại
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="full-height point-history-page-bg" style={{ paddingBottom: '80px' }}>
      <div className="common-header" style={{ backgroundColor: '#00a99d', color: 'white', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ color: 'white' }} />
        <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>Lịch sử điểm</Title>
        <div style={{ width: '40px' }} />
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* Total Points Summary */}
        <Card style={{ textAlign: 'center', marginBottom: 20 }}>
          <Space direction="vertical" size="small">
            <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
            <Text strong style={{ fontSize: 14, color: '#000000', textTransform: 'uppercase' }}>
              Tổng điểm tích lũy quý {currentQuarter}/{new Date().getFullYear()}
            </Text>
            <Statistic 
              value={getTotalPoints()} 
              valueStyle={{ color: '#3f8600', fontSize: 36, fontWeight: 'bold' }}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Từ {historyData.length} lượt xem tài liệu + duy trì + giới thiệu + mini game
            </Text>
          </Space>
        </Card>

        {/* Radar Chart - Category Stats */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <PlayCircleOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm xem video & tài liệu</Text>
                <Statistic 
                  value={videoPoints} 
                  valueStyle={{ color: '#1890ff', fontSize: 24, fontWeight: 'bold' }}
                  suffix="đ"
                />
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <FireOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm duy trì</Text>
                <Statistic 
                  value={streakBonus} 
                  valueStyle={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}
                  suffix="đ"
                />
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <GiftOutlined style={{ fontSize: 28, color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm giới thiệu</Text>
                <Statistic 
                  value={referralPoints} 
                  valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 'bold' }}
                  suffix="đ"
                />
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <RocketOutlined style={{ fontSize: 28, color: '#faad14' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm mini game</Text>
                <Statistic 
                  value={miniGamePoints} 
                  valueStyle={{ color: '#faad14', fontSize: 24, fontWeight: 'bold' }}
                  suffix="đ"
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* History List */}
        <Card title={
          <Space>
            <span>Lịch sử chi tiết</span>
            {historyData.length > 0 && (
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                (Hiển thị {Math.min(visibleCount, historyData.length)}/{historyData.length} giao dịch)
              </Text>
            )}
          </Space>
        }>
          {historyData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical">
                  <Text>Chưa có lịch sử điểm</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Hãy xem tài liệu để bắt đầu tích điểm
                  </Text>
                </Space>
              }
            />
          ) : (
            <>
              <List
                dataSource={historyData.slice(0, visibleCount)}
                renderItem={(item) => (
                  <List.Item
                    extra={
                      <Text strong style={{ color: '#3f8600', fontSize: 16 }}>
                        +{item.effective_point || item.point || 0}
                      </Text>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        item.type === 'streak' ? (
                          <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                        ) : item.type === 'referral' ? (
                          <GiftOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                        ) : item.type === 'video' ? (
                          <img src={videoFileIcon} alt="Video" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        ) : (
                          <img src={pdfFileIcon} alt="PDF" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        )
                      }
                      title={
                        <Space size={8}>
                          <Text strong style={{ color: '#333' }}>
                            {item.document_name}
                          </Text>
                          {(item.type === 'streak' || item.type === 'referral') && (
                            <Tag className="new-label-blink">
                              NEW
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space size="small" direction="vertical" style={{ width: '100%' }}>
                          <Space size="small">
                            {item.type === 'streak' ? (
                              <Tag color="red" icon={<FireOutlined />}>
                                STREAK {item.streak_length || 0} NGÀY
                              </Tag>
                            ) : item.type === 'referral' ? (
                              <Tag color="green" icon={<GiftOutlined />}>
                                GIỚI THIỆU
                              </Tag>
                            ) : (
                              <Tag color={item.type === 'video' ? 'blue' : 'orange'}>
                                {item.type === 'video' ? 'VIDEO' : 'PDF'}
                              </Tag>
                            )}
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDate(item.inserted_at)}
                            </Text>
                          </Space>
                          {item.watch_duration_seconds && (
                            <Tag color="green" icon={<TrophyOutlined />}>
                              Xem: {formatWatchDuration(item.watch_duration_seconds)}
                            </Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />

              {/* Footer: xem thêm hoặc thông báo đã hết */}
              {visibleCount < historyData.length ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Button
                    type="default"
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                    style={{ marginBottom: 8 }}
                  >
                    Xem thêm {Math.min(PAGE_SIZE, historyData.length - visibleCount)} giao dịch
                  </Button>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Còn {historyData.length - visibleCount} giao dịch chưa hiển thị
                  </Text>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ✅ Đã hiển thị tất cả {historyData.length} giao dịch trong quý này
                  </Text>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PointHistoryPage;
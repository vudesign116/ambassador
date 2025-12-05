import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Spin, Typography, Space, Tag, Statistic, Empty, Alert } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
import * as PointsManager from '../utils/pointsManager';
import RadarChart from '../components/RadarChart';
import videoFileIcon from '../images/video-file.png';
import pdfFileIcon from '../images/pdf-file.png';

const { Title, Text } = Typography;

const PointHistoryPage = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    // Count points from API history
    if (data.lich_su_diem && Array.isArray(data.lich_su_diem)) {
      data.lich_su_diem.forEach(item => {
        const category = documentCategoryMap[item.document_id];
        if (category) {
          const categoryName = categoryMap[category];
          if (categoryName) {
            categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + (item.point || 0);
          }
        }
      });
    }

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

      // Call API to get point history
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local'}/nvbc_get_point/?phone=${phoneNumber}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch point history');
      }

      const data = await response.json();
      
      // Save API data to manager (with contentlist to map type)
      if (data && typeof data.point === 'number') {
        const apiHistory = data.lich_su_diem || [];
        const contentlist = data.contentlist || [];
        PointsManager.saveAPIPoints(data.point, apiHistory, contentlist);
        PointsManager.markAPIHistoryAsViewed(apiHistory);
      }

      // Get combined history (API + Session)
      const history = PointsManager.getCombinedHistory();

      setHistoryData(history);

      // Calculate category stats for RadarChart
      calculateCategoryStats(data);
    } catch (err) {
      console.error('Error loading point history:', err);
      setError('Không thể tải lịch sử điểm. Vui lòng thử lại sau.');
      
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

  const getTotalPoints = () => {
    // Use PointsManager to get accurate total
    return PointsManager.getTotalPoints();
  };

  if (loading) {
    return (
      <div className="full-height point-history-page-bg" style={{ paddingBottom: '80px' }}>
        <div className="common-header">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ color: 'white' }} />
          <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>Lịch sử điểm</Title>
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
        <div className="common-header">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ color: 'white' }} />
          <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>Lịch sử điểm</Title>
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
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* Total Points Summary */}
        <Card style={{ textAlign: 'center', marginBottom: 20 }}>
          <Space direction="vertical" size="small">
            <TrophyOutlined style={{ fontSize: 32, color: '#faad14' }} />
            <Text type="secondary">Tổng điểm tích lũy</Text>
            <Statistic 
              value={getTotalPoints()} 
              valueStyle={{ color: '#3f8600', fontSize: 36 }}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Từ {historyData.length} lượt xem tài liệu
            </Text>
          </Space>
        </Card>

        {/* Radar Chart - Category Stats */}
        {categoryStats.length > 0 && (
          <Card 
            style={{ marginBottom: 20 }}
            bodyStyle={{ padding: '20px 10px' }}
          >
            <RadarChart userScore={getTotalPoints()} categoryStats={categoryStats} />
          </Card>
        )}

        {/* History List */}
        <Card title="Lịch sử chi tiết">
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
            <List
              dataSource={historyData}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Text strong style={{ color: '#3f8600', fontSize: 16 }}>
                      +{item.point}
                    </Text>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      item.type === 'video' ? (
                        <img src={videoFileIcon} alt="Video" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                      ) : (
                        <img src={pdfFileIcon} alt="PDF" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                      )
                    }
                    title={
                      <Text strong style={{ color: '#333' }}>
                        {item.document_name}
                      </Text>
                    }
                    description={
                      <Space size="small">
                        <Tag color={item.type === 'video' ? 'blue' : 'orange'}>
                          {item.type === 'video' ? 'VIDEO' : 'PDF'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(item.inserted_at)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PointHistoryPage;
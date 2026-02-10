import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Spin, Typography, Space, Tag, Divider, message, Alert } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, StarOutlined, FireOutlined, TeamOutlined } from '@ant-design/icons';
import ambassadorLogo from '../images/MAmbassador-logo.png';

const { Title, Text } = Typography;

// API Version for cache busting
const API_VERSION = process.env.REACT_APP_API_VERSION || 'ambassador.2026.01.01';

const RewardWinnersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [winnersData, setWinnersData] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRewardWinners();
  }, []);

  const loadRewardWinners = async () => {
    setLoading(true);
    setError(null);
    try {
      const rewardEvent = '01_26_th_monthly_reward';
      console.log('🔄 [RewardWinners] Fetching data for event:', rewardEvent);
      console.log('🔄 [RewardWinners] API Version:', API_VERSION);
      
      const url = `https://bi.meraplion.com/local/get_data/get_reward_event/?reward_event=${rewardEvent}&test=0&v=${API_VERSION}`;
      console.log('🔄 [RewardWinners] URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 [RewardWinners] Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [RewardWinners] Loaded data:', data);
      console.log('✅ [RewardWinners] Number of winners:', data.list_winners?.length || 0);

      if (data.status === 'ok') {
        // ✅ FIX: API trả về "list_winners" chứ không phải "rows_data"
        setWinnersData(data.list_winners || []);
        setEventInfo(data.meta_info || {});
      } else {
        throw new Error(data.message || 'API returned non-ok status');
      }
    } catch (error) {
      console.error('❌ [RewardWinners] Error:', error);
      console.error('❌ [RewardWinners] Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      setError(error.message);
      message.error('Không thể tải danh sách. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FF6B35'; // Vibrant Orange-Red cho Top 1
    if (rank === 2) return '#5B8DEE'; // Vibrant Blue cho Top 2
    if (rank === 3) return '#8B4513'; // Màu nâu (SaddleBrown) cho Top 3
    if (rank <= 10) return '#1890ff'; // Blue for top 10
    return '#52c41a'; // Green for others
  };

  const formatPoints = (points) => {
    return points.toLocaleString('vi-VN');
  };

  const formatPeriod = () => {
    if (eventInfo.filter_from && eventInfo.filter_to) {
      // Parse dates: "2026-01-01" → "01/01/2026"
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      
      const fromDate = formatDate(eventInfo.filter_from);
      const toDate = formatDate(eventInfo.filter_to);
      
      // Extract month/year for display: "Tháng 01/2026"
      const [year, month] = eventInfo.filter_from.split('-');
      return { month, year, fromDate, toDate };
    }
    return { month: '01', year: '2026', fromDate: '', toDate: '' };
  };

  return (
    <div className="full-height" style={{ paddingBottom: '80px', background: '#f5f5f5' }}>
      {/* Header */}
      <div className="header-gradient" style={{ borderRadius: '0 0 24px 24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{
              color: 'white',
              fontSize: '20px',
              padding: '4px 8px'
            }}
          />
        </div>
        
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Title level={3} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
            <TeamOutlined /> Danh Sách Nhận Thưởng
          </Title>
          {(() => {
            const period = formatPeriod();
            return (
              <div style={{ fontSize: '14px' }}>
                <Text strong style={{ color: 'white', fontSize: '15px' }}>
                  Tháng {period.month}/{period.year}
                </Text>
                {period.fromDate && period.toDate && (
                  <div style={{ marginTop: '2px' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                      ({period.fromDate} - {period.toDate})
                    </Text>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="container">
        {/* Error Alert */}
        {error && (
          <Alert
            message="Lỗi tải dữ liệu"
            description={
              <div>
                <p>{error}</p>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={loadRewardWinners}
                  style={{ marginTop: '8px' }}
                >
                  Thử lại
                </Button>
              </div>
            }
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16, borderRadius: '8px' }}
          />
        )}

        {/* Event Info Card */}
        {eventInfo.event && winnersData.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 16,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white'
            }}
            bodyStyle={{ padding: '16px', textAlign: 'center' }}
          >
            <Text strong style={{ color: 'white', fontSize: '16px', display: 'block' }}>
              <FireOutlined /> Top {Math.min(winnersData.length, 100)}: Thành viên tích cực tháng
            </Text>
          </Card>
        )}

        {/* Winners List */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <Spin size="large" />
            <Text style={{ color: '#666', fontSize: '14px' }}>
              Đang tải danh sách...
            </Text>
          </div>
        ) : (
          <Card 
            title={
              <Space>
                <StarOutlined style={{ color: '#faad14' }} />
                <Text strong>Bảng Xếp Hạng ({winnersData.length} người)</Text>
              </Space>
            }
            style={{ borderRadius: '12px' }}
          >
            <List
              dataSource={winnersData}
              renderItem={(item) => (
                <List.Item
                  key={item.phone || item.sdt}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {/* Rank Badge */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${getRankColor(item.rank_theo_diem)} 0%, ${getRankColor(item.rank_theo_diem)}dd 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          {getRankIcon(item.rank_theo_diem) || item.rank_theo_diem}
                        </div>

                        {/* Name & Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ 
                            fontSize: '15px', 
                            display: 'block',
                            color: item.rank_theo_diem <= 3 ? getRankColor(item.rank_theo_diem) : '#262626'
                          }}>
                            {item.ten_duoc_si || 'N/A'}
                          </Text>
                          <Space size={4} wrap style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                               {item.ten_tinh || 'N/A'}
                            </Text>
                          </Space>
                        </div>
                      </div>

                      {/* Points */}
                      <div style={{ 
                        textAlign: 'right',
                        paddingLeft: '12px',
                        borderLeft: '2px solid #f0f0f0',
                        minWidth: '80px'
                      }}>
                        <Text strong style={{ 
                          fontSize: '16px',
                          color: getRankColor(item.rank_theo_diem),
                          display: 'block'
                        }}>
                          {formatPoints(item.tong_diem_tich_luy)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          điểm
                        </Text>
                      </div>
                    </div>

                    {/* Top 3 highlight */}
                    {item.rank_theo_diem <= 3 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: `linear-gradient(90deg, ${getRankColor(item.rank_theo_diem)}15 0%, transparent 100%)`,
                        borderLeft: `3px solid ${getRankColor(item.rank_theo_diem)}`,
                        borderRadius: '4px'
                      }}>
                        <Text style={{ fontSize: '11px', color: getRankColor(item.rank_theo_diem), fontWeight: 'bold' }}>
                          ⭐ TOP {item.rank_theo_diem} - Xuất sắc nhất!
                        </Text>
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <TrophyOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Text type="secondary">Chưa có dữ liệu</Text>
                  </div>
                )
              }}
            />
          </Card>
        )}
      </div>

      {/* Back to Dashboard Button */}
      <Button
        type="primary"
        size="large"
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: 48,
          fontWeight: 'bold',
          zIndex: 1000
        }}
      >
        <ArrowLeftOutlined /> Quay lại Dashboard
      </Button>
    </div>
  );
};

export default RewardWinnersPage;

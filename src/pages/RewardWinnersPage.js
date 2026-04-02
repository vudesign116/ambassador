import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Spin, Typography, Space, message, Alert, Tabs } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, TeamOutlined, CalendarOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// API Version for cache busting
const API_VERSION = process.env.REACT_APP_API_VERSION || 'ambassador.2026.04.01';

const RewardWinnersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [monthlyWinners, setMonthlyWinners] = useState([]);
  const [quarterlyWinners, setQuarterlyWinners] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    loadRewardWinners();
  }, []);

  const loadRewardWinners = async () => {
    setLoading(true);
    setError(null);
    try {
      const rewardEvent = '03_26_th_monthly_reward';
      console.log('🔄 [RewardWinners] Fetching data for event:', rewardEvent);
      console.log('🔄 [RewardWinners] API Version:', API_VERSION);

      const url = `https://bi.meraplion.com/local/get_data/get_nvbc_winners/?reward_event=${rewardEvent}&test=0&v=${API_VERSION}`;
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

      if (data.status === 'ok') {
        const monthly = data.th_monthly_winners || [];
        const quarterly = data.product_expert_winners || [];
        console.log('✅ [RewardWinners] Monthly:', monthly.length, '| Quarterly:', quarterly.length);
        setMonthlyWinners(monthly);
        setQuarterlyWinners(quarterly);
        setEventInfo(data.meta_info || {});
        // Default to quarterly tab if quarterly data exists, else monthly
        setActiveTab(quarterly.length > 0 ? 'quarterly' : 'monthly');
      } else {
        throw new Error(data.message || 'API returned non-ok status');
      }
    } catch (error) {
      console.error('❌ [RewardWinners] Error:', error);
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
    if (rank === 1) return '#FF6B35';
    if (rank === 2) return '#5B8DEE';
    if (rank === 3) return '#8B4513';
    if (rank <= 10) return '#1890ff';
    return '#52c41a';
  };

  // Màu riêng cho bảng quý — dùng index vì rank_theo_diem đều là 1
  const getQuarterlyColor = (index) => {
    const palette = [
      '#9B59B6', '#8E44AD', '#6C3483',
      '#2E86C1', '#1A5276', '#117A65',
      '#1E8449', '#B7950B', '#784212',
      '#6E2F1A'
    ];
    return palette[index % palette.length];
  };

  const formatPoints = (points) => {
    return points.toLocaleString('vi-VN');
  };

  const formatPeriod = () => {
    if (eventInfo.filter_from && eventInfo.filter_to) {
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      const fromDate = formatDate(eventInfo.filter_from);
      const toDate = formatDate(eventInfo.filter_to);
      const [year, month] = eventInfo.filter_from.split('-');
      return { month, year, fromDate, toDate };
    }
    return { month: '03', year: '2026', fromDate: '', toDate: '' };
  };

  const renderWinnersList = (data, type) => (
    <List
      dataSource={data}
      renderItem={(item, index) => (
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
                {(() => {
                  const color = type === 'quarterly' ? getQuarterlyColor(index) : getRankColor(item.rank_theo_diem);
                  const displayNum = type === 'quarterly' ? index + 1 : item.rank_theo_diem;
                  const icon = type === 'quarterly'
                    ? (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null)
                    : getRankIcon(item.rank_theo_diem);
                  return (
                    <>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {icon || displayNum}
                      </div>

                      {/* Name & Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{
                          fontSize: '15px',
                          display: 'block',
                          color: displayNum <= 3 ? color : '#262626'
                        }}>
                          {item.ten_duoc_si || 'N/A'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.ten_tinh || 'N/A'}
                        </Text>
                      </div>

                      {/* Points — hidden in outer scope, handled below */}
                      <div style={{
                        textAlign: 'right',
                        paddingLeft: '12px',
                        borderLeft: '2px solid #f0f0f0',
                        minWidth: '80px'
                      }}>
                        <Text strong style={{ fontSize: '16px', color, display: 'block' }}>
                          {formatPoints(item.tong_diem_tich_luy)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>điểm</Text>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Top 3 highlight */}
            {(type === 'quarterly' ? index < 3 : item.rank_theo_diem <= 3) && (
              <div style={{
                marginTop: '8px',
                padding: '6px 12px',
                background: `linear-gradient(90deg, ${type === 'quarterly' ? getQuarterlyColor(index) : getRankColor(item.rank_theo_diem)}15 0%, transparent 100%)`,
                borderLeft: `3px solid ${type === 'quarterly' ? getQuarterlyColor(index) : getRankColor(item.rank_theo_diem)}`,
                borderRadius: '4px'
              }}>
                <Text style={{ fontSize: '11px', color: type === 'quarterly' ? getQuarterlyColor(index) : getRankColor(item.rank_theo_diem), fontWeight: 'bold' }}>
                  ⭐ TOP {type === 'quarterly' ? index + 1 : item.rank_theo_diem} - Xuất sắc nhất!
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
  );

  return (
    <div className="full-height" style={{ paddingBottom: '80px', background: '#f5f5f5' }}>
      {/* Header */}
      <div className="header-gradient" style={{ borderRadius: '0 0 24px 24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ color: 'white', fontSize: '20px', padding: '4px 8px' }}
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
                <Button type="primary" size="small" onClick={loadRewardWinners} style={{ marginTop: '8px' }}>
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
            <Text style={{ color: '#666', fontSize: '14px' }}>Đang tải danh sách...</Text>
          </div>
        ) : (
          <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              style={{ padding: '0 16px' }}
              tabBarStyle={{ marginBottom: 0 }}
            >
              {/* Tab Quý — nằm trước */}
              <TabPane
                tab={
                  <Space>
                    <CrownOutlined />
                    <span>Quý ({quarterlyWinners.length})</span>
                  </Space>
                }
                key="quarterly"
              >
                <div style={{ padding: '8px 0' }}>
                  {quarterlyWinners.length > 0 && (
                    <div style={{
                      margin: '8px 16px 12px',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Text strong style={{ color: 'white', fontSize: '14px' }}>
                        <CrownOutlined /> Bảng Xếp Hạng Product Expert - Quý
                      </Text>
                    </div>
                  )}
                  {renderWinnersList(quarterlyWinners, 'quarterly')}
                </div>
              </TabPane>

              {/* Tab Tháng */}
              <TabPane
                tab={
                  <Space>
                    <CalendarOutlined />
                    <span>Tháng ({monthlyWinners.length})</span>
                  </Space>
                }
                key="monthly"
              >
                <div style={{ padding: '8px 0' }}>
                  {renderWinnersList(monthlyWinners, 'monthly')}
                </div>
              </TabPane>
            </Tabs>
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

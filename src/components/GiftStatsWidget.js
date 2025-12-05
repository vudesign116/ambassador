import React, { useState, useEffect } from 'react';
import { getGiftSelectionStats } from '../utils/trackingHelper';

const GiftStatsWidget = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const data = getGiftSelectionStats();
    setStats(data);
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  const rewardTypes = {
    th_monthly_reward: { icon: '🎁', title: 'Thưởng Tháng', color: '#f5222d' },
    product_expert_reward: { icon: '🏆', title: 'Chuyên Gia SP', color: '#1890ff' },
    avid_reader_reward: { icon: '📚', title: 'Độc Giả', color: '#faad14' }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        margin: '0 0 20px 0',
        color: '#262626',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#eb2f9615',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          🎁
        </div>
        Gift Selection Statistics
      </h2>

      {/* Total Stats */}
      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        marginBottom: '20px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '24px'
        }}>
          🎁
        </div>
        <div style={{ fontSize: '56px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-2px' }}>
          {stats.total}
        </div>
        <div style={{ fontSize: '16px', opacity: 0.95, fontWeight: '500' }}>
          Total Gift Selections
        </div>
      </div>

      {/* By Month */}
      {Object.keys(stats.byMonth).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: '#595959',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#1890ff15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              📅
            </div>
            By Month
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(stats.byMonth)
              .sort((a, b) => b[1] - a[1])
              .map(([month, count]) => (
                <div key={month} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#fafafa',
                  borderRadius: '8px'
                }}>
                  <div style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>
                    {month}
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    background: '#1890ff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By Gift Type */}
      <div>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '16px', 
          color: '#595959',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#52c41a15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            🎯
          </div>
          Popular Gifts by Category
        </h3>
        
        {Object.entries(rewardTypes).map(([rewardType, config]) => {
          const gifts = stats.byGiftType[rewardType] || {};
          const totalForType = Object.values(gifts).reduce((sum, count) => sum + count, 0);
          
          if (totalForType === 0) return null;
          
          return (
            <div key={rewardType} style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                padding: '8px 12px',
                background: `${config.color}15`,
                borderRadius: '8px',
                borderLeft: `4px solid ${config.color}`
              }}>
                <span style={{ fontSize: '20px' }}>{config.icon}</span>
                <span style={{ fontWeight: '600', fontSize: '14px', color: config.color }}>
                  {config.title}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '2px 8px',
                  background: config.color,
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {totalForType}
                </span>
              </div>
              
              <div style={{ paddingLeft: '16px' }}>
                {Object.entries(gifts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([giftName, count]) => (
                    <div key={giftName} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #f5f5f5'
                    }}>
                      <div style={{ flex: 1, fontSize: '13px', color: '#595959' }}>
                        {giftName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: `${(count / totalForType) * 100}px`,
                          maxWidth: '100px',
                          height: '6px',
                          background: config.color,
                          borderRadius: '3px',
                          opacity: 0.6
                        }} />
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: config.color,
                          minWidth: '30px',
                          textAlign: 'right'
                        }}>
                          {count}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Selections */}
      {stats.recentSelections.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #f0f0f0' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: '#595959',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#722ed115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              🕐
            </div>
            Latest Selections
          </h3>
          <div style={{ fontSize: '12px' }}>
            {stats.recentSelections.slice(0, 5).map((selection, idx) => (
              <div key={idx} style={{
                padding: '10px',
                background: idx % 2 === 0 ? '#fafafa' : 'white',
                borderRadius: '6px',
                marginBottom: '6px'
              }}>
                <div style={{ fontWeight: '600', color: '#262626', marginBottom: '4px' }}>
                  {selection.phone}
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  {new Date(selection.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftStatsWidget;

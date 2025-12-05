import React, { useState, useEffect } from 'react';
import { getOnlineUsers, getUserActivities, getActivityByTimeRange, getTodayPointHistory } from '../utils/trackingHelper';

const OnlineUsersWidget = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ today: 0, last7days: 0 });
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [pointHistory, setPointHistory] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const users = getOnlineUsers();
    setOnlineUsers(users);
    
    const activities = getUserActivities(20);
    setRecentActivities(activities);
    
    const todayActivities = getActivityByTimeRange(24);
    const weekActivities = getActivityByTimeRange(24 * 7);
    
    const uniqueToday = new Set(todayActivities.map(a => a.phone)).size;
    const uniqueWeek = new Set(weekActivities.map(a => a.phone)).size;
    
    setStats({
      today: uniqueToday,
      last7days: uniqueWeek
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      login: { emoji: '🔐', color: '#52c41a', bg: '#f6ffed' },
      logout: { emoji: '👋', color: '#8c8c8c', bg: '#fafafa' },
      view_page: { emoji: '👁️', color: '#1890ff', bg: '#e6f7ff' },
      click: { emoji: '👆', color: '#722ed1', bg: '#f9f0ff' },
      select_gift: { emoji: '🎁', color: '#eb2f96', bg: '#fff0f6' },
      default: { emoji: '📌', color: '#faad14', bg: '#fffbe6' }
    };
    return icons[action] || icons.default;
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          margin: '0 0 16px 0',
          color: '#262626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#1890ff15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            👥
          </div>
          User Activity Tracking
        </h2>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '18px',
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.25)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-1px' }}>
              {onlineUsers.length}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: '500' }}>
              🟢 Online Now
            </div>
          </div>
          
          <div style={{
            padding: '18px',
            background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-1px' }}>
              {stats.today}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: '500' }}>
              📅 Today
            </div>
          </div>
          
          <div style={{
            padding: '18px',
            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.25)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-1px' }}>
              {stats.last7days}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.95, fontWeight: '500' }}>
              📊 Last 7 Days
            </div>
          </div>
        </div>
      </div>

      {/* Online Users List */}
      {onlineUsers.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: '#52c41a',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#52c41a',
              boxShadow: '0 0 8px #52c41a',
              animation: 'pulse 2s infinite'
            }} />
            Currently Online
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {onlineUsers.map((phone, idx) => (
              <div key={idx} style={{
                padding: '6px 12px',
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '16px',
                fontSize: '13px',
                color: '#52c41a',
                fontWeight: '500'
              }}>
                {phone}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div>
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
            📊
          </div>
          Recent Activities
        </h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {recentActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No activities yet
            </div>
          ) : (
            recentActivities.map((activity, idx) => {
              const actionIcon = getActionIcon(activity.action);
              const isHovered = hoveredActivity === idx;
              return (
              <div 
                key={idx} 
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  backgroundColor: isHovered ? '#fafafa' : 'white',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={() => {
                  setHoveredActivity(idx);
                  const history = getTodayPointHistory(activity.phone);
                  setPointHistory(history);
                }}
                onMouseLeave={() => {
                  setHoveredActivity(null);
                  setPointHistory(null);
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: actionIcon.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {actionIcon.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <div style={{ fontWeight: '600', color: '#262626', fontSize: '14px' }}>
                      {activity.name || 'Unknown'}
                    </div>
                    {activity.point > 0 && (
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ⭐ {activity.point}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    color: '#8c8c8c', 
                    fontSize: '12px',
                    marginBottom: '2px'
                  }}>
                    {activity.phone} • {activity.ma_kh_dms || 'N/A'}
                  </div>
                  <div style={{ color: '#bfbfbf', fontSize: '11px' }}>
                    {activity.action} {activity.details?.page && `• ${activity.details.page}`}
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'right',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  <div style={{ color: '#bfbfbf', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {new Date(activity.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                  <div style={{ color: '#d9d9d9', fontSize: '10px', marginTop: '2px' }}>
                    {new Date(activity.timestamp).toLocaleDateString('vi-VN', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                {/* Point History Tooltip */}
                {isHovered && pointHistory && pointHistory.history.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginRight: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '200px',
                    maxWidth: '300px'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#262626'
                    }}>
                      📊 Point History Today
                    </div>
                    <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '8px' }}>
                      {pointHistory.totalActivities} activities
                    </div>
                    {pointHistory.history.map((item, hIdx) => (
                      <div key={hIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        backgroundColor: '#fafafa',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {item.point}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: '#595959' }}>
                            {item.action}
                          </div>
                          <div style={{ fontSize: '10px', color: '#bfbfbf' }}>
                            {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default OnlineUsersWidget;

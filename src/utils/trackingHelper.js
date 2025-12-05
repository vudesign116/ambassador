// Tracking và Analytics utilities
export const trackUserActivity = (phoneNumber, action, details = {}) => {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    
    // Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userName = localStorage.getItem('userName') || userInfo.user_name || userInfo.name || 'Unknown';
    
    const activity = {
      phone: phoneNumber,
      name: userName,
      ma_kh_dms: userInfo.ma_kh_dms || 'N/A',
      action, // 'login', 'view_page', 'click', 'logout'
      details,
      timestamp: new Date().toISOString(),
      sessionId: localStorage.getItem('sessionId') || generateSessionId(),
      point: userInfo.point || 0
    };
    
    activities.push(activity);
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.shift();
    }
    
    localStorage.setItem('user_activities', JSON.stringify(activities));
    
    // Update online users
    updateOnlineUsers(phoneNumber);
  } catch (err) {
    console.error('Error tracking activity:', err);
  }
};

const generateSessionId = () => {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
  return sessionId;
};

const updateOnlineUsers = (phoneNumber) => {
  try {
    const onlineUsers = JSON.parse(localStorage.getItem('online_users') || '{}');
    
    onlineUsers[phoneNumber] = {
      lastActive: new Date().toISOString(),
      sessionId: localStorage.getItem('sessionId')
    };
    
    // Clean up users inactive for more than 30 minutes
    const now = new Date().getTime();
    Object.keys(onlineUsers).forEach(phone => {
      const lastActive = new Date(onlineUsers[phone].lastActive).getTime();
      if (now - lastActive > 30 * 60 * 1000) {
        delete onlineUsers[phone];
      }
    });
    
    localStorage.setItem('online_users', JSON.stringify(onlineUsers));
  } catch (err) {
    console.error('Error updating online users:', err);
  }
};

export const getOnlineUsers = () => {
  try {
    const onlineUsers = JSON.parse(localStorage.getItem('online_users') || '{}');
    const now = new Date().getTime();
    
    // Filter users active in last 5 minutes
    const activeUsers = Object.keys(onlineUsers).filter(phone => {
      const lastActive = new Date(onlineUsers[phone].lastActive).getTime();
      return now - lastActive < 5 * 60 * 1000;
    });
    
    return activeUsers;
  } catch (err) {
    return [];
  }
};

export const getUserActivities = (limit = 50) => {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    return activities.slice(-limit).reverse();
  } catch (err) {
    return [];
  }
};

export const getGiftSelectionStats = () => {
  try {
    const selections = JSON.parse(localStorage.getItem('reward_selections') || '[]');
    
    const stats = {
      total: selections.length,
      byMonth: {},
      byGiftType: {
        th_monthly_reward: {},
        product_expert_reward: {},
        avid_reader_reward: {}
      },
      recentSelections: selections.slice(-10).reverse()
    };
    
    selections.forEach(selection => {
      // Count by month
      const month = selection.month || 'Unknown';
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      
      // Count by gift type
      Object.keys(selection.selections || {}).forEach(rewardType => {
        const giftName = selection.selections[rewardType];
        if (stats.byGiftType[rewardType]) {
          stats.byGiftType[rewardType][giftName] = 
            (stats.byGiftType[rewardType][giftName] || 0) + 1;
        }
      });
    });
    
    return stats;
  } catch (err) {
    return {
      total: 0,
      byMonth: {},
      byGiftType: {},
      recentSelections: []
    };
  }
};

export const getActivityByTimeRange = (hours = 24) => {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return activities.filter(activity => 
      new Date(activity.timestamp) > cutoff
    );
  } catch (err) {
    return [];
  }
};

export const getTodayPointHistory = (phone) => {
  try {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all activities for this phone number today
    const todayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activity.phone === phone && activityDate >= today;
    });
    
    // Get unique points throughout the day (track changes)
    const pointHistory = [];
    let lastPoint = null;
    
    todayActivities.forEach(activity => {
      if (activity.point !== lastPoint && activity.point !== undefined) {
        pointHistory.push({
          point: activity.point,
          timestamp: activity.timestamp,
          action: activity.action
        });
        lastPoint = activity.point;
      }
    });
    
    return {
      history: pointHistory,
      currentPoint: lastPoint || 0,
      totalActivities: todayActivities.length
    };
  } catch (err) {
    return {
      history: [],
      currentPoint: 0,
      totalActivities: 0
    };
  }
};

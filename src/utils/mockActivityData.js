// Mock data helper for testing tracking system
export const setupMockUserActivities = () => {
  const mockUsers = [
    {
      phone: '0123456789',
      name: 'Lê Thư',
      ma_kh_dms: 'M1401079',
      point: 5500
    },
    {
      phone: '0987654321',
      name: 'Nguyễn Văn A',
      ma_kh_dms: 'M1401080',
      point: 4200
    },
    {
      phone: '0912345678',
      name: 'Trần Thị B',
      ma_kh_dms: 'M1401081',
      point: 3800
    }
  ];

  const actions = ['login', 'view_page', 'click', 'select_gift', 'logout'];
  const pages = ['Dashboard', 'Documents', 'Mini Games', 'Reward Selection'];

  const activities = [];
  const now = new Date();

  // Generate activities for today
  mockUsers.forEach(user => {
    // Morning activities (8-10 AM)
    for (let i = 0; i < 3; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(8 + i, Math.random() * 60, 0, 0);
      
      activities.push({
        phone: user.phone,
        name: user.name,
        ma_kh_dms: user.ma_kh_dms,
        action: actions[i % actions.length],
        details: { page: pages[i % pages.length] },
        timestamp: timestamp.toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        point: user.point - (300 * (3 - i)) // Simulate point increase
      });
    }

    // Afternoon activities (2-4 PM)
    for (let i = 0; i < 2; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(14 + i, Math.random() * 60, 0, 0);
      
      activities.push({
        phone: user.phone,
        name: user.name,
        ma_kh_dms: user.ma_kh_dms,
        action: actions[(i + 2) % actions.length],
        details: { page: pages[(i + 2) % pages.length] },
        timestamp: timestamp.toISOString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        point: user.point - (150 * (2 - i))
      });
    }

    // Current activity (now)
    activities.push({
      phone: user.phone,
      name: user.name,
      ma_kh_dms: user.ma_kh_dms,
      action: 'view_page',
      details: { page: 'Dashboard' },
      timestamp: now.toISOString(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      point: user.point
    });
  });

  // Sort by timestamp
  activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Save to localStorage
  localStorage.setItem('user_activities', JSON.stringify(activities));

  // Set online users
  const onlineUsers = {};
  mockUsers.forEach(user => {
    onlineUsers[user.phone] = {
      lastActive: now.toISOString(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  });
  localStorage.setItem('online_users', JSON.stringify(onlineUsers));

  console.log('✅ Mock user activities created:', activities.length, 'activities');
  console.log('👥 Online users:', Object.keys(onlineUsers).length);
  
  return { activities, onlineUsers };
};

// Quick test function
window.setupMockActivities = setupMockUserActivities;

export default setupMockUserActivities;

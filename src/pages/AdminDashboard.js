import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { 
  HomeOutlined, 
  AppstoreOutlined, 
  PictureOutlined,
  TrophyOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  GiftOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    documentViews: 0,
    rewardSelections: 0
  });
  const [weeklyUsers, setWeeklyUsers] = useState([]);
  const [documentCategories, setDocumentCategories] = useState([]);

  useEffect(() => {
    loadStatistics();
    loadWeeklyUserData();
    loadDocumentViewData();
  }, []);

  const loadStatistics = () => {
    // Load actual data from localStorage or APIs
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const onlineUsers = JSON.parse(localStorage.getItem('online_users') || '[]');
    const rewardSelections = JSON.parse(localStorage.getItem('reward_selections') || '[]');
    
    // Calculate document views from user activity
    let totalViews = 0;
    users.forEach(user => {
      const userLikes = Object.keys(localStorage).filter(key => 
        key.startsWith(`doc_likes_${user.phone}`)
      );
      totalViews += userLikes.length;
    });

    setStats({
      totalUsers: users.length || 0,
      onlineUsers: onlineUsers.length || 0,
      documentViews: totalViews || 0,
      rewardSelections: rewardSelections.length || 0
    });
  };

  const loadWeeklyUserData = () => {
    // Generate weekly user registration data
    const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    const data = weeks.map(week => ({
      name: week,
      users: Math.floor(Math.random() * 50) + 10 // Mock data - replace with real data
    }));
    setWeeklyUsers(data);
  };

  const loadDocumentViewData = () => {
    // Load document view statistics by category
    const categories = [
      { name: 'Video Marketing', value: 0, color: '#667eea' },
      { name: 'PDF Tài liệu', value: 0, color: '#00BFA5' },
      { name: 'Hướng dẫn', value: 0, color: '#f093fb' },
      { name: 'Khóa học', value: 0, color: '#faad14' },
      { name: 'Khác', value: 0, color: '#52c41a' }
    ];

    // Count views by category - mock data for now
    // Replace with real data from your document viewing logs
    categories.forEach(cat => {
      cat.value = Math.floor(Math.random() * 100) + 20;
    });

    setDocumentCategories(categories);
  };

  const menuItems = [
    {
      key: 'minigames',
      icon: <AppstoreOutlined />,
      title: 'Quản lý Mini Games',
      description: 'Thêm, sửa, xóa mini games',
      path: '/admin/minigames',
      color: '#667eea'
    },
    {
      key: 'login-page',
      icon: <HomeOutlined />,
      title: 'Quản lý trang Login',
      description: 'Sửa banner đăng nhập',
      path: '/admin/login-page',
      color: '#00BFA5'
    },
    {
      key: 'introduction',
      icon: <TrophyOutlined />,
      title: 'Quản lý trang Introduction',
      description: 'Logo, nội dung, giải thưởng',
      path: '/admin/introduction',
      color: '#f093fb'
    },
    {
      key: 'scoring-rules',
      icon: <FileTextOutlined />,
      title: 'Quản lý trang Scoring Rules',
      description: 'Banner, công thức tính điểm',
      path: '/admin/scoring-rules',
      color: '#faad14'
    },
    {
      key: 'dashboard',
      icon: <PictureOutlined />,
      title: 'Quản lý trang Dashboard',
      description: 'Badge images, mức điểm',
      path: '/admin-config',
      color: '#52c41a'
    },
    {
      key: 'general',
      icon: <SettingOutlined />,
      title: 'Cấu hình chung',
      description: 'Thời gian điểm, API config',
      path: '/admin/general-config',
      color: '#8c8c8c'
    },
    {
      key: 'reward-selections',
      icon: <TrophyOutlined />,
      title: 'Quản lý Lựa chọn Quà tặng',
      description: 'Xem danh sách quà đã chọn',
      path: '/admin/reward-selections',
      color: '#eb2f96'
    },
    {
      key: 'notification',
      icon: <BellOutlined />,
      title: 'Quản lý Thông báo',
      description: 'Tạo popup thông báo cho user',
      path: '/admin/notification',
      color: '#ff4d4f'
    },
    {
      key: 'surveys',
      icon: <FileTextOutlined />,
      title: 'Quản lý Khảo sát',
      description: 'Tạo và quản lý khảo sát người dùng',
      path: '/admin/surveys',
      color: '#1890ff'
    }
  ];

  // Only show statistics that have data
  const hasData = stats.totalUsers > 0 || stats.onlineUsers > 0 || stats.documentViews > 0 || stats.rewardSelections > 0;

  return (
    <div>
      <Title level={2}>Dashboard Overview</Title>
      
      {/* Statistics Cards - Only show if has data */}
      {hasData && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {stats.totalUsers > 0 && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng người dùng"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          )}
          {stats.onlineUsers > 0 && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đang online"
                  value={stats.onlineUsers}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          )}
          {stats.documentViews > 0 && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Lượt xem tài liệu"
                  value={stats.documentViews}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          )}
          {stats.rewardSelections > 0 && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Quà đã chọn"
                  value={stats.rewardSelections}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Charts - Temporarily hidden */}
      {false && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="📊 Thống kê User theo tuần">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyUsers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#667eea" name="Số user" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="📈 Tỉ lệ xem tài liệu theo danh mục">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={documentCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {documentCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                {documentCategories.map((cat, idx) => (
                  <div key={idx} style={{ display: 'inline-block', margin: '0 8px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      backgroundColor: cat.color, 
                      marginRight: 4,
                      borderRadius: 2
                    }}></span>
                    <Text style={{ fontSize: 12 }}>{cat.name}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Title level={3} style={{ marginBottom: 16 }}>Quick Actions</Title>
      <Row gutter={[16, 16]}>
        {menuItems.map((item) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={item.key}>
            <Card
              hoverable
              onClick={() => navigate(item.path)}
              style={{ 
                height: '100%',
                borderLeft: `4px solid ${item.color}`
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ 
                  fontSize: 32,
                  color: item.color
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600,
                    marginBottom: 4
                  }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: 12,
                    color: '#8c8c8c'
                  }}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard;

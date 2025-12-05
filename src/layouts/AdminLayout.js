import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  DashboardOutlined,
  SettingOutlined,
  LoginOutlined,
  AppstoreOutlined,
  FormOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import ambassadorLogo from '../images/MAmbassador-logo.png';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin')
    },
    {
      key: 'config',
      icon: <SettingOutlined />,
      label: 'Cấu hình trang',
      children: [
        {
          key: '/admin/login-page',
          icon: <LoginOutlined />,
          label: 'Trang đăng nhập',
          onClick: () => navigate('/admin/login-page')
        },
        {
          key: '/admin/dashboard-config',
          icon: <DashboardOutlined />,
          label: 'Trang dashboard',
          onClick: () => navigate('/admin/dashboard-config')
        },
        {
          key: '/admin/introduction',
          icon: <FileTextOutlined />,
          label: 'Trang giới thiệu',
          onClick: () => navigate('/admin/introduction')
        },
        {
          key: '/admin/scoring-rules',
          icon: <TrophyOutlined />,
          label: 'Thể lệ tích điểm',
          onClick: () => navigate('/admin/scoring-rules')
        }
      ]
    },
    {
      key: '/admin/minigames',
      icon: <AppstoreOutlined />,
      label: 'Mini Games',
      onClick: () => navigate('/admin/minigames')
    },
    {
      key: '/admin/general-config',
      icon: <FormOutlined />,
      label: 'Cấu hình chung',
      onClick: () => navigate('/admin/general-config')
    },
    {
      key: '/admin/surveys',
      icon: <FileSearchOutlined />,
      label: 'Quản lý Khảo sát',
      onClick: () => navigate('/admin/surveys')
    },
    {
      key: '/admin/notification',
      icon: <BellOutlined />,
      label: 'Thông báo',
      onClick: () => navigate('/admin/notification')
    }
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        // Clear all admin authentication data
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        console.log('👋 Admin logged out');
        navigate('/admin/login');
      }
    }
  ];

  // Get current menu key from path
  const getCurrentKey = () => {
    // Check if current path matches any menu item
    const path = location.pathname;
    const menuItem = menuItems.find(item => {
      if (item.children) {
        return item.children.some(child => child.key === path);
      }
      return item.key === path;
    });
    return menuItem ? [path] : ['/admin'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px'
        }}>
          <img 
            src={ambassadorLogo} 
            alt="Logo" 
            style={{ 
              height: collapsed ? 32 : 40,
              transition: 'all 0.2s'
            }} 
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getCurrentKey()}
          defaultOpenKeys={['config']}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'all 0.2s' }}>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <span>Admin</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

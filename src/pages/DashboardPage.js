import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Button, Dropdown, Modal, Spin, Typography, Space, Badge, Empty, Tag, Row, Col, Statistic } from 'antd';
import { HomeOutlined, AppstoreOutlined, MenuOutlined, HistoryOutlined, GiftOutlined, LogoutOutlined, PlayCircleOutlined, RightOutlined, FireOutlined, RocketOutlined } from '@ant-design/icons';
import UserBadge from '../components/UserBadge';
import RadarChart from '../components/RadarChart';
import CelebrationAnimation from '../components/CelebrationAnimation';
import NotificationPopup from '../components/NotificationPopup';
import SurveyModal from '../components/SurveyModal';
import { useActiveSurveys } from '../hooks/useSurvey';
import ambassadorLogo from '../images/MAmbassador-logo.png';
import iconHospital from '../images/icon-hospital.png';
import iconInfo from '../images/icon-info.png';
import iconDna from '../images/icon-dna.png';
import iconBook from '../images/icon-book.png';
import iconBrain from '../images/icon-brain.png';
import iconTips from '../images/icon-tips.png';
import * as PointsManager from '../utils/pointsManager';
import { googleSheetsService } from '../services/googleSheetsService';

const { Text, Title } = Typography;



const DashboardPage = () => {
  const navigate = useNavigate();
  const [playDialogOpen, setPlayDialogOpen] = useState(false);
  const [userScore, setUserScore] = useState(0); // Will be fetched from API
  const [categoryStats, setCategoryStats] = useState([]); // Category-wise points
  const [dailyTasks, setDailyTasks] = useState([]); // Tasks with dynamic points from API
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'minigame'
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = localStorage.getItem('userName') || 'Phạm Thị Hương';
  const phoneNumber = localStorage.getItem('phoneNumber');
  
  // Point breakdown for 4 blocks
  const [videoPoints, setVideoPoints] = useState(0);
  const [streakPoints, setStreakPoints] = useState(0);
  const [referralPoints, setReferralPoints] = useState(0);
  const [miniGamePoints, setMiniGamePoints] = useState(0);
  
  // Streak data for timeline
  const [streakData, setStreakData] = useState([]);
  
  // Survey functionality
  const { activeSurveys, loading: surveysLoading } = useActiveSurveys(phoneNumber);
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const [showSurvey, setShowSurvey] = useState(false);

  // Show survey popup when active surveys are available
  useEffect(() => {
    if (!surveysLoading && activeSurveys.length > 0) {
      // Delay to show after page load
      const timer = setTimeout(() => {
        setShowSurvey(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [surveysLoading, activeSurveys]);

  const handleSurveyClose = () => {
    setShowSurvey(false);
    // Show next survey if available
    if (currentSurveyIndex < activeSurveys.length - 1) {
      setTimeout(() => {
        setCurrentSurveyIndex(currentSurveyIndex + 1);
        setShowSurvey(true);
      }, 1000);
    }
  };
  
  // Mini games list - loaded from admin config
  const [games, setGames] = useState([]);

  // Load mini games from admin config
  useEffect(() => {
    const adminGames = localStorage.getItem('admin_minigames');
    if (adminGames) {
      setGames(JSON.parse(adminGames));
    }
  }, []);

  // Listen for points update flag when user returns from document page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is visible again
        const pointsUpdated = localStorage.getItem('points_updated');
        if (pointsUpdated === 'true') {
          console.log('🔄 Points updated, reloading dashboard...');
          window.location.reload(); // Reload to fetch latest points
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format date for display: "HH:mm DD/MM/YYYY"
  const formatUpdateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Fetch total points and calculate category stats from API
  useEffect(() => {
    const fetchTotalPoints = async () => {
      setLoading(true);
      try {
        const phoneNumber = localStorage.getItem('phoneNumber');
        const authToken = localStorage.getItem('authToken');
        
        if (!phoneNumber || !authToken) {
          setLoading(false);
          return;
        }

        // Clear the update flag if it exists
        localStorage.removeItem('points_updated');

        // ✅ Use new API endpoint (no Authorization needed)
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local'}/get_data/get_nvbc_point/?phone=${phoneNumber}&test=1`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Save API points to manager (with contentlist to map type)
          if (data && typeof data.point === 'number') {
            const apiHistory = data.lich_su_diem || [];
            const contentlist = data.contentlist || [];
            PointsManager.saveAPIPoints(data.point, apiHistory, contentlist);
            
            // Mark API history documents as viewed
            PointsManager.markAPIHistoryAsViewed(apiHistory);
          }
          
          // Get total points (API + Session + Referral + Streak)
          let totalPoints = PointsManager.getTotalPoints();
          
          // Calculate video/document points
          let totalVideoPoints = 0;
          if (data.lich_su_diem && Array.isArray(data.lich_su_diem)) {
            totalVideoPoints = data.lich_su_diem.reduce((sum, item) => {
              return sum + (item.effective_point || item.point || 0);
            }, 0);
          }
          setVideoPoints(totalVideoPoints);
          
          // Add referral points
          let totalReferralPoints = 0;
          if (data && typeof data.referral_point === 'number') {
            totalReferralPoints = data.referral_point;
            totalPoints += totalReferralPoints;
          }
          setReferralPoints(totalReferralPoints);
          
          // Add streak bonus points
          let totalStreakBonus = 0;
          if (data && data.streak_last_7_days && Array.isArray(data.streak_last_7_days)) {
            totalStreakBonus = data.streak_last_7_days.reduce((sum, day) => sum + (day.bonus_point || 0), 0);
            totalPoints += totalStreakBonus;
            // Save streak data for timeline display
            setStreakData(data.streak_last_7_days);
          }
          setStreakPoints(totalStreakBonus);
          
          // Mini game points (TODO: from API when available)
          setMiniGamePoints(0);
          
          setUserScore(totalPoints);

          // Calculate points by category from contentlist and lich_su_diem
          if (data) {
            const categoryPoints = {};
            const categoryMaxPoints = {}; // Track max possible points per category
            
            // Initialize categories (including new Referral and Streak)
            const categoryMap = {
              'THÔNG TIN VỀ MERAPLION': 'MerapLion',
              'THÔNG TIN SẢN PHẦM': 'Sản phẩm',
              'THÔNG TIN BỆNH HỌC': 'Bệnh học',
              'SỔ TAY NGƯỜI THẦY THUỐC': 'Sổ tay thầy thuốc',
              'TƯ VẤN CÙNG CHUYÊN GIA': 'Tư vấn chuyên gia',
              'MINI_GAME': 'Mini Game'
            };

            // Initialize all categories with 0 points
            Object.values(categoryMap).forEach(cat => {
              categoryPoints[cat] = 0;
              // Set default max points to 1 to avoid division by zero
              categoryMaxPoints[cat] = 1;
            });

            // Add Referral and Streak categories
            categoryPoints['Điểm Giới thiệu'] = 0;
            categoryMaxPoints['Điểm Giới thiệu'] = 100; // Assume max 100 for referral
            categoryPoints['Điểm Duy trì'] = 0;
            categoryMaxPoints['Điểm Duy trì'] = 50; // Assume max 50 for streak

            // Create a map of document_id to category from contentlist
            // AND calculate max points per category
            const documentCategoryMap = {};
            if (data.contentlist && Array.isArray(data.contentlist)) {
              data.contentlist.forEach(content => {
                const categoryName = categoryMap[content.category];
                if (categoryName && content.subcategories && Array.isArray(content.subcategories)) {
                  // Calculate total max points for this category
                  let categoryTotal = 0;
                  content.subcategories.forEach(doc => {
                    if (doc.document_id) {
                      documentCategoryMap[doc.document_id] = content.category;
                      categoryTotal += (doc.point || 0);
                    }
                  });
                  categoryMaxPoints[categoryName] = categoryTotal;
                }
              });
            }

            // Count points from API history using effective_point (NEW API STRUCTURE)
            if (data.lich_su_diem && Array.isArray(data.lich_su_diem)) {
              data.lich_su_diem.forEach(item => {
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
            }

            // Calculate Referral Points from API
            if (data.referral_point && typeof data.referral_point === 'number') {
              categoryPoints['Điểm Giới thiệu'] = data.referral_point;
            }

            // Calculate Streak Points from streak_last_7_days
            if (data.streak_last_7_days && Array.isArray(data.streak_last_7_days)) {
              let totalStreakPoints = 0;
              data.streak_last_7_days.forEach(day => {
                totalStreakPoints += (day.bonus_point || 0);
              });
              categoryPoints['Điểm Duy trì'] = totalStreakPoints;
            }

            // Also count points from session (earned points)
            const earnedPoints = PointsManager.getEarnedPoints();
            earnedPoints.forEach(item => {
              // Get category from earned point item
              if (item.category) {
                const categoryName = categoryMap[item.category];
                if (categoryName) {
                  // Use effective_point if available, fallback to point
                  const points = item.effective_point || item.point || 0;
                  categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + points;
                }
              } else if (item.document_id) {
                // Fallback: try to find category from document_id
                const category = documentCategoryMap[item.document_id];
                if (category) {
                  const categoryName = categoryMap[category];
                  if (categoryName) {
                    const points = item.effective_point || item.point || 0;
                    categoryPoints[categoryName] = (categoryPoints[categoryName] || 0) + points;
                  }
                }
              }
            });

            // Convert to array format for RadarChart with maxPoints
            const stats = Object.keys(categoryPoints).map(name => ({
              name,
              value: categoryPoints[name],
              maxPoints: categoryMaxPoints[name] || 1 // Avoid division by zero
            }));

            // Ensure all categories appear in radar chart (even with 0 points)
            const allCategories = [...Object.values(categoryMap), 'Điểm Giới thiệu', 'Điểm Duy trì'];
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

            // Get last update time from most recent point history
            const combinedHistory = PointsManager.getCombinedHistory();
            if (combinedHistory.length > 0) {
              // History is already sorted by newest first
              const latestTime = combinedHistory[0].inserted_at;
              setLastUpdated(formatUpdateTime(latestTime));
            } else {
              // No history yet, use current time
              setLastUpdated(formatUpdateTime(new Date().toISOString()));
            }

            // Build daily tasks with point ranges from contentlist
            if (data.contentlist && Array.isArray(data.contentlist)) {
              const tasks = [
                {
                  title: 'Mini Game',
                  apiCategory: 'MINI_GAME',
                  icon: iconTips,
                  category: 'mini-game',
                  isComingSoon: true // Flag for upcoming feature
                },
                {
                  title: 'Thông tin về MerapLion',
                  apiCategory: 'THÔNG TIN VỀ MERAPLION',
                  icon: iconInfo,
                  category: 'thong-tin-ve-meraplion',
                  isNew: true // Flag for NEW label
                },
                {
                  title: 'Thông tin sản phẩm',
                  apiCategory: 'THÔNG TIN SẢN PHẦM',
                  icon: iconHospital,
                  category: 'thong-tin-san-pham'
                },
                {
                  title: 'Thông tin bệnh học',
                  apiCategory: 'THÔNG TIN BỆNH HỌC',
                  icon: iconDna,
                  category: 'thong-tin-benh-hoc'
                },
                {
                  title: 'Sổ tay người thầy thuốc',
                  apiCategory: 'SỔ TAY NGƯỜI THẦY THUỐC',
                  icon: iconBook,
                  category: 'so-tay-nguoi-thay-thuoc'
                },
                {
                  title: 'Tư vấn cùng chuyên gia',
                  apiCategory: 'TƯ VẤN CÙNG CHUYÊN GIA',
                  icon: iconBrain,
                  category: 'tu-van-cung-chuyen-gia'
                }
              ];

              const tasksWithPoints = tasks.map(task => {
                // Special handling for Mini Game (coming soon)
                if (task.isComingSoon) {
                  return {
                    title: task.title,
                    points: 'Sắp diễn ra',
                    icon: task.icon,
                    completed: false,
                    category: task.category,
                    isComingSoon: true
                  };
                }

                const categoryData = data.contentlist.find(item => item.category === task.apiCategory);
                let pointRange = '0 điểm';

                if (categoryData && categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
                  const points = categoryData.subcategories.map(doc => doc.point || 0);
                  if (points.length > 0) {
                    const minPoint = Math.min(...points);
                    const maxPoint = Math.max(...points);
                    pointRange = minPoint === maxPoint ? `${minPoint} điểm` : `${minPoint}-${maxPoint} điểm`;
                  }
                }

                return {
                  title: task.title,
                  points: pointRange,
                  icon: task.icon,
                  completed: false,
                  category: task.category,
                  isNew: task.isNew // Preserve NEW flag
                };
              });

              setDailyTasks(tasksWithPoints);
            } else {
              // Fallback to default tasks
              setDailyTasks([
                { title: 'Mini Game', points: 'Sắp diễn ra', icon: iconTips, completed: false, category: 'mini-game', isComingSoon: true },
                { title: 'Thông tin về MerapLion', points: '10 điểm', icon: iconInfo, completed: false, category: 'thong-tin-ve-meraplion', isNew: true },
                { title: 'Thông tin sản phẩm', points: '1-2 điểm', icon: iconHospital, completed: false, category: 'thong-tin-san-pham' },
                { title: 'Thông tin bệnh học', points: '1 điểm', icon: iconDna, completed: false, category: 'thong-tin-benh-hoc' },
                { title: 'Sổ tay người thầy thuốc', points: '1 điểm', icon: iconBook, completed: false, category: 'so-tay-nguoi-thay-thuoc' },
                { title: 'Tư vấn cùng chuyên gia', points: '1 điểm', icon: iconBrain, completed: false, category: 'tu-van-cung-chuyen-gia' }
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching total points:', err);
        // Set default tasks on error
        setDailyTasks([
          { title: 'Mini Game', points: 'Sắp diễn ra', icon: iconTips, completed: false, category: 'mini-game', isComingSoon: true },
          { title: 'Thông tin về MerapLion', points: '10 điểm', icon: iconInfo, completed: false, category: 'thong-tin-ve-meraplion', isNew: true },
          { title: 'Thông tin sản phẩm', points: '1-2 điểm', icon: iconHospital, completed: false, category: 'thong-tin-san-pham' },
          { title: 'Thông tin bệnh học', points: '1 điểm', icon: iconDna, completed: false, category: 'thong-tin-benh-hoc' },
          { title: 'Sổ tay người thầy thuốc', points: '1 điểm', icon: iconBook, completed: false, category: 'so-tay-nguoi-thay-thuoc' },
          { title: 'Tư vấn cùng chuyên gia', points: '1 điểm', icon: iconBrain, completed: false, category: 'tu-van-cung-chuyen-gia' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalPoints();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // Function to get current date and time in Vietnamese format
  const getCurrentDateTime = () => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const day = days[now.getDay()];
    const date = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}, ${date}/${month}/${year}`;
  };

  // Function to handle play button toggle
  const handlePlayToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState) {
      // Expanding - Scroll to bottom of page
      setTimeout(() => {
        // Scroll to the very bottom of the document
        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const bottomNavHeight = 80; // Height of bottom navigation
        
        window.scrollTo({ 
          top: scrollHeight - windowHeight + bottomNavHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    } else {
      // Collapsing - Scroll back to top
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  };

  // Demo function to test different badge levels (cycle through all 5 badges)
  const cycleBadgeLevel = () => {
    setShowCelebration(true); // Trigger celebration animation
    if (userScore < 500) {
      setUserScore(750); // Học Giả Trẻ (501-1000)
    } else if (userScore < 1000) {
      setUserScore(1500); // Nhà Nghiên Cứu (1001-2000)
    } else if (userScore < 2000) {
      setUserScore(2500); // Chuyên Gia (2001-3000) ⭐ NEW
    } else if (userScore < 3000) {
      setUserScore(3500); // Bậc Thầy Tri Thức (3001+) ⭐ NEW
    } else {
      setUserScore(250); // Reset về Tân Binh (0-500)
    }
  };

  // Handle task item click
  const handleTaskClick = (task) => {
    // Special handling for Mini Game
    if (task.category === 'mini-game') {
      if (!task.isComingSoon) {
        // When Mini Game is available, open the play dialog
        setPlayDialogOpen(true);
        // Scroll to ensure user sees the dialog
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
      // If coming soon, do nothing (already disabled in UI)
      return;
    }
    
    // For other categories, navigate to documents page
    navigate(`/documents/${task.category}`);
  };

  // Handle mini game click
  const handleGameClick = (game) => {
    if (game.available && game.url) {
      window.open(game.url, '_blank', 'noopener,noreferrer');
      console.log('Opening game:', game.title, game.url);
    }
  };

  // Handle menu actions
  const handleGiftList = () => {
    navigate('/introduction');
  };

  const handleScoringRules = () => {
    navigate('/scoring-rules');
  };

  const handleLogout = () => {
    // 🚀 Track logout to Google Sheets trong BACKGROUND (không chờ response)
    googleSheetsService.trackLogout({
      timestamp: new Date().toISOString()
    }).catch(err => console.warn('Failed to track logout:', err));
    
    // Clear user data (GIỮ LẠI phoneNumber để auto-fill khi login lại)
    PointsManager.resetAllPoints();
    // localStorage.removeItem('phoneNumber'); // ❌ KHÔNG XÓA - để tự động điền lại
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('ma_kh_dms');
    localStorage.removeItem('rewardStatus');
    
    // Navigate to login NGAY LẬP TỨC
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'reward-selection',
      icon: <GiftOutlined />,
      label: 'Xem Giải Thưởng',
      onClick: () => navigate('/reward-selection'),
      style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '500' }
    },
    {
      key: 'scoring-rules',
      icon: <HistoryOutlined />,
      label: 'Cách tính điểm',
      onClick: handleScoringRules,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="full-height" style={{ paddingBottom: '80px' }}>
      <NotificationPopup />
      <div className="header-gradient" style={{ borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
          <img src={ambassadorLogo} alt="M.Ambassador Logo" className="dashboard-logo" style={{ width: '60px', marginBottom: 0 }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <p className="text-secondary" style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Xin Chào, {userName}
            </p>
            <p className="text-secondary" style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              {getCurrentDateTime()}
            </p>
          </div>
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<MenuOutlined />}
              style={{ 
                color: 'white', 
                fontSize: '20px',
                marginLeft: 'auto'
              }}
            />
          </Dropdown>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div className="container">
            <div className="card card-elevated score-display" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                <button 
                  className="btn-link" 
                  style={{ color: 'var(--primary-color)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}
                  onClick={() => navigate('/point-history')}
                >
                  Lịch sử điểm
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                    Đang tải điểm...
                  </Text>
                </div>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <UserBadge score={userScore} />

                  <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
                    TỔNG QUAN HOẠT ĐỘNG
                  </Title>

                  <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 13 }}>
                    Cập nhật {lastUpdated}
                  </Text>

                  <RadarChart userScore={userScore} categoryStats={categoryStats} />
                </Space>
              )}
            </div>

            {/* 4 Point Stats Blocks */}
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
                      value={streakPoints} 
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

            {/* Streak Timeline */}
            {streakData.length > 0 && (
              <Card 
                title={
                  <Space>
                    <FireOutlined style={{ color: '#ff4d4f' }} />
                    <span>CHUỖI DUY TRÌ 7 NGÀY GẦN ĐÂY</span>
                  </Space>
                }
                style={{ marginBottom: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  {streakData.map((day, index) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                    const dayNum = date.getDate();
                    const hasView = day.has_view;
                    const streakLength = day.streak_length;
                    const bonusPoint = day.bonus_point || 0;
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Day label */}
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                          {dayName}
                        </Text>
                        
                        {/* Circle indicator */}
                        <div style={{ 
                          width: 38, 
                          height: 38, 
                          borderRadius: '50%',
                          backgroundColor: hasView ? '#52c41a' : '#d9d9d9',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: bonusPoint > 0 ? '3px solid #ff4d4f' : 'none',
                          position: 'relative'
                        }}>
                          {hasView ? (
                            <span style={{ fontSize: 16, color: 'white' }}>✓</span>
                          ) : (
                            <span style={{ fontSize: 14, color: '#999' }}>•</span>
                          )}
                          
                          {/* Bonus badge */}
                          {bonusPoint > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: -12,
                              right: -12,
                              backgroundColor: '#ff4d4f',
                              borderRadius: '8px',
                              padding: '1px 5px',
                              fontSize: 10,
                              color: 'white',
                              fontWeight: 'bold',
                              border: '2px solid #fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              +{bonusPoint}
                            </div>
                          )}
                        </div>
                        
                        {/* Date number */}
                        <Text style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: hasView ? 'bold' : 'normal' }}>
                          {dayNum}
                        </Text>
                        
                        {/* Connecting line to next day */}
                        {index < streakData.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            top: 35,
                            left: '50%',
                            width: '100%',
                            height: 2,
                            backgroundColor: hasView && streakData[index + 1].has_view ? '#52c41a' : '#d9d9d9',
                            zIndex: -1
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Streak summary */}
                {(() => {
                  // Calculate current streak (consecutive days with has_view = true)
                  // If today (last day) has no view, use the streak_length from the last day that had a view
                  let currentStreak = 0;
                  
                  // Check if the most recent day has a view
                  const lastDay = streakData[streakData.length - 1];
                  if (lastDay && lastDay.has_view) {
                    // If today has view, count from the end
                    for (let i = streakData.length - 1; i >= 0; i--) {
                      if (streakData[i].has_view) {
                        currentStreak++;
                      } else {
                        break;
                      }
                    }
                  } else {
                    // If today has no view, find the last day with view and use its streak_length
                    for (let i = streakData.length - 2; i >= 0; i--) {
                      if (streakData[i].has_view) {
                        currentStreak = streakData[i].streak_length;
                        break;
                      }
                    }
                  }
                  
                  // Calculate next milestone suggestion
                  let suggestion = '';
                  if (currentStreak === 2) {
                    suggestion = '💪 Còn 1 ngày nữa → +30đ!';
                  } else if (currentStreak === 5) {
                    suggestion = '💪 Còn 2 ngày nữa → +30đ!';
                  } else if (currentStreak === 6) {
                    suggestion = '💪 Còn 1 ngày nữa → +40đ (tổng 100đ)!';
                  }
                  
                  return (
                    <>
                      <div style={{ 
                        marginTop: 20, 
                        padding: '12px 16px', 
                        backgroundColor: '#e6f7f5', 
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Space>
                          <FireOutlined style={{ color: '#ff4d4f', fontSize: 15 }} />
                          <Text strong style={{ fontSize: 11 }}>Chuỗi hiện tại: {currentStreak} ngày</Text>
                        </Space>
                        <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>
                          Tổng thưởng đã nhận: +{streakPoints} điểm
                        </Tag>
                      </div>
                      
                      {/* Suggestion */}
                      {suggestion && (
                        <div 
                          className="streak-suggestion-blink"
                          style={{ 
                            marginTop: 12, 
                            padding: '8px 12px', 
                            backgroundColor: '#fff7e6',
                            border: '1px solid #ffd591',
                            borderRadius: 8,
                            textAlign: 'center'
                          }}
                        >
                          <Text strong style={{ fontSize: 12, color: '#d48806', lineHeight: '1.4' }}>
                            {suggestion}
                          </Text>
                        </div>
                      )}
                      
                      {/* Milestone info */}
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <Text style={{ fontSize: 11, color: '#262626' }}>
                          💡 Mốc thưởng: 3 ngày liên tiếp (tổng +30đ), 7 ngày liên tiếp (tổng +100đ)
                        </Text>
                      </div>
                    </>
                  );
                })()}
              </Card>
            )}

            <Card title={
              <Space>
                <span>MẸO TĂNG ĐIỂM</span>
                <img src={iconTips} alt="Tips" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </Space>
            }>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
                Điểm tổng hợp từ việc xem tài liệu, video và mức độ tích cực của bạn mỗi ngày
              </Text>

              <List
                dataSource={dailyTasks}
                renderItem={(task) => (
                  <List.Item
                    onClick={task.isComingSoon ? undefined : () => handleTaskClick(task)}
                    style={{ 
                      cursor: task.isComingSoon ? 'not-allowed' : 'pointer', 
                      padding: '12px 0',
                      opacity: task.isComingSoon ? 0.6 : 1
                    }}
                    extra={
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<RightOutlined />}
                        size="small"
                        disabled={task.isComingSoon}
                        style={{
                          background: task.isComingSoon ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                      />
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <img src={task.icon} alt={task.title} style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: task.isComingSoon ? 0.5 : 1 }} />
                      }
                      title={
                        <Space size={8}>
                          <Text strong style={{ color: task.isComingSoon ? '#999' : 'inherit' }}>{task.title}</Text>
                          {task.isNew && (
                            <Tag className="new-label-blink">
                              NEW
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Badge 
                          count={task.points} 
                          style={{ 
                            backgroundColor: task.isComingSoon ? '#faad14' : '#52c41a' 
                          }} 
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>

          <button className="fab" onClick={() => setPlayDialogOpen(true)}>
            ▶️
          </button>
        </>
      )}

      {/* Mini Game Tab Content */}
      {activeTab === 'minigame' && (
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
          {games.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size="small">
                    <Title level={5}>Hiện tại chưa có chương trình Mini Game dành cho bạn</Title>
                    <Text type="secondary">Hãy quay lại sau!</Text>
                  </Space>
                }
              />
            </Card>
          ) : (
              <div className="games-grid">
                {games.map((game) => (
                  <div 
                    key={game.id} 
                    className={`game-card ${!game.available ? 'game-disabled' : ''}`}
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="game-thumbnail">
                      <img src={game.thumbnail} alt={game.title} />
                      {game.comingSoon && (
                        <div className="coming-soon-badge">Coming Soon</div>
                      )}
                      {game.available && (
                        <div className="play-overlay">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)" />
                            <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="white" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="game-info">
                      <h4>{game.title}</h4>
                      <p>{game.description}</p>
                      <div className="game-action">
                        <button 
                          className={`play-button ${!game.available ? 'disabled' : ''}`}
                          disabled={!game.available}
                        >
                          {game.comingSoon ? 'Coming Soon' : 'Chơi ngay'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      <div className="bottom-nav">
        <div 
          className={`nav-item ${activeTab === 'overview' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <div className="nav-item-icon"><HomeOutlined /></div>
          <div className="nav-item-label">TỔNG QUAN</div>
        </div>
        
        <div className="play-button-center">
          <button className="btn btn-primary btn-play-center" onClick={handlePlayToggle}>
            {!isExpanded ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="play-triangle">
                <path d="M5 3v18l15-9z"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="close-icon">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
        
        {/* Mini Game tab */}
        <div 
          className={`nav-item ${activeTab === 'minigame' ? 'nav-item-active' : ''}`} 
          onClick={() => setActiveTab('minigame')}
        >
          <div className="nav-item-icon"><AppstoreOutlined /></div>
          <div className="nav-item-label">MINI GAME</div>
        </div>
      </div>

      <Modal
        title="TĂNG ĐIỂM NGAY"
        open={playDialogOpen}
        onCancel={() => setPlayDialogOpen(false)}
        footer={null}
        centered
      >
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: 13 }}>
          Điểm tổng hợp từ việc xem tài liệu, video và mức độ tích cực của bạn mỗi ngày
        </Text>

        <List
          dataSource={dailyTasks}
          renderItem={(task) => (
            <List.Item
              onClick={task.isComingSoon ? undefined : () => handleTaskClick(task)}
              style={{ 
                cursor: task.isComingSoon ? 'not-allowed' : 'pointer',
                opacity: task.isComingSoon ? 0.6 : 1
              }}
              extra={
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<PlayCircleOutlined />}
                  disabled={task.isComingSoon}
                  style={{
                    background: task.isComingSoon ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                />
              }
            >
              <List.Item.Meta
                avatar={
                  <img src={task.icon} alt={task.title} style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: task.isComingSoon ? 0.5 : 1 }} />
                }
                title={<span style={{ color: task.isComingSoon ? '#999' : 'inherit' }}>{task.title}</span>}
                description={
                  <Badge 
                    count={task.points} 
                    style={{ 
                      backgroundColor: task.isComingSoon ? '#faad14' : '#52c41a' 
                    }} 
                  />
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <CelebrationAnimation
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Survey Modal */}
      {!surveysLoading && activeSurveys.length > 0 && (
        <SurveyModal
          survey={activeSurveys[currentSurveyIndex]}
          visible={showSurvey}
          onClose={handleSurveyClose}
          userId={phoneNumber}
        />
      )}
    </div>
  );
};

export default DashboardPage;
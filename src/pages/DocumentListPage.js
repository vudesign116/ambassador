import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, List, Card, Tag, Button, Modal, Progress, Typography, Space, Spin, Empty } from 'antd';
import { SearchOutlined, ArrowLeftOutlined, FileTextOutlined, VideoCameraOutlined, CloseOutlined, TrophyOutlined, ClockCircleOutlined, LikeFilled } from '@ant-design/icons';
import videoFileIcon from '../images/video-file.png';
import pdfFileIcon from '../images/pdf-file.png';
import { postViewingHistory } from '../utils/apiHelper';
import * as PointsManager from '../utils/pointsManager';
import { googleSheetsService } from '../services/googleSheetsService';

const { Text, Title } = Typography;

// Sample documents data - moved outside component to prevent re-creation
const allDocuments = {
  'thong-tin-san-pham': [
    { id: 1, name: 'Giới thiệu sản phẩm MerapLion 2024', type: 'pdf', points: '5 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
    { id: 2, name: 'Video demo tính năng mới', type: 'video', points: '8 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 3, name: 'Hướng dẫn sử dụng cơ bản', type: 'pdf', points: '3 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
    { id: 4, name: 'Webinar sản phẩm Q3 2024', type: 'video', points: '10 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
  ],
  'thong-tin-ve-meraplion': [
    { id: 5, name: 'Lịch sử phát triển MerapLion', type: 'pdf', points: '4 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
    { id: 6, name: 'Tầm nhìn và sứ mệnh công ty', type: 'video', points: '6 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 7, name: 'Văn hóa doanh nghiệp', type: 'pdf', points: '3 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
  ],
  'thong-tin-benh-hoc': [
    { id: 8, name: 'Kiến thức y khoa cơ bản', type: 'pdf', points: '7 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
    { id: 9, name: 'Video giải thích bệnh học', type: 'video', points: '9 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 10, name: 'Nghiên cứu case study', type: 'pdf', points: '5 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
  ],
  'so-tay-nguoi-thay-thuoc': [
    { id: 11, name: 'Quy trình tư vấn khách hàng', type: 'pdf', points: '6 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
    { id: 12, name: 'Video kỹ năng giao tiếp', type: 'video', points: '8 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 13, name: 'Bài tập thực hành', type: 'pdf', points: '4 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
  ],
  'tu-van-cung-chuyen-gia': [
    { id: 14, name: 'Buổi tư vấn với chuyên gia A', type: 'video', points: '12 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 15, name: 'Q&A session tháng 10', type: 'video', points: '10 điểm', url: 'https://www.youtube.com/embed/UbbY72EqDm8?si=Kd6N3N5-E_Etpf01' },
    { id: 16, name: 'Tài liệu hỏi đáp', type: 'pdf', points: '5 điểm', url: 'https://drive.google.com/file/d/1bO9g6M0ZsiRj7L-Z_fhRR4xFFljrHcXO/preview' },
  ]
};

const categoryNames = {
  'thong-tin-san-pham': 'Thông tin sản phẩm',
  'thong-tin-ve-meraplion': 'Thông tin về MerapLion',
  'thong-tin-benh-hoc': 'Thông tin bệnh học',
  'so-tay-nguoi-thay-thuoc': 'Sổ tay người thầy thuốc',
  'tu-van-cung-chuyen-gia': 'Tư vấn cùng chuyên gia'
};

const DocumentListPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [viewingTime, setViewingTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [hearts, setHearts] = useState([]);
  const [heartId, setHeartId] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [hasReached100Percent, setHasReached100Percent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [hasPostedToAPI, setHasPostedToAPI] = useState(false);
  const hasPostedRef = React.useRef(false); // Use ref to track POST status
  const hasMarkedViewedRef = React.useRef(false); // Track if document marked as viewed
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [minViewingTime, setMinViewingTime] = useState(60); // Default 60 seconds
  const [apiStatus, setApiStatus] = useState('idle'); // 'idle' | 'posting' | 'success' | 'error'
  const [apiErrorMessage, setApiErrorMessage] = useState('');

  // Load config from admin
  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('admin_general_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setMinViewingTime(config.pointsViewDuration || 60);
      } else {
        // Fallback to app_points_view_duration if available
        const appDuration = localStorage.getItem('app_points_view_duration');
        if (appDuration) {
          setMinViewingTime(parseInt(appDuration));
        }
      }
    };
    loadConfig();
  }, []);

  // Track category view when page loads
  useEffect(() => {
    const trackCategoryView = async () => {
      const categoryName = categoryNames[category] || category;
      
      // Track activity to Google Sheets
      await googleSheetsService.syncActivity({
        type: 'category_viewed',
        description: `Xem danh mục: ${categoryName}`,
        page: `/documents/${category}`,
        duration: 0,
        metadata: {
          category: category,
          categoryName: categoryName,
          timestamp: new Date().toISOString()
        }
      }).catch(err => console.warn('Failed to track category view:', err));
    };

    if (category) {
      trackCategoryView();
    }
  }, [category]);

  // Fetch documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      setApiLoading(true);
      try {
        const phoneNumber = localStorage.getItem('phoneNumber');
        const authToken = localStorage.getItem('authToken');
        
        if (!phoneNumber || !authToken) {
          // Fallback to static data if not logged in
          setDocuments(allDocuments[category] || []);
          setApiLoading(false);
          return;
        }

        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local'}/nvbc_get_point/?phone=${phoneNumber}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Map category slug to API category name
          const categoryMap = {
            'thong-tin-san-pham': 'THÔNG TIN SẢN PHẦM',
            'thong-tin-ve-meraplion': 'THÔNG TIN VỀ MERAPLION',
            'thong-tin-benh-hoc': 'THÔNG TIN BỆNH HỌC',
            'so-tay-nguoi-thay-thuoc': 'SỔ TAY NGƯỜI THẦY THUỐC',
            'tu-van-cung-chuyen-gia': 'TƯ VẤN CÙNG CHUYÊN GIA'
          };

          const apiCategory = categoryMap[category];
          
          if (data.contentlist && Array.isArray(data.contentlist)) {
            // Find the category in contentlist
            const categoryData = data.contentlist.find(item => item.category === apiCategory);
            
            if (categoryData && categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
              // Transform API data to match our document structure
              const transformedDocs = categoryData.subcategories.map(doc => ({
                id: doc.document_id,
                name: doc.document_name,
                type: doc.type, // 'pdf' or 'video'
                points: `${doc.point} điểm`,
                url: doc.url,
                sub_category: doc.sub_category || ''
              }));
              
              setDocuments(transformedDocs);
            } else {
              // No data for this category, use fallback
              setDocuments(allDocuments[category] || []);
            }
          } else {
            // No contentlist, use fallback
            setDocuments(allDocuments[category] || []);
          }
        } else {
          // API failed, use fallback
          setDocuments(allDocuments[category] || []);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        // On error, use fallback
        setDocuments(allDocuments[category] || []);
      } finally {
        setApiLoading(false);
      }
    };

    fetchDocuments();
  }, [category]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type) => {
    if (type === 'pdf') {
      return <img src={pdfFileIcon} alt="PDF" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />;
    } else {
      return <img src={videoFileIcon} alt="Video" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />;
    }
  };

  const handleDocumentClick = (document) => {
    // Scroll to top to fix iPhone positioning issue
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setCurrentDocument(document);
    setViewerOpen(true);
    setViewingTime(0);
    setEarnedPoints(0);
    setIsLoading(true);
    setLoadError(false);
    hasPostedRef.current = false; // Reset POST flag for new document
    hasMarkedViewedRef.current = false; // Reset marked viewed flag for new document
    
    // Track document view
    const categoryName = categoryNames[category] || category;
    googleSheetsService.syncActivity({
      type: 'document_viewed',
      description: `Xem tài liệu: ${document.name}`,
      page: `/documents/${category}`,
      duration: 0,
      metadata: {
        category: category,
        categoryName: categoryName,
        documentId: document.id,
        documentName: document.name,
        documentType: document.type,
        documentPoints: document.points,
        timestamp: new Date().toISOString()
      }
    }).catch(err => console.warn('Failed to track document view:', err));
    
    // Clear any existing timeout
    if (window.loadingTimeout) {
      clearTimeout(window.loadingTimeout);
    }
    
    // Timeout protection - stop loading after 30 seconds and show error
    window.loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setLoadError(true);
      console.warn('Document loading timeout after 30 seconds');
    }, 30000);
    
    // Start timer
    const interval = setInterval(() => {
      setViewingTime(prevTime => {
        const newTime = prevTime + 1;
        // Calculate points based on viewing time (minViewingTime = 100%)
        const basePoints = parseInt(document.points.replace(/[^\d]/g, '')) || 0;
        const earnedPoints = Math.min(Math.floor((newTime / minViewingTime) * basePoints), basePoints);
        setEarnedPoints(earnedPoints);
        
        // Trigger celebration when reaching 100% for the first time
        if (!hasReached100Percent && newTime >= minViewingTime) {
          setHasReached100Percent(true);
          
          const phoneNumber = localStorage.getItem('phoneNumber');
          const ma_kh_dms = localStorage.getItem('ma_kh_dms') || '';
          
          // 🆕 POST to API FIRST and WAIT for response
          if (!hasPostedRef.current) {
            hasPostedRef.current = true;
            setApiStatus('posting'); // Show loading state
            
            postViewingHistory(ma_kh_dms, phoneNumber, document.id)
              .then(result => {
                if (result.success) {
                  console.log('✅ Posted viewing history to server - SUCCESS');
                  setApiStatus('success');
                  setHasPostedToAPI(true);
                  
                  // Set flag to trigger dashboard reload
                  localStorage.setItem('points_updated', 'true');
                  
                  // ✅ ONLY mark as viewed AFTER API success
                  if (!hasMarkedViewedRef.current) {
                    hasMarkedViewedRef.current = true;
                    
                    const documentData = {
                      document_id: document.id,
                      document_name: document.name,
                      document_type: document.type,
                      points: parseInt(document.points.replace(/[^\d]/g, '')) || 0,
                      ma_kh_dms,
                      phone: phoneNumber,
                      category: category,
                      timestamp: new Date().toISOString()
                    };
                    
                    // Add to PointsManager (this will mark as viewed and start cooldown)
                    PointsManager.addEarnedPoint(documentData);
                    console.log('✅ Document marked as viewed with cooldown AFTER API success');
                  }
                  
                  // 🎉 NOW trigger celebration after API success
                  triggerCelebration();
                  
                } else {
                  // API returned but with error (status 400, no_endpoint, missing_data, etc.)
                  console.log('⚠️ Failed to post viewing history:', result.reason || result.error);
                  setApiStatus('error');
                  
                  // Set error message based on reason
                  if (result.reason === 'no_endpoint') {
                    setApiErrorMessage('Hệ thống chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
                  } else if (result.reason === 'missing_data') {
                    setApiErrorMessage('Thiếu thông tin tài khoản. Vui lòng đăng nhập lại.');
                  } else {
                    setApiErrorMessage('Điểm không được ghi nhận. Vui lòng thử lại sau!');
                  }
                }
              })
              .catch(err => {
                // Network error or other exceptions
                console.error('❌ API error:', err);
                setApiStatus('error');
                setApiErrorMessage('Lỗi kết nối. Điểm không được ghi nhận. Vui lòng thử lại sau!');
              });
          }
        }
        
        // Trigger heart effect every 10 seconds
        if (newTime > 0 && newTime % 10 === 0) {
          createHeart();
        }
        
        return newTime;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Note: Points are now managed by server API, no local storage needed
  // POST to server happens at 60s mark in timer
  // Dashboard will reload points from API when user returns

  const closeViewer = () => {
    // Kiểm tra xem đã đạt đủ điểm chưa
    const hasEarnedPoints = earnedPoints > 0;
    const stillWatching = viewingTime > 0 && viewingTime < minViewingTime;
    
    // Nếu đang xem nhưng chưa đủ thời gian, hiện confirm
    if (stillWatching && !hasEarnedPoints) {
      Modal.confirm({
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
            <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Chưa đủ thời gian xem</span>
          </div>
        ),
        content: (
          <div style={{ paddingLeft: 32 }}>
            <p style={{ fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>
              Bạn đã xem được <strong style={{ color: '#ff4d4f', fontSize: 16 }}>{viewingTime} giây</strong> (cần tối thiểu <strong>{minViewingTime} giây</strong> để nhận điểm).
            </p>
            <p style={{ fontSize: 15, marginBottom: 0, lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn thoát không?
            </p>
          </div>
        ),
        okText: 'Thoát',
        cancelText: 'Tiếp tục xem',
        okButtonProps: {
          danger: true,
          size: 'large',
          style: { fontWeight: 600, minWidth: 100 }
        },
        cancelButtonProps: {
          type: 'primary',
          size: 'large',
          style: { fontWeight: 600, minWidth: 120 }
        },
        icon: null,
        centered: true,
        width: 460,
        onOk: () => {
          performClose();
        },
        onCancel: () => {
          // Không làm gì, ở lại xem tiếp
        }
      });
      return; // Không thoát ngay, đợi confirm
    }
    
    // Nếu đã đủ điểm hoặc chưa xem gì, thoát luôn
    performClose();
  };

  const performClose = () => {
    // Points are already posted to server at 60s mark
    // No need to save to localStorage anymore

    setViewerOpen(false);
    setCurrentDocument(null);
    setViewingTime(0);
    setEarnedPoints(0);
    setHearts([]);
    setHeartId(0);
    setShowCelebration(false);
    setConfetti([]);
    setHasReached100Percent(false);
    setIsLoading(false);
    setLoadError(false);
    setHasPostedToAPI(false);
    hasPostedRef.current = false; // Reset ref when closing viewer
    setLikeCount(0);
    setHasLiked(false);
    setApiStatus('idle'); // Reset API status
    setApiErrorMessage(''); // Clear error message;
    
    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Clear loading timeout
    if (window.loadingTimeout) {
      clearTimeout(window.loadingTimeout);
      window.loadingTimeout = null;
    }
    
    // Clear iframe for memory management on Safari
    setTimeout(() => {
      const iframe = document.querySelector('.document-viewer-iframe-fullscreen');
      if (iframe) {
        iframe.src = 'about:blank';
      }
    }, 100);
    
    // Scroll to top after closing to fix iPhone positioning issue
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
  };

  const getEmbedUrl = (url, type) => {
    if (type === 'video') {
      // YouTube URL optimization with enhanced autoplay for Safari iPhone
      const isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      if (isMobileSafari) {
        // For Safari iOS: add mute=1 to enable autoplay (iOS requirement)
        return url + '&autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&controls=1';
      } else {
        // For desktop browsers
        return url + '&autoplay=1&rel=0&modestbranding=1&controls=1';
      }
    } else {
      // PDF optimization for all browsers including Safari
      const isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      if (isMobileSafari) {
        // For Safari iOS: use embedded viewer with specific parameters
        return url.replace('/preview', '/preview?embedded=true&chrome=false&dov=1');
      } else {
        // For other browsers: standard embed
        return url + '?embedded=true';
      }
    }
  };

  const isPdfType = (type) => type === 'pdf';
  const isMobileSafari = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPointsPercentage = () => {
    return Math.min(Math.floor((viewingTime / minViewingTime) * 100), 100);
  };

  // Load like count from localStorage when document opens
  useEffect(() => {
    if (currentDocument) {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const likeKey = `doc_likes_${phoneNumber}_${currentDocument.id}`;
      const likeData = localStorage.getItem(likeKey);
      
      if (likeData) {
        const { count, liked } = JSON.parse(likeData);
        setLikeCount(count || 0);
        setHasLiked(liked || false);
      } else {
        setLikeCount(0);
        setHasLiked(false);
      }
    }
  }, [currentDocument]);

  const handleLike = () => {
    if (!currentDocument) return;
    
    const phoneNumber = localStorage.getItem('phoneNumber');
    const likeKey = `doc_likes_${phoneNumber}_${currentDocument.id}`;
    
    if (!hasLiked) {
      // Add like
      const newCount = likeCount + 1;
      setLikeCount(newCount);
      setHasLiked(true);
      
      // Save to localStorage
      localStorage.setItem(likeKey, JSON.stringify({
        count: newCount,
        liked: true,
        timestamp: Date.now()
      }));
      
      // Create heart animation
      createHeart();
    } else {
      // Unlike
      const newCount = Math.max(0, likeCount - 1);
      setLikeCount(newCount);
      setHasLiked(false);
      
      // Save to localStorage
      localStorage.setItem(likeKey, JSON.stringify({
        count: newCount,
        liked: false,
        timestamp: Date.now()
      }));
    }
  };

  const createHeart = () => {
    const newHeart = {
      id: `heart-${heartId}-${Date.now()}`,
      left: Math.random() * 80 + 10, // Random position 10-90%
      animationDelay: Math.random() * 2, // Random delay 0-2s
    };
    
    setHearts(prev => [...prev, newHeart]);
    setHeartId(prev => prev + 1);
    
    // Remove heart after animation completes  
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 3000);
  };

  // Create confetti celebration
  const createConfetti = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const shapes = ['🎉', '🎊', '⭐', '✨', '🌟'];
    const newConfetti = [];
    
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: `confetti-${Date.now()}-${i}-${Math.random()}`,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
      });
    }
    
    setConfetti(newConfetti);
    
    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 6000);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    createConfetti();
    
    // Hide celebration after 4 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };

  return (
    <div className="document-list-page">
      {/* Header - Fixed */}
      <div className="document-header-fixed">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
          style={{ color: 'white' }}
        />
        <Title level={4} style={{ color: 'white', margin: 0, flex: 1, textAlign: 'center' }}>
          {categoryNames[category] || 'Tài liệu'}
        </Title>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Content with padding for fixed header */}
      <div style={{ paddingTop: 64 }}></div>

      <div className="container">
        {/* Search Box */}
        <Card style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm tài liệu, video..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            size="large"
            allowClear
          />
        </Card>

        {/* Document List */}
        {apiLoading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                Đang tải tài liệu...
              </Text>
            </div>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <Empty description="Không tìm thấy tài liệu nào" />
          </Card>
        ) : (
          <List
            dataSource={filteredDocuments}
            renderItem={(document) => {
              const viewStatus = PointsManager.isDocumentViewed(document.id);
              const isDisabled = viewStatus.viewed && !viewStatus.canReview;
              
              return (
                <List.Item
                  style={{ 
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    marginBottom: 8,
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                  }}
                  onClick={() => !isDisabled && handleDocumentClick(document)}
                  extra={
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} />}
                      disabled={isDisabled}
                      style={{
                        background: isDisabled ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    />
                  }
                >
                  <List.Item.Meta
                    avatar={
                      document.type === 'video' ? (
                        <img 
                          src={videoFileIcon} 
                          alt="Video" 
                          style={{ width: 40, height: 40, objectFit: 'contain' }} 
                        />
                      ) : (
                        <img 
                          src={pdfFileIcon} 
                          alt="PDF" 
                          style={{ width: 40, height: 40, objectFit: 'contain' }} 
                        />
                      )
                    }
                    title={
                      <Space direction="vertical" size={4}>
                        <Text strong>{document.name}</Text>
                        <Space size={4}>
                          <Tag color={document.type === 'video' ? 'blue' : 'orange'}>
                            {document.type === 'video' ? 'VIDEO' : 'PDF'}
                          </Tag>
                          <Tag color="green" icon={<TrophyOutlined />}>
                            {document.points}
                          </Tag>
                          {viewStatus.viewed && (
                            viewStatus.canReview ? (
                              <Tag color="success">✓ Có thể xem lại</Tag>
                            ) : (
                              <Tag color="default">Đã xem (xem lại sau {viewStatus.remainingTime}p)</Tag>
                            )
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {/* Document Viewer Modal */}
      <Modal
        open={viewerOpen && currentDocument}
        onCancel={closeViewer}
        footer={null}
        width="100vw"
        style={{ top: 0, padding: 0, maxWidth: '100vw' }}
        styles={{ 
          body: { padding: 0, height: '100%', overflow: 'hidden', background: '#000' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.95)' }
        }}
        closeIcon={<CloseOutlined style={{ color: 'white', fontSize: 18 }} />}
        centered={false}
        maskClosable={false}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%', 
            gap: '12px',
            paddingRight: '40px' // Add padding to prevent overlap with close button
          }}>
            <Space size="middle" style={{ flex: 1 }}>
              <Space size="small" align="center">
                <ClockCircleOutlined style={{ fontSize: 18, color: 'white' }} />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                  {formatTime(viewingTime)}
                </Text>
              </Space>
              <Space size="small" align="center">
                <TrophyOutlined style={{ fontSize: 18, color: '#FFD700' }} />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                  {earnedPoints}/{currentDocument ? parseInt(currentDocument.points.replace(/[^\d]/g, '')) : 0}
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 14 }}>
                  ({getPointsPercentage()}%)
                </Text>
              </Space>
            </Space>
            <Button 
              type={hasLiked ? "primary" : "text"}
              icon={<LikeFilled style={{ color: hasLiked ? 'white' : '#4267B2' }} />}
              onClick={handleLike} 
              style={{ 
                background: hasLiked ? '#4267B2' : 'white',
                borderRadius: '6px',
                padding: '6px 12px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                color: hasLiked ? 'white' : '#4267B2',
                fontSize: 14,
                border: hasLiked ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                flexShrink: 0 // Prevent button from shrinking
              }}
            >
              {hasLiked ? 'Đã thích' : 'Thích'} {likeCount > 0 && `(${likeCount})`}
            </Button>
          </div>
        }
        className="document-viewer-modal"
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {isLoading && !loadError && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10
              }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16 }}>
                  Đang tải {currentDocument && currentDocument.type === 'pdf' ? 'tài liệu PDF' : 'video'}...
                </Text>
                {currentDocument && currentDocument.type === 'pdf' && isMobileSafari() && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    Đang tối ưu cho Safari mobile...
                  </Text>
                )}
              </div>
            )}

            {loadError && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <Title level={3}>Không thể tải tài liệu</Title>
                <Text>Vui lòng thử lại hoặc kiểm tra kết nối mạng</Text>
                <br />
                <Button
                  type="primary"
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    setLoadError(false);
                    setIsLoading(true);
                    
                    // Clear any existing timeout
                    if (window.loadingTimeout) {
                      clearTimeout(window.loadingTimeout);
                    }
                    
                    // Set new timeout
                    window.loadingTimeout = setTimeout(() => {
                      setIsLoading(false);
                      setLoadError(true);
                      console.warn('Document loading timeout after 30 seconds');
                    }, 30000);
                    
                    // Reload iframe
                    const iframe = document.querySelector('.document-viewer-iframe-fullscreen');
                    if (iframe) {
                      iframe.src = iframe.src;
                    }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            )}
            {currentDocument && (
              <iframe
                src={getEmbedUrl(currentDocument.url, currentDocument.type)}
                title={currentDocument.name}
                className="document-viewer-iframe-fullscreen"
                allowFullScreen
                frameBorder="0"
                allow={currentDocument.type === 'video' ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" : ""}
                sandbox={
                  currentDocument.type === 'pdf' 
                    ? "allow-same-origin allow-scripts allow-popups allow-forms" 
                    : "allow-same-origin allow-scripts allow-presentation allow-popups allow-forms allow-modals"
                }
                loading="eager"
                onLoad={() => {
                  setIsLoading(false);
                  setLoadError(false);
                  // Clear loading timeout since iframe loaded successfully
                  if (window.loadingTimeout) {
                    clearTimeout(window.loadingTimeout);
                    window.loadingTimeout = null;
                  }
                  console.log('Document loaded successfully');
                }}
                onError={() => {
                  console.warn('Iframe failed to load');
                  setIsLoading(false);
                  setLoadError(true);
                  // Clear loading timeout
                  if (window.loadingTimeout) {
                    clearTimeout(window.loadingTimeout);
                    window.loadingTimeout = null;
                  }
                }}
              />
            )}
          </div>
          
          {/* Hearts Animation */}
          <div className="hearts-container">
            {hearts.map(heart => (
              <div
                key={heart.id}
                className="floating-heart"
                style={{
                  left: `${heart.left}%`,
                  animationDelay: `${heart.animationDelay}s`
                }}
              >
                ❤️
              </div>
            ))}
          </div>

          {/* Confetti Animation */}
          <div className="confetti-container">
            {confetti.map(piece => (
              <div
                key={piece.id}
                className="confetti-piece"
                style={{
                  left: `${piece.left}%`,
                  color: piece.color,
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`
                }}
              >
                {piece.shape}
              </div>
            ))}
          </div>

          {/* API Processing Notification */}
          {apiStatus === 'posting' && viewingTime >= minViewingTime && (
            <div className="celebration-notification" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="celebration-content">
                <div className="celebration-icon">
                  <Spin style={{ color: 'white' }} />
                </div>
                <div className="celebration-text">
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Đang xử lý...</Title>
                  <Text style={{ color: 'white' }}>
                    Vui lòng đợi trong giây lát
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* API Error Notification */}
          {apiStatus === 'error' && viewingTime >= minViewingTime && (
            <>
              {/* Dark Overlay */}
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                zIndex: 199,
                animation: 'fadeIn 0.3s ease-out'
              }} />
              
              {/* Notification Content */}
              <div className="celebration-notification error-notification">
                <div className="celebration-content" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  maxWidth: '420px',
                  padding: '28px 32px'
                }}>
                  <div className="celebration-icon" style={{ fontSize: '52px' }}>⚠️</div>
                  <div className="celebration-text">
                    <Title level={4} style={{ 
                      margin: '0 0 12px 0', 
                      color: 'white', 
                      fontSize: '19px',
                      fontWeight: 600
                    }}>
                      Thông báo
                    </Title>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 14.5, 
                      lineHeight: 1.7,
                      display: 'block'
                    }}>
                      Hệ thống không ghi nhận điểm khi bạn mở cùng lúc nhiều tài liệu hoặc video, hoặc mở nhiều tab khác nhau trên trình duyệt để xem.
                      <br /><br />
                      Vui lòng đóng các tab không cần thiết và thử lại sau để được tính điểm chính xác!
                    </Text>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Celebration Notification */}
          {showCelebration && (
            <div className="celebration-notification">
              <div className="celebration-content">
                <div className="celebration-icon">🎉</div>
                <div className="celebration-text">
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Chúc mừng! Bạn đã hoàn thành</Title>
                  <Text style={{ color: 'white' }}>
                    Nhận được <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{earnedPoints} điểm</span>
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentListPage;
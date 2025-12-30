import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, List, Card, Tag, Button, Modal, Progress, Typography, Space, Spin, Empty } from 'antd';
import { SearchOutlined, ArrowLeftOutlined, FileTextOutlined, VideoCameraOutlined, CloseOutlined, TrophyOutlined, ClockCircleOutlined, LikeFilled, LoadingOutlined } from '@ant-design/icons';
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
  const [confetti, setConfetti] = useState([]);
  const [hasReached100Percent, setHasReached100Percent] = useState(false);
  const [hasReached50Percent, setHasReached50Percent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [hasPostedToAPI, setHasPostedToAPI] = useState(false);
  const hasPostedRef = React.useRef(false); // Use ref to track POST status
  const hasMarkedViewedRef = React.useRef(false); // Track if document marked as viewed
  const autoPostTimeoutRef = React.useRef(null); // Track auto POST timeout
  const hasShown50ModalRef = React.useRef(false); // Track if 50% modal shown
  const hasShown100ModalRef = React.useRef(false); // Track if 100% modal shown
  const currentDocumentRef = React.useRef(null); // Track current document (avoid stale closure)
  const viewerOpenRef = React.useRef(false); // Track viewer open state (avoid stale closure)
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [minViewingTime50, setMinViewingTime50] = useState(60); // Default 60s for 50%
  const [minViewingTime100, setMinViewingTime100] = useState(120); // Default 120s for 100%
  const [enable50PercentMilestone, setEnable50PercentMilestone] = useState(true); // Default enabled
  const [apiStatus, setApiStatus] = useState('idle'); // 'idle' | 'posting' | 'success' | 'error'
  const [apiErrorMessage, setApiErrorMessage] = useState('');

  // Load config from admin
  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('admin_general_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        const duration50 = config.pointsViewDuration50 || 60;
        const duration100 = config.pointsViewDuration100 || 120;
        const enable50 = config.enable50PercentMilestone !== undefined ? config.enable50PercentMilestone : true;
        console.log('[CONFIG] Loading admin config - 50%:', duration50, '100%:', duration100, 'Enable 50%:', enable50);
        setMinViewingTime50(duration50);
        setMinViewingTime100(duration100);
        setEnable50PercentMilestone(enable50);
      } else {
        // Fallback to localStorage values if available
        const duration50 = localStorage.getItem('app_points_view_duration_50');
        const duration100 = localStorage.getItem('app_points_view_duration_100');
        const enable50 = localStorage.getItem('app_enable_50_percent_milestone');
        console.log('[CONFIG] Loading localStorage config - 50%:', duration50, '100%:', duration100, 'Enable 50%:', enable50);
        if (duration50) setMinViewingTime50(parseInt(duration50));
        if (duration100) setMinViewingTime100(parseInt(duration100));
        if (enable50) setEnable50PercentMilestone(enable50 === 'true');
      }
    };
    loadConfig();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear auto POST timeout on unmount
      if (autoPostTimeoutRef.current) {
        clearTimeout(autoPostTimeoutRef.current);
      }
      // Clear timer interval on unmount
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

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
          console.log('[DOCUMENTS] Not logged in, using static data');
          // Fallback to static data if not logged in
          setDocuments(allDocuments[category] || []);
          setApiLoading(false);
          return;
        }

        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local'}/get_data/get_nvbc_point/?phone=${phoneNumber}&test=1`;
        console.log('[DOCUMENTS] Fetching from API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[DOCUMENTS] API response:', data);
          
          // Map category slug to API category name
          const categoryMap = {
            'thong-tin-san-pham': 'THÔNG TIN SẢN PHẦM',
            'thong-tin-ve-meraplion': 'THÔNG TIN VỀ MERAPLION',
            'thong-tin-benh-hoc': 'THÔNG TIN BỆNH HỌC',
            'so-tay-nguoi-thay-thuoc': 'SỔ TAY NGƯỜI THẦY THUỐC',
            'tu-van-cung-chuyen-gia': 'TƯ VẤN CÙNG CHUYÊN GIA'
          };

          const apiCategory = categoryMap[category];
          console.log('[DOCUMENTS] Looking for category:', apiCategory, 'in contentlist');
          
          if (data.contentlist && Array.isArray(data.contentlist)) {
            console.log('[DOCUMENTS] contentlist found:', data.contentlist.map(c => c.category));
            
            // Find the category in contentlist
            const categoryData = data.contentlist.find(item => item.category === apiCategory);
            
            if (categoryData && categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
              console.log('[DOCUMENTS] ✅ Found', categoryData.subcategories.length, 'documents for', apiCategory);
              
              // Transform API data to match our document structure
              const transformedDocs = categoryData.subcategories.map(doc => ({
                id: doc.document_id,
                name: doc.document_name,
                type: doc.type, // 'pdf' or 'video'
                points: `${doc.point} điểm`,
                url: doc.url,
                sub_category: doc.sub_category || '',
                condition: doc.condition // Add condition field for "new" label
              }));
              
              setDocuments(transformedDocs);
            } else {
              // ❌ Category not found in API response - show empty list
              console.warn('[DOCUMENTS] ⚠️ Category', apiCategory, 'not found in API response or has no documents');
              console.warn('[DOCUMENTS] Available categories:', data.contentlist.map(c => c.category).join(', '));
              setDocuments([]); // ✅ Set empty array instead of fallback
            }
          } else {
            // No contentlist in response
            console.warn('[DOCUMENTS] ⚠️ No contentlist in API response');
            setDocuments([]); // ✅ Set empty array instead of fallback
          }
        } else {
          // API failed
          console.error('[DOCUMENTS] ❌ API request failed:', response.status, response.statusText);
          setDocuments([]); // ✅ Set empty array instead of fallback
        }
      } catch (err) {
        console.error('[DOCUMENTS] ❌ Error fetching documents:', err);
        // On error, show empty list
        setDocuments([]); // ✅ Set empty array instead of fallback
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
    
    console.log('[OPEN DOCUMENT] Config:', {
      minViewingTime50,
      minViewingTime100,
      enable50PercentMilestone,
      document: document.name,
      points: document.points
    });
    
    setCurrentDocument(document);
    currentDocumentRef.current = document; // ✅ Store in ref for timer callbacks
    setViewerOpen(true);
    viewerOpenRef.current = true; // ✅ Store in ref for timer callbacks
    setViewingTime(0);
    setEarnedPoints(0);
    setHasReached50Percent(false); // Reset 50% milestone
    setHasReached100Percent(false); // Reset 100% milestone
    setIsLoading(true);
    setLoadError(false);
    setApiStatus('idle'); // Reset API status
    setApiErrorMessage(''); // Clear error message
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
        
        // Debug log every 10 seconds
        if (newTime % 10 === 0) {
          console.log('[TIMER] Time:', newTime, 's | 50%:', minViewingTime50, 's | 100%:', minViewingTime100, 's | viewerOpen:', viewerOpenRef.current);
        }
        
        // ✅ Calculate points based on milestone config
        // If 50% enabled: 2 tiers (0 → 50% → 100%)
        // If 50% disabled: 1 tier (0 → 100%)
        const basePoints = parseInt(document.points.replace(/[^\d]/g, '')) || 0;
        let earnedPoints = 0;
        
        if (newTime >= minViewingTime100) {
          // >= 100% → full points
          earnedPoints = basePoints;
        } else if (enable50PercentMilestone && newTime >= minViewingTime50) {
          // >= 50% → half points (only if 50% milestone enabled)
          earnedPoints = Math.floor(basePoints * 0.5);
        } else {
          // < minimum threshold → no points yet
          earnedPoints = 0;
        }
        
        setEarnedPoints(earnedPoints);
        
        // 🎉 Track 50% milestone - Show modal popup ONCE (only if enabled)
        // ✅ Safety check: Only show modal if viewer is still open AND 50% milestone is enabled
        if (enable50PercentMilestone && !hasReached50Percent && newTime >= minViewingTime50 && !hasShown50ModalRef.current && viewerOpenRef.current) {
          console.log('[50% MILESTONE] ✅ TRIGGERED! newTime:', newTime, 'hasReached50:', hasReached50Percent, 'hasShown50Modal:', hasShown50ModalRef.current, 'viewerOpen:', viewerOpenRef.current);
          setHasReached50Percent(true);
          hasShown50ModalRef.current = true; // Mark as shown
          triggerCelebration(50); // Show 50% modal
        }
        
        // 🎊 Track 100% milestone - Auto POST API immediately
        // ✅ Safety check: Only trigger if viewer is still open
        if (!hasReached100Percent && newTime >= minViewingTime100 && !hasShown100ModalRef.current && viewerOpenRef.current) {
          console.log('[100% MILESTONE] ✅ TRIGGERED! newTime:', newTime, 'hasReached100:', hasReached100Percent, 'hasShown100Modal:', hasShown100ModalRef.current, 'viewerOpen:', viewerOpenRef.current);
          setHasReached100Percent(true);
          hasShown100ModalRef.current = true; // Mark as shown
          
          // Trigger confetti animation
          createConfetti();
          
          // POST API IMMEDIATELY when reaching 100%
          if (!hasPostedRef.current) {
            console.log('[Auto POST] Triggering auto POST immediately at 100% milestone');
            // ✅ Pass current viewingTime from newTime
            postToAPIAndClose(newTime);
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
    const stillWatching = viewingTime > 0 && viewingTime < minViewingTime100;
    const reached100 = hasReached100Percent || viewingTime >= minViewingTime100;
    
    console.log('[CLOSE VIEWER] Debug:', {
      viewingTime,
      earnedPoints,
      hasEarnedPoints,
      stillWatching,
      reached100,
      hasReached100Percent,
      hasPostedRef: hasPostedRef.current,
      minViewingTime50,
      minViewingTime100
    });
    
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
              Bạn đã xem được <strong style={{ color: '#ff4d4f', fontSize: 16 }}>{viewingTime} giây</strong>.
            </p>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 1.6 }}>
              {enable50PercentMilestone ? (
                <>
                  • Xem <strong>{minViewingTime50}s</strong> → Nhận <strong style={{ color: '#1890ff' }}>50% điểm</strong><br/>
                  • Xem <strong>{minViewingTime100}s</strong> → Nhận <strong style={{ color: '#52c41a' }}>100% điểm</strong>
                </>
              ) : (
                <>
                  • Xem <strong>{minViewingTime100}s</strong> → Nhận <strong style={{ color: '#52c41a' }}>100% điểm</strong>
                </>
              )}
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
    
    // Nếu đã đạt 100% và chưa POST, POST API trước khi đóng
    if (reached100 && !hasPostedRef.current) {
      postToAPIAndClose();
    } 
    // Nếu bật mốc 50% -> đã đạt 50%-99% (có điểm) nhưng chưa POST, POST API với điểm hiện tại
    else if (enable50PercentMilestone && hasEarnedPoints && !hasPostedRef.current && viewingTime >= minViewingTime50) {
      postToAPIAndClose();
    }
    // Nếu tắt mốc 50% -> KHÔNG POST API nếu chưa đủ 100%
    // Nếu chưa đạt mốc HOẶC đã POST rồi, thoát luôn
    else {
      performClose();
    }
  };

  const postToAPIAndClose = async (actualViewingTime = null) => {
    const phoneNumber = localStorage.getItem('phoneNumber');
    const ma_kh_dms = localStorage.getItem('ma_kh_dms') || '';
    
    // Use ref to get current document (avoid stale closure)
    const docToPost = currentDocumentRef.current || currentDocument;
    
    if (!docToPost) {
      console.error('[POST API] No document to post!');
      Modal.error({
        title: '❌ Lỗi',
        content: 'Không tìm thấy thông tin tài liệu',
        okText: 'Đóng',
        centered: true,
        onOk: () => performClose()
      });
      return;
    }
    
    // Use actualViewingTime if provided, otherwise use state (may be stale)
    const currentViewingTime = actualViewingTime !== null ? actualViewingTime : viewingTime;
    
    console.log('[POST API] Using viewingTime:', currentViewingTime, '(actual:', actualViewingTime, 'state:', viewingTime, ')');
    console.log('[POST API] Document:', docToPost.id, docToPost.name);
    
    // ✅ Calculate time_rate based on milestone config
    // If 50% milestone is enabled: 2 tiers (0.5 or 1.0)
    // If 50% milestone is disabled: ONLY 1 tier (1.0 at 100%, 0 otherwise)
    let timeRate = 0;
    if (currentViewingTime >= minViewingTime100) {
      timeRate = 1.0;  // 100%
    } else if (enable50PercentMilestone && currentViewingTime >= minViewingTime50) {
      timeRate = 0.5;  // 50% (only if enabled)
    } else {
      // Không đủ thời gian → 0 điểm
      timeRate = 0;
    }
    
    console.log('[POST API] time_rate:', timeRate, '(viewingTime:', currentViewingTime, 's, enable50%:', enable50PercentMilestone, 'min100:', minViewingTime100, 'min50:', minViewingTime50, ')');
    
    // ❌ Nếu time_rate = 0 (chưa đủ thời gian) → không POST API, thoát luôn
    if (timeRate === 0) {
      console.log('[POST API] time_rate = 0, không đủ thời gian để ghi nhận điểm. Thoát!');
      performClose();
      return;
    }
    
    // Parse base points from document
    let basePoints = 4; // default
    if (docToPost?.points) {
      if (typeof docToPost.points === 'string') {
        basePoints = parseInt(docToPost.points) || 4;
      } else {
        basePoints = docToPost.points;
      }
    }
    console.log('[POST API] Data:', {
      currentViewingTime,
      viewingTimeState: viewingTime,
      minViewingTime50,
      minViewingTime100,
      timeRate,
      basePoints,
      earnedPoints
    });
    
    // Show loading modal
    const loadingModal = Modal.info({
      title: 'Đang lưu điểm...',
      content: 'Vui lòng đợi trong giây lát',
      icon: <LoadingOutlined />,
      okButtonProps: { style: { display: 'none' } },
      centered: true
    });

    hasPostedRef.current = true;
    
    try {
      // POST with full information
      const result = await postViewingHistory(
        ma_kh_dms, 
        phoneNumber, 
        docToPost.id,        // ✅ Use ref document
        currentViewingTime,  // ✅ watch_duration_seconds (actual viewing time)
        timeRate,            // time_rate (dynamic: 0.5 at min50%, 1.0 at min100%)
        basePoints,          // base_point
        Math.floor(basePoints * timeRate) // ✅ effective_point (recalculate)
      );
      
      loadingModal.destroy();
      
      console.log('[POST API] Result:', result);
      
      if (result.success) {
        // Mark as viewed in PointsManager
        if (!hasMarkedViewedRef.current) {
          hasMarkedViewedRef.current = true;
          
          const documentData = {
            document_id: docToPost.id,
            document_name: docToPost.name,
            document_type: docToPost.type,
            points: Math.floor(basePoints * timeRate), // Use calculated points
            ma_kh_dms,
            phone: phoneNumber,
            category: category,
            timestamp: new Date().toISOString()
          };
          
          PointsManager.addEarnedPoint(documentData);
          localStorage.setItem('points_updated', 'true');
        }
        
        // Show success modal with celebration
        const effectivePoints = Math.floor(basePoints * timeRate);
        const successModal = Modal.success({
          title: '🎊 Hoàn thành & Đã ghi nhận điểm!',
          content: (
            <div>
              <p style={{ fontSize: 18, marginBottom: 12, color: '#52c41a', fontWeight: 'bold' }}>
                🏆 Tổng cộng: <span style={{ fontSize: 28 }}>{effectivePoints} điểm</span>
              </p>
              <p style={{ fontSize: 16, marginBottom: 8 }}>
                ✅ Bạn đã xem đủ <strong>100%</strong> thời gian tài liệu
              </p>
              <p style={{ fontSize: 14, color: '#666' }}>
                Điểm đã được lưu vào hệ thống thành công
              </p>
            </div>
          ),
          okText: 'Tuyệt vời!',
          centered: true,
          onOk: () => {
            // Không đóng popup xem tài liệu, chỉ đóng thông báo
            // User có thể tiếp tục xem tài liệu
          }
        });
        
        // Auto close modal sau 5s nếu user không bấm
        setTimeout(() => {
          successModal.destroy();
        }, 5000);
      } else {
        // API failed - Show error message from server
        console.error('[POST API] Failed:', result.reason, result);
        
        // Extract error message (prioritize server message)
        let errorMessage = result.reason || 'Không thể lưu điểm. Vui lòng thử lại sau!';
        
        // Check for specific error types
        if (result.reason === 'no_endpoint') {
          errorMessage = 'Hệ thống chưa được cấu hình. Vui lòng liên hệ quản trị viên.';
        }
        
        Modal.error({
          title: '⚠️ Lỗi ghi nhận điểm',
          content: (
            <div>
              <p style={{ marginBottom: 0 }}>{errorMessage}</p>
              {result.data?.error_message && (
                <p style={{ fontSize: 12, color: '#666', marginTop: 8, marginBottom: 0 }}>
                  Chi tiết: {result.data.error_message}
                </p>
              )}
            </div>
          ),
          okText: 'Đóng',
          centered: true,
          onOk: () => {
            performClose();
          }
        });
      }
    } catch (error) {
      console.error('[POST API] Exception:', error);
      loadingModal.destroy();
      
      Modal.error({
        title: '❌ Lỗi kết nối',
        content: 'Không thể kết nối đến server. Điểm chưa được lưu!',
        okText: 'Đóng',
        centered: true,
        onOk: () => {
          performClose();
        }
      });
    }
  };

  const performClose = () => {
    // Points are already posted to server at 60s mark
    // No need to save to localStorage anymore

    setViewerOpen(false);
    viewerOpenRef.current = false; // ✅ Clear ref
    setCurrentDocument(null);
    currentDocumentRef.current = null; // ✅ Clear ref
    setViewingTime(0);
    setEarnedPoints(0);
    setHearts([]);
    setHeartId(0);
    setConfetti([]);
    setHasReached100Percent(false);
    setHasReached50Percent(false);
    setIsLoading(false);
    setLoadError(false);
    setHasPostedToAPI(false);
    hasPostedRef.current = false; // Reset ref when closing viewer
    hasShown50ModalRef.current = false; // Reset 50% modal flag
    hasShown100ModalRef.current = false; // Reset 100% modal flag
    setLikeCount(0);
    setHasLiked(false);
    setApiStatus('idle'); // Reset API status
    setApiErrorMessage(''); // Clear error message;
    
    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Clear auto POST timeout
    if (autoPostTimeoutRef.current) {
      clearTimeout(autoPostTimeoutRef.current);
      autoPostTimeoutRef.current = null;
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
    if (viewingTime <= minViewingTime50) {
      // 0 to 50% range
      return Math.floor((viewingTime / minViewingTime50) * 50);
    } else if (viewingTime <= minViewingTime100) {
      // 50% to 100% range
      const progressBeyond50 = viewingTime - minViewingTime50;
      const rangeBeyond50 = minViewingTime100 - minViewingTime50;
      return Math.floor(50 + (progressBeyond50 / rangeBeyond50) * 50);
    } else {
      return 100;
    }
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

  const triggerCelebration = (milestone = 50) => {
    // ✅ Use ref to avoid stale closure
    const docToShow = currentDocumentRef.current || currentDocument;
    
    // Parse points - could be "10 điểm" or 10
    let basePoints = 4; // default
    if (docToShow?.points) {
      if (typeof docToShow.points === 'string') {
        basePoints = parseInt(docToShow.points) || 4;
      } else {
        basePoints = docToShow.points;
      }
    }
    
    console.log('[CELEBRATION] Document:', docToShow?.name, 'Base points:', basePoints);
    
    const points50 = Math.floor(basePoints * 0.5);  // 50% points
    const points100 = basePoints;                   // 100% points
    
    console.log('[CELEBRATION] 50% points:', points50, '100% points:', points100);
    
    // Show 50% milestone modal
    Modal.success({
      title: '🎉 Đạt mốc 50%!',
      content: (
        <div>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            Bạn đã xem được <strong>50%</strong> thời gian tài liệu!
          </p>
          <p style={{ fontSize: '18px', color: '#52c41a', fontWeight: 'bold', marginBottom: '0' }}>
            ✅ Nhận được: <span style={{ fontSize: '24px' }}>{points50} điểm</span>
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
            💡 Xem thêm {minViewingTime100 - minViewingTime50} giây nữa để nhận đủ {points100} điểm!
          </p>
        </div>
      ),
      okText: 'Tiếp tục xem',
      centered: true,
    });
    
    createConfetti();
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
        ) : filteredDocuments.length === 0 && documents.length === 0 ? (
          <Card>
            <Empty 
              description={
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#ff4d4f' }}>
                    ⚠️ Danh mục tạm thời không khả dụng
                  </p>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                    Có thể do một trong các lý do sau:
                  </p>
                  <ul style={{ 
                    textAlign: 'left', 
                    display: 'inline-block', 
                    fontSize: 13, 
                    color: '#666',
                    paddingLeft: 20
                  }}>
                    <li>Bạn đã đạt giới hạn xem tài liệu trong tháng này</li>
                    <li>Danh mục đang được cập nhật nội dung mới</li>
                    <li>Hệ thống đang bảo trì</li>
                  </ul>
                  <p style={{ fontSize: 13, color: '#1890ff', marginTop: 12 }}>
                    💡 Vui lòng thử lại vào tháng sau hoặc chọn danh mục khác
                  </p>
                </div>
              }
            />
          </Card>
        ) : filteredDocuments.length === 0 && documents.length > 0 ? (
          <Card>
            <Empty description="Không tìm thấy tài liệu phù hợp với từ khóa tìm kiếm" />
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
                        <Space size={8} align="center">
                          <Text strong>{document.name}</Text>
                          {document.condition === 'new' && (
                            <Tag className="new-label-blink">
                              NEW
                            </Tag>
                          )}
                        </Space>
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
          {apiStatus === 'posting' && viewingTime >= minViewingTime100 && (
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
          {apiStatus === 'error' && viewingTime >= minViewingTime100 && (
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

        </div>
      </Modal>
    </div>
  );
};

export default DocumentListPage;
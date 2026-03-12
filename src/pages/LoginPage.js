import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Input, Button, Alert, Typography, Space, message } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import logo from '../images/logo.png';
import maiImage from '../images/mai.png';
import { trackUserActivity } from '../utils/trackingHelper';
import { googleSheetsService } from '../services/googleSheetsService';
import { CONFIG_EVENTS, onConfigUpdate, reloadConfig } from '../utils/configEvents';
import { getApiToken } from '../utils/tokenHelper';
import apiMonitor from '../services/apiMonitor';
import ReferralModal from '../components/ReferralModal';
import apiHelper from '../utils/apiHelper';

const { Text } = Typography;

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState('');
  const [petals, setPetals] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [userMaKhDms, setUserMaKhDms] = useState('');
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect destination from ?redirect= query param (if any)
  const redirectParam = new URLSearchParams(location.search).get('redirect');

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate falling petals
  useEffect(() => {
    const petalArray = [];
    for (let i = 0; i < 15; i++) { // Tăng số lượng hoa mai
      petalArray.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 10 + Math.random() * 6,
        animationDelay: Math.random() * 8,
        size: 20 + Math.random() * 10,
        opacity: 0.5 + Math.random() * 0.4,
        rotation: Math.random() * 360 // Thêm rotation cho hoa mai
      });
    }
    setPetals(petalArray);
  }, []);

  // 🆕 Auto-fill số điện thoại từ localStorage (nếu đã login trước đó)
  useEffect(() => {
    const savedPhone = localStorage.getItem('phoneNumber');
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
  }, []);

    // Load banner from admin config (localStorage-first for speed)
  useEffect(() => {
    const loadBanner = async () => {
      // 🚀 FAST PATH: Try localStorage first (instant)
      const cachedConfig = reloadConfig('admin_login_page_config');
      
      if (cachedConfig && cachedConfig.bannerImage) {
        setBannerImage(cachedConfig.bannerImage);
      }
      
      // 🔄 BACKGROUND: Update from Google Sheets (cross-device sync)
      // This runs in background without blocking UI
      try {
        const sheetConfig = await googleSheetsService.loadAdminConfig('admin_login_page_config');
        
        if (sheetConfig && sheetConfig.bannerImage) {
          // Only update if different from cached version
          if (cachedConfig?.bannerImage !== sheetConfig.bannerImage) {
            setBannerImage(sheetConfig.bannerImage);
            localStorage.setItem('admin_login_page_config', JSON.stringify(sheetConfig));
          }
        }
      } catch (error) {
        // Failed to load from Google Sheets, using cached version
      }
      
      // If no banner at all
      if (!cachedConfig && !setBannerImage) {
        setBannerImage('');
      }
    };

    // Initial load
    loadBanner();

    // Listen for config updates from admin panel
    const cleanup = onConfigUpdate(CONFIG_EVENTS.LOGIN_PAGE_UPDATED, () => {
      loadBanner();
    });
    
    return cleanup;
  }, []);

  // Handle referral modal close
  const handleReferralModalClose = (submitted) => {
    setShowReferralModal(false);
    
    // Navigate to pending destination after modal closes
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load API config from environment variables
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://bi.meraplion.com/local';
      // Use obfuscated token instead of plain env variable
      const API_TOKEN = getApiToken();
      
      // ✅ STEP 1: Call /get_data/get_nvbc_login/ with GET method
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      let loginResponse;
      try {
        loginResponse = await fetch(`${API_BASE_URL}/get_data/get_nvbc_login/?phone=${phoneNumber.trim()}&test=0`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          setError('⚠️ Kết nối quá chậm. Vui lòng kiểm tra mạng và thử lại!');
          setLoading(false);
          return;
        }
        
        setError('⚠️ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!');
        setLoading(false);
        return;
      }

      // ✅ Check for server errors (500, 503, etc.)
      if (loginResponse.status >= 500) {
        setError('⚠️ Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
        setLoading(false);
        return;
      }

      // ✅ Check for 404
      if (loginResponse.status === 404) {
        setError('⚠️ Hệ thống đang bảo trì. Vui lòng thử lại sau!');
        setLoading(false);
        return;
      }

      // ✅ Parse login response
      let loginData;
      const contentType = loginResponse.headers.get('content-type');
      
      try {
        // Check if response is JSON
        if (contentType && contentType.includes('application/json')) {
          loginData = await loginResponse.json();
        } else {
          // Response is not JSON (HTML error page, CORS blocked, etc.)
          setError('⚠️ Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối mạng!');
          setLoading(false);
          return;
        }
      } catch (parseError) {
        setError('⚠️ Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
        setLoading(false);
        return;
      }

      // ✅ Check if phone exists in system (HTTP 400 = phone not found)
      if (loginResponse.status === 400 || loginData?.mess_error) {
        setError('❌ Số điện thoại chưa được đăng ký trong hệ thống');
        setLoading(false);
        return;
      }

      // ✅ Check if login successful
      if (!loginResponse.ok || !loginData.phone || !loginData.ma_kh_dms) {
        setError('❌ Số điện thoại chưa được đăng ký trong hệ thống');
        setLoading(false);
        return;
      }

      // 🔍 DEBUG: Check login response
      console.log('🔍 [LoginPage] Login Response:', {
        phone: loginData.phone,
        ma_kh_dms: loginData.ma_kh_dms,
        insert_referral: loginData.insert_referral,
        is_valid_invitee: loginData.is_valid_invitee,
        name: loginData.name,
        fullResponse: loginData
      });

      // ✅ STEP 2: Call /get_data/get_nvbc_point/ to get reward status
      const rewardResponse = await fetch(`${API_BASE_URL}/get_data/get_nvbc_point/?phone=${phoneNumber}&test=0`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // ✅ Check reward API errors
      if (rewardResponse.status >= 500) {
        setError('⚠️ Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
        setLoading(false);
        return;
      }

      // ✅ Parse reward response
      let rewardData;
      try {
        rewardData = await rewardResponse.json();
      } catch (parseError) {
        setError('⚠️ Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
        setLoading(false);
        return;
      }

      // ✅ Save user data to localStorage (from loginData + rewardData)
      localStorage.setItem('phoneNumber', loginData.phone.trim());
      localStorage.setItem('ma_kh_dms', loginData.ma_kh_dms.toString().trim());
      localStorage.setItem('userName', loginData.name || 'Quý Dược sĩ');
      localStorage.setItem('authToken', API_TOKEN);
      
      // ✅ Merge is_valid_invitee from both APIs (prioritize loginData from new API)
      const isValidInvitee = loginData.is_valid_invitee !== undefined 
        ? loginData.is_valid_invitee 
        : (rewardData.is_valid_invitee || false);
      
      // ✅ Save reward status to localStorage (from rewardData + loginData)
      const rewardStatus = {
        show_reward_selection: rewardData.show_reward_selection || false,
        th_monthly_reward: rewardData.th_monthly_reward || false,
        product_expert_reward: rewardData.product_expert_reward || false,
        avid_reader_reward: rewardData.avid_reader_reward || false,
        point: rewardData.point || 0,
        is_valid_invitee: isValidInvitee
      };
      localStorage.setItem('rewardStatus', JSON.stringify(rewardStatus));
      
      // Track login activity
      trackUserActivity(phoneNumber, 'login', { success: true });
      
      // Track login to Google Sheets
      googleSheetsService.trackLogin({
        phoneNumber: phoneNumber,
        userName: loginData.name || 'Quý Dược sĩ',
        ma_kh_dms: loginData.ma_kh_dms,
        loginMethod: 'phone',
        timestamp: new Date().toISOString()
      }).catch(err => {
        // Failed to track login
      });
      
      message.success('Đăng nhập thành công!');
      
      // ✅ Check if user needs to enter referral phone
      // Only show referral modal if: is_valid_invitee === true
      console.log('🔍 [LoginPage] Checking referral:', {
        point: rewardData.point,
        is_valid_invitee_from_login: loginData.is_valid_invitee,
        is_valid_invitee_from_reward: rewardData.is_valid_invitee,
        is_valid_invitee_merged: isValidInvitee,
        shouldShowReferral: isValidInvitee === true,
        ma_kh_dms: loginData.ma_kh_dms,
        phone: loginData.phone
      });

      if (isValidInvitee === true) {
        // Valid invitee - show referral modal
        console.log('✅ [LoginPage] is_valid_invitee = true, showing referral modal');
        setUserMaKhDms(loginData.ma_kh_dms);
        setShowReferralModal(true);
        
        // Save navigation destination to redirect after modal
        // Priority: ?redirect= param > show_reward_selection logic
        if (redirectParam) {
          setPendingNavigation(redirectParam);
        } else if (rewardData.show_reward_selection === true) {
          setPendingNavigation('/reward-selection');
        } else {
          setPendingNavigation('/introduction');
        }
      } else {
        // Skip referral modal and navigate directly
        console.log('ℹ️ [LoginPage] is_valid_invitee = false, skip referral modal');
        
        // Priority: ?redirect= param > show_reward_selection logic
        if (redirectParam) {
          navigate(redirectParam);
        } else if (rewardData.show_reward_selection === true) {
          navigate('/reward-selection');
        } else {
          navigate('/introduction');
        }
      }
    } catch (err) {
      // ✅ Network error or timeout
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('⚠️ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
      } else {
        setError('⚠️ Hệ thống đang gặp sự cố. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fallAnimation {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(120vh) rotate(720deg);
          }
        }
        
        @keyframes swayAnimation {
          0%, 100% {
            margin-left: 0px;
          }
          50% {
            margin-left: 80px;
          }
        }
        
        @keyframes rotateAnimation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .falling-petal {
          position: fixed !important;
          top: -100px !important;
          pointer-events: none !important;
          z-index: 9999 !important;
          will-change: transform !important;
          filter: drop-shadow(0 2px 4px rgba(255,215,0,0.4)) !important;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          body {
            background: linear-gradient(135deg, #00b4a5 0%, #00d9c8 50%, #56CCF2 100%) !important;
          }
          
          .login-container {
            background: linear-gradient(135deg, #00b4a5 0%, #00d9c8 50%, #56CCF2 100%) !important;
            background-image: none !important; /* Bỏ background image trên mobile */
          }
        }

        @media (min-width: 769px) {
          .login-container {
            justify-content: flex-end !important;
          }
          .login-card {
            margin-right: 60px !important;
            margin-left: 0 !important;
          }
        }
      `}} />

      {/* Falling Petals - Outside main container */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="falling-petal"
          style={{
            left: `${petal.left}%`,
            fontSize: `${petal.size}px`,
            opacity: petal.opacity,
            animation: `fallAnimation ${petal.animationDuration}s linear ${petal.animationDelay}s infinite, swayAnimation ${petal.animationDuration * 0.5}s ease-in-out ${petal.animationDelay}s infinite`
          }}
        >
          🌸
        </div>
      ))}

      <div 
      className="login-container"
      style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: isMobile 
        ? 'linear-gradient(135deg, #00b4a5 0%, #00d9c8 50%, #56CCF2 100%)' 
        : (bannerImage 
          ? `url(${bannerImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #00b4a5 0%, #00d9c8 50%, #56CCF2 100%)'),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Hình mai góc phải trên */}
      <img 
        src={maiImage} 
        alt="Mai"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: isMobile ? '240px' : '400px',
          height: 'auto',
          zIndex: 5,
          opacity: 0.9,
          pointerEvents: 'none'
        }}
      />
      
      {/* Overlay để làm tối background một chút (optional) - CHỈ HIỂN THỊ TRÊN DESKTOP */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.05)',
          zIndex: 1
        }} />
      )}

      {/* Login Box - Centered and Responsive */}
      <Card
        className="login-card"
        bordered={false}
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '420px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: '20px',
          padding: isMobile ? '30px 20px' : '40px 30px', // Responsive padding
          margin: '0' // Reset margin, sẽ dùng CSS media query
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logo} alt="MerapLion Logo" style={{ 
            width: window.innerWidth <= 768 ? '120px' : '160px', // Nhỏ hơn trên mobile
            height: 'auto',
            marginBottom: '20px'
          }} />
          <Text style={{ 
            display: 'block',
            fontSize: window.innerWidth <= 768 ? '12px' : '13px', // Nhỏ hơn trên mobile
            color: '#666',
            marginTop: '12px',
            padding: '0 10px' // Thêm padding cho text dài
          }}>
            *Vui lòng nhập SĐT cho lần đăng nhập đầu tiên
          </Text>
        </div>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {error && (
            <Alert message={error} type="error" closable onClose={() => setError('')} />
          )}

          <Input
            size="large"
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            prefix={<PhoneOutlined style={{ color: '#56CCF2' }} />}
            onPressEnter={handleLogin}
            style={{
              borderRadius: '10px',
              border: '1px solid #e0e0e0',
              height: '50px',
              fontSize: '16px' // Phải >= 16px để tránh auto-zoom trên iOS
            }}
          />

          <Button
            type="primary"
            size="large"
            block
            onClick={handleLogin}
            loading={loading}
            style={{
              background: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
              border: 'none',
              fontWeight: 'bold',
              height: '52px',
              borderRadius: '10px',
              marginTop: '12px',
              fontSize: '16px'
            }}
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button 
              type="link" 
              onClick={() => window.open('https://zalo.me/3074930777790996566', '_blank')}
              style={{ color: '#00D9FF', padding: 0, fontWeight: '600', fontSize: '14px' }}
            >
              Liên hệ CSKH
            </Button>
          </div>
        </Space>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '11px',
          color: '#999'
        }}>
          Copyright © MerapLion
        </div>
      </Card>

      {/* Referral Modal for New Users */}
      <ReferralModal
        visible={showReferralModal}
        onClose={handleReferralModalClose}
        userPhone={phoneNumber}
        userMaKhDms={userMaKhDms}
      />
    </div>
    </>
  );
};

export default LoginPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Row, Col, Badge, Spin, Alert, Modal, Empty, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, CheckCircleOutlined, GiftOutlined, TrophyOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { trackUserActivity } from '../utils/trackingHelper';
import rewardApiService from '../services/rewardApiService';
import '../styles/RewardSelection.css';

const { Title, Text, Paragraph } = Typography;

const RewardSelectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewardData, setRewardData] = useState(null);
  const [availableGifts, setAvailableGifts] = useState({});
  const [selectedGifts, setSelectedGifts] = useState({});
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadRewardData();
    };
    loadData();
    // Hide celebration animation after 2 seconds
    const timer = setTimeout(() => setShowCelebration(false), 2000);
    return () => clearTimeout(timer);
  }, []); // loadRewardData is stable, no need to include

  const loadRewardData = async () => {
    setLoading(true);
    setError('');

    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const authToken = localStorage.getItem('authToken');

      if (!phoneNumber || !authToken) {
        setError('Vui lòng đăng nhập để xem thông báo thưởng');
        setLoading(false);
        return;
      }

      // ✅ CHECK: User already submitted? Check if within display period (3 days)
      const submittedData = localStorage.getItem(`reward_submitted_${phoneNumber}`);
      if (submittedData) {
        try {
          const parsed = JSON.parse(submittedData);
          const submittedTimestamp = parsed.timestamp;
          const now = Date.now();
          const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
          
          // Check if submission is within 3 days
          if (submittedTimestamp && (now - submittedTimestamp) < threeDaysInMs) {
            // Still within 3-day display period - show "Already selected" message
            console.log('⚠️ User submitted within last 3 days - showing confirmation message');
            setRewardData({ 
              show_reward_selection: false, 
              submitted_recently: true,
              submitted_at: parsed.submittedAt 
            });
            setLoading(false);
            return;
          } else {
            // More than 3 days passed - clear flag and show normal flow
            console.log('✅ Submission was >3 days ago - clearing flag and continuing');
            localStorage.removeItem(`reward_submitted_${phoneNumber}`);
          }
        } catch (e) {
          // Old format (just 'true') - treat as expired
          console.log('⚠️ Old submission format detected - clearing');
          localStorage.removeItem(`reward_submitted_${phoneNumber}`);
        }
      }

      // ✅ Try to get real API data
      console.log('🔍 Testing API - Getting reward status...');
      console.log('📞 Phone:', phoneNumber);
      
      try {
        const apiData = await rewardApiService.getRewardStatus(phoneNumber);
        console.log('✅ API Response:', apiData);
        console.log('📊 API Fields:', Object.keys(apiData));
        
        // Check required fields
        if (apiData.show_reward_selection !== undefined) {
          console.log('✅ show_reward_selection:', apiData.show_reward_selection);
        } else {
          console.warn('⚠️ Missing: show_reward_selection');
        }
        
        if (apiData.th_monthly_reward !== undefined) {
          console.log('✅ th_monthly_reward:', apiData.th_monthly_reward);
        } else {
          console.warn('⚠️ Missing: th_monthly_reward');
        }
        
        if (apiData.product_expert_reward !== undefined) {
          console.log('✅ product_expert_reward:', apiData.product_expert_reward);
        } else {
          console.warn('⚠️ Missing: product_expert_reward');
        }
        
        if (apiData.avid_reader_reward !== undefined) {
          console.log('✅ avid_reader_reward:', apiData.avid_reader_reward);
        } else {
          console.warn('⚠️ Missing: avid_reader_reward');
        }
        
        setRewardData(apiData);
        loadAvailableGifts(apiData); // Pass API data
        setLoading(false);
        
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        console.log('⚠️ API call failed - showing not available message');
        
        // ✅ If API fails, show proper "not available" message
        const fallbackData = {
          show_reward_selection: false,
          fail_show_reward_selection: true,
          point: 0
        };
        setRewardData(fallbackData);
        
        // ✅ Still load gifts for viewing (even if can't select)
        loadAvailableGifts(fallbackData); // Pass fallback data
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading reward data:', err);
      setError('Không thể tải thông tin thưởng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const loadAvailableGifts = (apiDataParam) => {
    // Use passed parameter or state
    const apiData = apiDataParam || rewardData;
    
    // Load gifts from admin introduction config
    const introConfig = localStorage.getItem('admin_introduction_config');
    if (introConfig) {
      const config = JSON.parse(introConfig);
      const awards = config.awards || [];

      // ✅ Get API gift lists (list_chon_monthly, list_chon_dgcc, list_chon_cgsp)
      const apiGiftLists = {
        th_monthly_reward: apiData?.list_chon_monthly || [],
        product_expert_reward: apiData?.list_chon_cgsp || [], // ← FIXED: cgsp = Chuyên gia sản phẩm
        avid_reader_reward: apiData?.list_chon_dgcc || [],    // ← FIXED: dgcc = Độc giả chăm chỉ
        // Also map by API field names directly for flexibility
        list_chon_monthly: apiData?.list_chon_monthly || [],
        list_chon_dgcc: apiData?.list_chon_dgcc || [],
        list_chon_cgsp: apiData?.list_chon_cgsp || []
      };

      console.log('🎁 API Gift Lists:', apiGiftLists);

      // Mapping from list_chon_xxx to th_monthly_reward flags (for checking if user qualifies)
      const rewardKeyToFlagMapping = {
        'list_chon_monthly': 'th_monthly_reward',
        'list_chon_cgsp': 'product_expert_reward',  // Chuyên gia sản phẩm
        'list_chon_dgcc': 'avid_reader_reward'      // Độc giả chăm chỉ
      };

      // Valid reward keys
      const validRewardKeys = [
        'th_monthly_reward', 
        'product_expert_reward', 
        'avid_reader_reward',
        'list_chon_monthly',
        'list_chon_dgcc',
        'list_chon_cgsp'
      ];

      // ✅ NEW: Dynamic mapping using reward_key from admin config
      const giftsMap = {};
      const rewardMetadata = {}; // Store title, icon, description
      
      awards.forEach(award => {
        let shouldProcess = true;
        let rewardKey = award.reward_key;
        
        // Check if reward_key is provided and valid
        if (award.reward_key) {
          if (!validRewardKeys.includes(award.reward_key)) {
            console.error(`❌ [RewardSelection] Invalid reward_key: "${award.reward_key}" in "${award.title}"`);
            console.error(`  → Expected one of:`, validRewardKeys);
            console.error(`  → Skipping this award (no gifts will be shown)`);
            shouldProcess = false; // Don't process invalid keys
          }
        } else {
          // No reward_key - try fallback
          console.warn(`⚠️ [RewardSelection] No reward_key for "${award.title}", trying fallback mapping`);
          const title = award.title.toLowerCase();
          
          if (title.includes('tích cực') || title.includes('tháng')) {
            rewardKey = 'th_monthly_reward';
          } else if (title.includes('chuyên gia')) {
            rewardKey = 'product_expert_reward';
          } else if (title.includes('đọc giả') || title.includes('chăm chỉ')) {
            rewardKey = 'avid_reader_reward';
          }
          
          if (rewardKey) {
            console.warn(`  → Using fallback: "${rewardKey}"`);
          } else {
            console.warn(`  → No fallback found, skipping`);
            shouldProcess = false;
          }
        }
        
        // Only process if we have a valid rewardKey
        if (shouldProcess && rewardKey) {
          // ✅ Check if user qualifies for this reward type
          // If admin uses list_chon_xxx, map it to the flag
          const flagToCheck = rewardKeyToFlagMapping[rewardKey] || rewardKey;
          const userQualifies = apiData?.[flagToCheck] === true;
          
          if (!userQualifies) {
            console.log(`⚠️ [RewardSelection] User does not qualify for "${rewardKey}" (${flagToCheck} = ${apiData?.[flagToCheck]})`);
            shouldProcess = false;
          }
        }
        
        // Only process if user qualifies and has valid reward key
        if (shouldProcess && rewardKey) {
          // Get allowed gift names from API
          const allowedGiftValues = (apiGiftLists[rewardKey] || []).map(item => {
            // Normalize: trim, lowercase, replace special dashes
            return (item.value || '')
              .trim()
              .toLowerCase()
              .replace(/[\u2013\u2014\u2015]/g, '-') // Replace em-dash, en-dash with hyphen
              .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
          });
          
          console.log(`🔍 Filtering ${rewardKey}:`, {
            adminGifts: award.gifts?.length || 0,
            allowedValues: allowedGiftValues
          });

          // Filter admin gifts - only keep gifts with name matching API values
          const filteredGifts = (award.gifts || []).filter(gift => {
            const giftNameNormalized = (gift.name || '')
              .trim()
              .toLowerCase()
              .replace(/[\u2013\u2014\u2015]/g, '-') // Replace em-dash, en-dash with hyphen
              .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
            
            const isAllowed = allowedGiftValues.includes(giftNameNormalized);
            
            if (!isAllowed) {
              console.log(`  ❌ Filtered out: "${gift.name}" (not in API list)`);
              console.log(`    → Normalized: "${giftNameNormalized}"`);
              console.log(`    → Allowed values:`, allowedGiftValues);
            } else {
              console.log(`  ✅ Allowed: "${gift.name}"`);
            }
            return isAllowed;
          });

          // Map filtered gifts by reward_key
          giftsMap[rewardKey] = filteredGifts;
          
          // ✅ ALSO map by flag name for UI rendering (if using list_chon_xxx key)
          if (rewardKeyToFlagMapping[rewardKey]) {
            const flagName = rewardKeyToFlagMapping[rewardKey];
            giftsMap[flagName] = filteredGifts;
          }
          
          // Store metadata for display (without icons)
          rewardMetadata[rewardKey] = {
            title: award.title,
            description: award.description
          };
        }
      });

      setAvailableGifts(giftsMap);
      
      // Store metadata in state (add new state if needed)
      window.rewardMetadata = rewardMetadata; // Temporary global storage
      
      console.log('✅ Available gifts (filtered by API):', giftsMap);
      console.log('✅ Reward metadata:', rewardMetadata);
    }
  };

  const handleSelectGift = (rewardType, gift) => {
    setSelectedGifts({
      ...selectedGifts,
      [rewardType]: gift
    });
  };

  const handleSubmitSelection = () => {
    // ✅ NEW: Dynamic check - Get enabled rewards from API response
    const rewardTypes = [];
    
    // Loop through all keys in rewardData (except show_reward_selection and point)
    Object.keys(rewardData).forEach(key => {
      if (key !== 'show_reward_selection' && key !== 'point' && rewardData[key] === true) {
        rewardTypes.push(key);
      }
    });

    const allSelected = rewardTypes.every(type => selectedGifts[type]);

    if (!allSelected) {
      message.warning('Vui lòng chọn quà cho tất cả các giải thưởng');
      return;
    }

    // Confirmation dialog with Modal
    const giftsList = rewardTypes.map(type => 
      `${getRewardTitle(type)}: ${selectedGifts[type].name}`
    );
    
    Modal.confirm({
      title: '⚠️ XÁC NHẬN LỰA CHỌN',
      icon: <GiftOutlined />,
      content: (
        <div>
          <Paragraph>Bạn đã chọn:</Paragraph>
          <ul>
            {giftsList.map((gift, idx) => (
              <li key={idx}>{gift}</li>
            ))}
          </ul>
          <Alert
            message="Lưu ý"
            description="Sau khi xác nhận, bạn sẽ KHÔNG THỂ thay đổi lựa chọn."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => submitGiftSelection(rewardTypes),
    });
  };

  const submitGiftSelection = async (rewardTypes) => {
    try {
      const phoneNumber = localStorage.getItem('phoneNumber');
      const userName = localStorage.getItem('userName') || '';
      const ma_kh_dms = localStorage.getItem('ma_kh_dms') || '';
      
      // Vietnam timezone (UTC+7) - format: YYYY-MM-DDTHH:mm:ss.SSS (no Z)
      // toISOString() returns UTC, so we add 7 hours offset to get VN time
      const now = new Date();
      const vnOffset = 7 * 60 * 60 * 1000; // UTC+7
      const vietnamTime = new Date(now.getTime() + vnOffset).toISOString().slice(0, -1); // Remove 'Z'
      
      // 🆕 POST reward data to external API FIRST (most important)
      const rewardApiData = {
        phone: phoneNumber,
        monthlyReward: selectedGifts['th_monthly_reward']?.name || '',
        dgccReward: selectedGifts['product_expert_reward']?.name || '',
        cgspReward: selectedGifts['avid_reader_reward']?.name || '',
        rewardEvent: rewardData.reward_event || ''  // e.g., "12_25_th_monthly_reward"
      };
      
      console.log('📤 Posting reward selection to external API...');
      const apiResult = await rewardApiService.postRewardSelection(rewardApiData);
      
      if (apiResult.success) {
        console.log('✅ Posted reward data to external API successfully');
        
        // 🆕 POST to Google Sheets after API success
        console.log('📤 Syncing to Google Sheets...');
        const googleSheetEndpoint = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
        
        if (googleSheetEndpoint) {
          try {
            const sheetPayload = {
              syncType: 'reward_selection',
              ma_kh_dms: ma_kh_dms,
              phone: phoneNumber,
              user_name: userName,
              value: selectedGifts['th_monthly_reward']?.name || '',
              value1: selectedGifts['product_expert_reward']?.name || '',
              value2: selectedGifts['avid_reader_reward']?.name || '',
              inserted_at: vietnamTime  // Format: 2025-10-09T15:41:35.773 (no Z)
            };
            
            await fetch(googleSheetEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sheetPayload),
              mode: 'no-cors'
            });
            
            console.log('✅ Synced reward selection to Google Sheets');
          } catch (sheetError) {
            console.warn('⚠️ Failed to sync to Google Sheets:', sheetError);
          }
        }
      } else {
        console.warn('⚠️ Failed to post reward data:', apiResult.error);
      }
      
      // ⚡ MINIMAL localStorage save - API POST is primary, localStorage is just backup
      // Only save minimal data (no full gift objects with images)
      const minimalSelection = {
        phone: phoneNumber,
        timestamp: vietnamTime, // Use same timestamp as API
        month: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' }),
        // Only save gift NAMES, not full objects (avoid base64 images)
        selections: Object.keys(selectedGifts).reduce((acc, key) => {
          acc[key] = { name: selectedGifts[key]?.name || '' };
          return acc;
        }, {}),
        point: rewardData.point || 0
      };
      
      try {
        // Get existing and limit to last 5 only
        let existingSelections = JSON.parse(localStorage.getItem('reward_selections') || '[]');
        if (existingSelections.length >= 5) {
          existingSelections = existingSelections.slice(-4); // Keep last 4
        }
        existingSelections.push(minimalSelection);
        localStorage.setItem('reward_selections', JSON.stringify(existingSelections));
        console.log('✅ Saved minimal data to localStorage (backup)');
      } catch (e) {
        // If quota exceeded, skip localStorage (API POST is primary anyway)
        console.warn('⚠️ localStorage quota exceeded - skipping backup (API POST succeeded)');
      }
      
      // Track gift selection activity
      trackUserActivity(phoneNumber, 'select_gift', {
        gifts: selectedGifts,
        totalRewards: rewardTypes.length
      });
      
      console.log('✅ Gift selections saved (API POST + localStorage backup)');
      
      // ✅ MARK as submitted with timestamp (for 2-4 days display)
      const submissionData = {
        submitted: true,
        timestamp: Date.now(), // Current timestamp in milliseconds
        submittedAt: new Date().toISOString() // Human readable
      };
      localStorage.setItem(`reward_submitted_${phoneNumber}`, JSON.stringify(submissionData));
      console.log('🔒 Locked reward selection with timestamp - will show "Đã chọn quà" for 3 days');
      
      message.success('✅ Đã lưu lựa chọn quà tặng của bạn! Chúng tôi sẽ liên hệ để giao quà sớm nhất.', 3);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Error saving selections:', err);
      message.error('Có lỗi xảy ra khi lưu lựa chọn. Vui lòng thử lại!');
    }
  };

  const getRewardTitle = (type) => {
    // ✅ NEW: Get title from metadata (loaded from admin config)
    const metadata = window.rewardMetadata || {};
    
    if (metadata[type]) {
      return metadata[type].title || type;
    }
    
    // ⚠️ Fallback: Old hardcoded titles (for backward compatibility)
    switch (type) {
      case 'th_monthly_reward':
        return 'Thành viên tích cực nhất tháng';
      case 'product_expert_reward':
        return 'Chuyên gia sản phẩm';
      case 'avid_reader_reward':
        return 'Đọc giả chăm chỉ';
      default:
        return type; // Show reward_key if no metadata found
    }
  };

  if (loading) {
    return (
      <div className="full-height" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Space direction="vertical" align="center" style={{ color: 'white' }}>
          <GiftOutlined style={{ fontSize: 48 }} />
          <Spin size="large" />
          <Text style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>
            Đang tải thông tin thưởng...
          </Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-height" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <div style={{ fontSize: 64 }}>😊</div>
              <Title level={4}>{error}</Title>
              <Paragraph type="secondary">
                Tiếp tục tích điểm để nhận được thưởng vào tháng sau!
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/dashboard')}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Về Dashboard
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ NEW: Dynamic reward types based on API response
  const rewardTypes = [];
  if (rewardData) {
    Object.keys(rewardData).forEach(key => {
      // Skip non-reward keys
      if (key !== 'show_reward_selection' && key !== 'point' && rewardData[key] === true) {
        rewardTypes.push(key);
      }
    });
  }

  // ✅ Check if user can select rewards
  const canSelectRewards = rewardData?.show_reward_selection === true;
  const userName = localStorage.getItem('userName') || 'Quý Dược sĩ';
  const userPoint = rewardData?.point || 0;

  // ✅ Check if user submitted recently (within 3 days)
  const submittedRecently = rewardData?.submitted_recently === true;

  // ✅ If show_reward_selection = false → Show info page
  if (!canSelectRewards) {
    return (
      <div className="full-height" style={{ backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 20px 40px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{
              position: 'absolute',
              left: '15px',
              top: '20px',
              color: 'white',
              fontSize: '20px'
            }}
          />
          <GiftOutlined style={{ fontSize: 48, marginBottom: 12 }} />
          <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
            Giải Thưởng
          </Title>
          <Text style={{ fontSize: 15, color: 'white', opacity: 0.95 }}>
            Điểm hiện tại: {userPoint}
          </Text>
        </div>

        {/* Content */}
        <div className="container" style={{ marginTop: '20px', paddingBottom: '100px' }}>
          <Card style={{ marginBottom: 20, textAlign: 'center' }}>
            {submittedRecently ? (
              // ✅ Show "Already selected" message (within 3 days of submission)
              <>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                <Title level={4}>Bạn đã chọn quà tặng rồi!</Title>
                <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
                  Cảm ơn bạn đã tham gia. Chúng tôi sẽ liên hệ để giao quà sớm nhất.
                </Paragraph>
                {rewardData.submitted_at && (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Đã chọn lúc: {new Date(rewardData.submitted_at).toLocaleString('vi-VN')}
                  </Text>
                )}
              </>
            ) : (
              // ✅ Show "Not announced yet" message (normal case)
              <>
                <TrophyOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
                <Title level={4}>Danh sách quà lần này dành cho {userName}</Title>
                <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
                  Chưa được công bố. Hãy tiếp tục hoạt động thật nhiều để nâng điểm số và nhận được các giải thưởng hấp dẫn!
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    icon={<UnorderedListOutlined />}
                    onClick={() => navigate('/introduction')}
                    size="large"
                    className="gradient-purple-button"
                    style={{
                      border: 'none',
                      borderRadius: '8px',
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: '500',
                      minWidth: '240px',
                      color: 'white'
                    }}
                  >
                    Xem danh sách quà tặng
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* Show all configured rewards from admin */}
          {Object.keys(availableGifts).map((rewardKey) => {
            const metadata = window.rewardMetadata?.[rewardKey] || {};
            const gifts = availableGifts[rewardKey] || [];
            
            return (
              <Card 
                key={rewardKey} 
                title={metadata.title || rewardKey}
                style={{ marginBottom: 16 }}
              >
                {metadata.description && (
                  <Paragraph style={{ color: '#666', marginBottom: 16 }}>
                    {metadata.description}
                  </Paragraph>
                )}
                {gifts.length > 0 ? (
                  <Row gutter={[12, 12]}>
                    {gifts.map((gift, idx) => (
                      <Col xs={12} sm={8} md={6} key={idx}>
                        <Card
                          cover={
                            <img 
                              src={gift.image} 
                              alt={gift.name}
                              style={{ height: 120, objectFit: 'cover' }}
                            />
                          }
                          styles={{ body: { padding: 8 } }}
                        >
                          <Text strong style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                            {gift.name}
                          </Text>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty 
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">Chưa có quà nào</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Quà chưa được cấu hình hoặc không có trong danh sách cho phép
                        </Text>
                      </Space>
                    } 
                  />
                )}
              </Card>
            );
          })}

          {/* Action Button */}
          <div style={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            padding: '16px',
            backgroundColor: 'white',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 100
          }}>
            <div className="container">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => navigate('/dashboard')}
                style={{
                  height: 54,
                  fontSize: 17,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Tiếp tục hoạt động
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ If show_reward_selection = true → Show reward selection page
  return (
    <div className="full-height" style={{ backgroundColor: '#f5f5f5', paddingBottom: '80px' }}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10%',
                left: `${Math.random() * 100}%`,
                fontSize: '30px',
                animation: `fall ${2 + Math.random() * 2}s linear`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            >
              {['🎉', '🎊', '✨', '🎁', '⭐'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px 40px',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
          style={{
            position: 'absolute',
            left: '15px',
            top: '20px',
            color: 'white',
            fontSize: '20px'
          }}
        />
        <TrophyOutlined style={{ 
          fontSize: 48, 
          marginBottom: 12,
          animation: showCelebration ? 'bounce 1s ease-in-out' : 'none'
        }} />
        <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
          Chúc mừng bạn!
        </Title>
        <Text style={{ fontSize: 15, color: 'white', opacity: 0.95 }}>
          Bạn đã đạt được {rewardTypes.length} giải thưởng trong tháng này
        </Text>
      </div>

      <div className="container" style={{ marginTop: '20px', paddingBottom: '100px' }}>
        {/* Reward Sections */}
        {rewardTypes.map((type) => {
          const gifts = availableGifts[type] || []; // Default to empty array
          const hasGifts = gifts.length > 0;
          
          return (
            <Card key={type} title={getRewardTitle(type)} style={{ marginBottom: 24 }}>
              {hasGifts ? (
                <Row gutter={[16, 16]}>
                  {gifts.map((gift, giftIndex) => {
                  const isSelected = selectedGifts[type]?.name === gift.name;
                  return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={4} key={giftIndex}>
                      <Badge.Ribbon 
                        text={<CheckCircleFilled />}
                        color="green"
                        style={{ display: isSelected ? 'block' : 'none' }}
                      >
                        <Card
                          hoverable
                          onClick={() => handleSelectGift(type, gift)}
                          cover={
                            <img 
                              src={gift.image} 
                              alt={gift.name}
                              style={{ 
                                height: window.innerWidth > 768 ? 160 : 120, 
                                objectFit: 'cover',
                                borderBottom: isSelected ? '3px solid #52c41a' : 'none'
                              }}
                            />
                          }
                          style={{
                            border: isSelected ? '2px solid #52c41a' : '1px solid #d9d9d9',
                            boxShadow: isSelected ? '0 4px 12px rgba(82, 196, 26, 0.3)' : 'none'
                          }}
                        >
                          <Text 
                            strong 
                            style={{ 
                              fontSize: window.innerWidth > 768 ? 14 : 12,
                              display: 'block',
                              textAlign: 'center',
                              color: isSelected ? '#52c41a' : '#000'
                            }}
                          >
                            {gift.name}
                          </Text>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty 
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Chưa có quà nào</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Quà chưa được cấu hình hoặc không có trong danh sách cho phép
                    </Text>
                  </Space>
                } 
              />
            )}
          </Card>
          );
        })}

        {/* Submit Button */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          padding: '16px',
          backgroundColor: 'white',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <div className="container">
            <Button
              type="primary"
              size="large"
              block
              onClick={handleSubmitSelection}
              disabled={rewardTypes.some(type => !selectedGifts[type])}
              icon={rewardTypes.every(type => selectedGifts[type]) && <CheckCircleFilled />}
              style={{
                height: 54,
                fontSize: 17,
                fontWeight: 700,
                background: rewardTypes.every(type => selectedGifts[type])
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : undefined,
                border: 'none'
              }}
            >
              {rewardTypes.every(type => selectedGifts[type]) ? 'Xác nhận lựa chọn' : 'Vui lòng chọn đủ quà'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RewardSelectionPage;

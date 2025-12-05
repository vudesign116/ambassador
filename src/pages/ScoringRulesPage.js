import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { RightOutlined, TrophyOutlined } from '@ant-design/icons';
import banner from '../images/scoring-banner.jpg';
import { googleSheetsService } from '../services/googleSheetsService';

const { Title, Text, Paragraph } = Typography;

const ScoringRulesPage = () => {
  const navigate = useNavigate();
  const [bannerImage, setBannerImage] = useState(banner);
  const [rulesContent, setRulesContent] = useState('');

  // Load configuration from admin (ALWAYS load from Google Sheets)
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // CRITICAL FIX: Always fetch from Google Sheets FIRST
        console.log('🔄 Loading scoring rules from Google Sheets...');
        const sheetConfig = await googleSheetsService.loadAdminConfig('admin_scoring_rules_config');
        
        if (sheetConfig) {
          console.log('✅ Loaded from Google Sheets:', sheetConfig);
          
          // ALWAYS update UI with data from Sheets (even if empty)
          setBannerImage(sheetConfig.bannerImage || banner);
          setRulesContent(sheetConfig.rulesContent || '');
          
          // Update localStorage cache
          localStorage.setItem('admin_scoring_rules_config', JSON.stringify(sheetConfig));
          console.log('📝 Updated localStorage cache');
        } else {
          console.log('ℹ️ No config found in Google Sheets, using defaults');
          // Fallback to localStorage if Sheets returns nothing
          const cachedConfig = localStorage.getItem('admin_scoring_rules_config');
          if (cachedConfig) {
            const config = JSON.parse(cachedConfig);
            setBannerImage(config.bannerImage || banner);
            setRulesContent(config.rulesContent || '');
            console.log('📦 Loaded from localStorage fallback');
          }
        }
      } catch (error) {
        console.error('❌ Failed to load scoring rules config:', error);
        // Fallback to localStorage on error
        const cachedConfig = localStorage.getItem('admin_scoring_rules_config');
        if (cachedConfig) {
          const config = JSON.parse(cachedConfig);
          setBannerImage(config.bannerImage || banner);
          setRulesContent(config.rulesContent || '');
          console.log('📦 Loaded from localStorage (error fallback)');
        }
      }
    };
    
    loadConfig();
  }, []);

  return (
    <div className="full-height scoring-page-bg" style={{ paddingBottom: '80px' }}>
      <div className="scoring-banner">
        <img src={bannerImage} alt="Scoring Rules Banner" className="banner-image" />
      </div>

      <div className="container">
        <Card title={<Space><TrophyOutlined /> Công thức tính điểm</Space>}>
          {/* Debug: Log current state */}
          {console.log('🖼️ Rendering ScoringRulesPage:', {
            bannerImage: bannerImage?.substring(0, 50),
            rulesContent: rulesContent?.substring(0, 100),
            hasRulesContent: !!rulesContent
          })}
          
          {rulesContent ? (
            <div dangerouslySetInnerHTML={{ __html: rulesContent }} />
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Công thức tính điểm trên 1 lượt truy cập:</Title>
                <Text strong style={{ fontSize: 16 }}>
                  Điểm = Tỷ lệ thời gian * Hệ số chủ đề
                </Text>
              </div>

              <Divider />

              <div>
                <Title level={5}>- Tỷ lệ thời gian:</Title>
                <Paragraph>Thời gian tra cứu thư viện được quy đổi theo tỷ lệ sau:</Paragraph>
                <ul>
                  <li>1 giây = 1.67%</li>
                  <li>30 giây = 50%</li>
                  <li>60 giây = 100%</li>
                </ul>
              </div>

              <div>
                <Title level={5}>- Hệ số chủ đề:</Title>
                <Paragraph>
                  Mỗi chủ đề có một hệ số riêng (có thể thay đổi theo thông báo từng quý)
                </Paragraph>
              </div>

              <div>
                <Text strong>
                  Điểm sẽ 5 chủ đề từ ngày 01/07/2025 đến 30/09/2025 như sau:
                </Text>
                <ol style={{ marginTop: 12 }}>
                  <li>Thông tin về MerapLion: + 2 điểm/Video</li>
                  <li>Thông tin sản phẩm:
                    <ul>
                      <li>Tư giới thiệu sản phẩm: +2 điểm/SKU</li>
                      <li>Clip giới thiệu sản phẩm: +2 điểm/Video</li>
                      <li>Hướng dẫn sử dụng sản phẩm: +2 điểm/Video</li>
                    </ul>
                  </li>
                  <li>Thông tin bệnh học: +2 điểm/Video</li>
                  <li>So tay người thầy thuốc: +2 điểm/Chuyên đề</li>
                  <li>Tư vấn cùng chuyên gia: +2 điểm/Video</li>
                </ol>
              </div>

              <div>
                <Title level={5}>- Điểm xét thưởng:</Title>
                <ul>
                  <li>Quà Tháng: Điểm tối thiểu từ 1.000 điểm trở lên.</li>
                  <li>Quà Quý: Điểm tối thiểu từ 3.000 điểm trở lên.</li>
                </ul>
              </div>
            </Space>
          )}
        </Card>
      </div>

      <Button
        type="primary"
        size="large"
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: 48,
          fontWeight: 'bold',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>BẮT ĐẦU</span>
        <RightOutlined style={{ position: 'absolute', right: 16 }} />
      </Button>
    </div>
  );
};

export default ScoringRulesPage;
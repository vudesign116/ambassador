import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, Typography, Card, message, Input } from 'antd';
import { SaveOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import RichTextEditor from '../components/RichTextEditor';
import { compressImage, logStorageUsage } from '../utils/storageHelper';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;

const AdminScoringRulesConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    bannerImage: '',
    rulesContent: ''
  });
  const [loading, setLoading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadConfigFromStorage();
  }, [navigate]);

  const loadConfigFromStorage = async () => {
    const savedConfig = await loadConfig('admin_scoring_rules_config');
    console.log('📥 Loading scoring rules config from Google Sheets');
    if (savedConfig) {
      console.log('✅ Loaded config:');
      console.log('  - Banner:', savedConfig.bannerImage ? savedConfig.bannerImage.substring(0, 100) + '...' : '(empty)');
      console.log('  - Rules:', savedConfig.rulesContent ? savedConfig.rulesContent.substring(0, 100) + '...' : '(empty)');
      console.log('  - Full config:', savedConfig);
      
      setConfig({
        bannerImage: savedConfig.bannerImage || '',
        rulesContent: savedConfig.rulesContent || ''
      });
    } else {
      console.log('ℹ️ No saved config found, using default empty config');
      setConfig({
        bannerImage: '',
        rulesContent: ''
      });
    }
    // Log storage usage
    logStorageUsage();
  };

  // useCallback to prevent re-creating function on every render
  const handleRulesContentChange = useCallback((content) => {
    // Only update if content actually changed to avoid infinite loops
    setConfig(prevConfig => {
      if (prevConfig.rulesContent === content) {
        return prevConfig; // No change, return same object
      }
      return { ...prevConfig, rulesContent: content };
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const configToSave = {
        bannerImage: config.bannerImage || '',
        rulesContent: config.rulesContent || ''
      };
      
      console.log('💾 Saving scoring rules config:');
      console.log('  - Banner:', configToSave.bannerImage ? configToSave.bannerImage.substring(0, 100) + '...' : '(empty)');
      console.log('  - Rules:', configToSave.rulesContent ? configToSave.rulesContent.substring(0, 100) + '...' : '(empty)');
      console.log('  - Full config:', configToSave);
      
      await saveConfig('admin_scoring_rules_config', configToSave);
      
      setLoading(false);
      message.success('✅ Đã lưu cấu hình! (Sync mọi thiết bị)');
      logStorageUsage();
    } catch (error) {
      console.error('Error saving config:', error);
      setLoading(false);
      message.error('Lỗi khi lưu cấu hình!');
    }
  };

  const handleBannerUrlSubmit = async () => {
    if (!bannerUrl.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading(true);
    
    try {
      const result = await processBannerUrl(bannerUrl);
      
      if (result.success) {
        const newConfig = { ...config, bannerImage: result.url };
        setConfig(newConfig);
        await saveConfig('admin_scoring_rules_config', newConfig);
        message.success('✅ Banner URL đã được lưu! (Sync mọi thiết bị)');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving banner URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleBannerUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      // Check file size (max 2MB recommended for Base64 in localStorage)
      if (file.size > 2 * 1024 * 1024) {
        message.warning('Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB để đảm bảo lưu trữ ổn định.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Compress image before saving
          console.log('Original image size:', (reader.result.length / 1024).toFixed(2), 'KB');
          const compressedImage = await compressImage(reader.result, 1200, 0.8);
          console.log('Compressed image size:', (compressedImage.length / 1024).toFixed(2), 'KB');
          
          const newConfig = { ...config, bannerImage: compressedImage };
          setConfig(newConfig);
          
          // Auto-save after upload with error handling
          await saveConfig('admin_scoring_rules_config', newConfig);
          console.log('✅ Banner saved successfully (synced to Google Sheets)');
          logStorageUsage();
          message.success('✅ Banner đã được tải lên! (Sync mọi thiết bị)');
        } catch (error) {
          console.error('Error saving banner:', error);
          message.error('Lỗi khi lưu banner! Ảnh có thể quá lớn. Vui lòng thử ảnh nhỏ hơn.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Quản lý trang Scoring Rules</Title>
        <Text type="secondary">Cấu hình banner và công thức tính điểm</Text>
      </div>

      {/* Banner Section */}
      <Card title="🎯 Scoring Rules Banner" style={{ marginBottom: 24 }}>
        {/* Option 1: Paste URL */}
        <div style={{ marginBottom: 20 }}>
          <Paragraph strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Paragraph>
          <Input.Search
            placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
            value={bannerUrl || (config.bannerImage && config.bannerImage.startsWith('http') ? config.bannerImage : '')}
            onChange={(e) => setBannerUrl(e.target.value)}
            onSearch={handleBannerUrlSubmit}
            enterButton={
              <Button 
                type="primary" 
                icon={<LinkOutlined />}
                loading={urlLoading}
              >
                Lưu URL
              </Button>
            }
            loading={urlLoading}
            size="large"
          />
        </div>

        {/* Option 2: Upload file */}
        <div>
          <Paragraph strong>Option 2: Upload file (localStorage)</Paragraph>
          <Upload
            beforeUpload={() => false}
            onChange={handleBannerUpload}
            maxCount={1}
            listType="picture-card"
            showUploadList={false}
          >
            {config.bannerImage ? (
              <img 
                src={config.bannerImage} 
                alt="Banner Preview" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain'
                }} 
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                <Paragraph type="secondary">Click để upload banner</Paragraph>
                <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
              </div>
            )}
          </Upload>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
            Khuyến nghị: Hình ảnh có tỷ lệ 16:9, kích thước tối thiểu 800x450px, dung lượng tối đa 2MB
          </Text>
        </div>
      </Card>

      {/* Rules Content Section */}
      <Card title="📝 Công thức tính điểm" style={{ marginBottom: 24 }}>
        <RichTextEditor
          value={config.rulesContent || ''}
          onChange={handleRulesContentChange}
          placeholder="Nhập công thức tính điểm và các quy tắc..."
          height="400px"
        />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          Nội dung này sẽ hiển thị chi tiết các quy tắc tính điểm
        </Text>
      </Card>

      <Button
        type="primary"
        size="large"
        icon={<SaveOutlined />}
        onClick={handleSave}
        loading={loading}
        block
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: '48px'
        }}
      >
        Lưu cấu hình
      </Button>
    </div>
  );
};

export default AdminScoringRulesConfig;

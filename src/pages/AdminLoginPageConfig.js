import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, Alert, Typography, Card, message, Progress, Input } from 'antd';
import { SaveOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { handleImageUpload as processImage, checkLocalStorageSpace } from '../utils/imageUtils';
import { CONFIG_EVENTS, dispatchConfigUpdate } from '../utils/configEvents';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;

const AdminLoginPageConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    bannerImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadConfigData();
  }, [navigate]);

  const loadConfigData = async () => {
    // Load from Google Sheets (cross-device) or localStorage (fallback)
    const savedConfig = await loadConfig('admin_login_page_config');
    
    if (savedConfig) {
      setConfig(savedConfig);
      // Load URL if it's an HTTP URL
      if (savedConfig.bannerImage && savedConfig.bannerImage.startsWith('http')) {
        setBannerUrl(savedConfig.bannerImage);
      }
    }
    updateStorageInfo();
  };  const updateStorageInfo = () => {
    const info = checkLocalStorageSpace();
    setStorageInfo(info);
    console.log('📦 localStorage usage:', `${info.usedMB} MB / ${info.totalMB} MB (${info.percentage}%)`);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Save to both localStorage and Google Sheets
    const success = await saveConfig('admin_login_page_config', config);
    
    setTimeout(() => {
      setLoading(false);
      if (success) {
        message.success('✅ Đã lưu cấu hình Login page! (Sync mọi thiết bị)');
      } else {
        message.warning('⚠️ Đã lưu local nhưng chưa sync được Google Sheets');
      }
    }, 500);
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
        
        // Save to both localStorage and Google Sheets
        await saveConfig('admin_login_page_config', newConfig);
        
        message.success(`✅ Banner URL đã được lưu! (Sync mọi thiết bị - ${result.dimensions.width}x${result.dimensions.height}px)`);
        console.log('✅ Banner URL saved:', result.url);
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

  const handleImageUpload = async (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Process image with compression and validation
      const result = await processImage(file, {
        maxSizeKB: 500,  // Max 500KB before compression
        maxWidth: 1200,   // Resize to max 1200px width
        maxHeight: 1200,  // Resize to max 1200px height
        quality: 0.8      // JPEG quality 80%
      });
      
      if (!result.success) {
        message.error(result.error);
        setUploading(false);
        return;
      }
      
      // Save compressed image
      const newConfig = { ...config, bannerImage: result.data };
      setConfig(newConfig);
      
      const configString = JSON.stringify(newConfig);
      console.log(`💾 Saving login page config: ${(configString.length / 1024).toFixed(2)} KB`);
      
      await saveConfig('admin_login_page_config', newConfig);
      console.log('✅ Login page banner saved successfully (synced to Google Sheets)');
      
      // Dispatch event to notify user pages
      dispatchConfigUpdate(CONFIG_EVENTS.LOGIN_PAGE_UPDATED, {
        bannerSize: result.compressedSize,
        timestamp: Date.now()
      });
      
      message.success(
        `✅ Banner đã được lưu! (${result.originalSize}KB → ${result.compressedSize}KB) - Sync mọi thiết bị`
      );
      updateStorageInfo();
      
    } catch (error) {
      console.error('❌ Error uploading banner:', error);
      message.error('Lỗi khi lưu banner! Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Quản lý trang Login</Title>
        <Text type="secondary">Cấu hình banner hiển thị trên trang đăng nhập</Text>
      </div>

      <Card title="🖼️ Banner chính" style={{ marginBottom: 24 }}>
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
            style={{ marginBottom: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <Paragraph strong>Option 2: Upload file (localStorage)</Paragraph>
          
          <Upload
            beforeUpload={() => false}
            onChange={handleImageUpload}
            maxCount={1}
            listType="picture-card"
            showUploadList={false}
            disabled={uploading}
          >
            {config.bannerImage ? (
              <div>
                <img 
                  src={config.bannerImage} 
                  alt="Banner Preview" 
                  style={{ 
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    opacity: uploading ? 0.5 : 1
                  }} 
                />
                {uploading && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: '#1890ff',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    🔄 Đang nén ảnh...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <Paragraph type="secondary">
                  {uploading ? '🔄 Đang xử lý...' : 'Click để upload banner'}
                </Paragraph>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {uploading ? 'Đang nén...' : 'Chọn hình ảnh'}
                </Button>
              </div>
            )}
          </Upload>

          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 12 }}>
            ⚡ Tối đa 500KB, tự động nén và resize xuống 1200px (khuyến nghị: 16:9 hoặc 4:3)
          </Text>
          
          {storageInfo && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                📦 localStorage: {storageInfo.usedMB} MB / {storageInfo.totalMB} MB
              </Text>
              <Progress 
                percent={storageInfo.percentage} 
                size="small"
                status={storageInfo.percentage > 80 ? 'exception' : 'normal'}
                style={{ marginTop: 4 }}
              />
            </div>
          )}
        </div>

        <Alert
          message="Lưu ý"
          description={
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Banner sẽ hiển thị ở đầu trang Login</li>
              <li>Hình ảnh nên có màu sắc phù hợp với thương hiệu</li>
              <li>Đảm bảo hình ảnh rõ nét và chất lượng tốt</li>
              <li>🌐 Khuyến nghị: Dùng Option 1 (URL) để hiển thị trên tất cả thiết bị</li>
            </ul>
          }
          type="info"
          showIcon
        />
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

export default AdminLoginPageConfig;

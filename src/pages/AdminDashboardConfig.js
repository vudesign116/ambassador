import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, Typography, Card, Input, InputNumber, Alert, Image, message } from 'antd';
import { SaveOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;

const AdminDashboardConfig = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([
    { id: 1, name: 'Tân Binh', minPoints: 0, maxPoints: 500, image: '' },
    { id: 2, name: 'Học Giả Trẻ', minPoints: 501, maxPoints: 1000, image: '' },
    { id: 3, name: 'Nhà Nghiên Cứu', minPoints: 1001, maxPoints: 2000, image: '' },
    { id: 4, name: 'Chuyên Gia', minPoints: 2001, maxPoints: 3000, image: '' },
    { id: 5, name: 'Bậc Thầy Tri Thức', minPoints: 3001, maxPoints: 999999, image: '' }
  ]);
  const [saved, setSaved] = useState(false);
  const [badgeUrls, setBadgeUrls] = useState({});
  const [urlLoading, setUrlLoading] = useState({});

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadBadges();
  }, [navigate]);

  const loadBadges = async () => {
    const savedBadges = await loadConfig('admin_badges_config');
    if (savedBadges) {
      setBadges(savedBadges);
    }
  };

  const handleSave = async () => {
    await saveConfig('admin_badges_config', badges);
    message.success('✅ Đã lưu cấu hình badge! (Sync mọi thiết bị)');
  };

  const handleBadgeUrlSubmit = async (badgeId) => {
    const url = badgeUrls[badgeId];
    if (!url || !url.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading({ ...urlLoading, [badgeId]: true });
    
    try {
      const result = await processBannerUrl(url);
      
      if (result.success) {
        const updatedBadges = badges.map(b => 
          b.id === badgeId ? { ...b, image: result.url } : b
        );
        setBadges(updatedBadges);
        await saveConfig('admin_badges_config', updatedBadges);
        message.success(`✅ Badge #${badgeId} URL đã được lưu! (Sync mọi thiết bị)`);
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving badge URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading({ ...urlLoading, [badgeId]: false });
    }
  };

  const handleImageUpload = (badgeId, info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedBadges = badges.map(b => 
          b.id === badgeId ? { ...b, image: reader.result } : b
        );
        setBadges(updatedBadges);
        // Auto-save after upload
        saveConfig('admin_badges_config', updatedBadges);
        message.success(`✅ Badge ${badgeId} đã được cập nhật! (Sync mọi thiết bị)`);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBadge = (badgeId, field, value) => {
    setBadges(badges.map(b => 
      b.id === badgeId ? { ...b, [field]: value } : b
    ));
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>Quản lý trang Dashboard</Title>
        <Text type="secondary">Cấu hình badge images và mức điểm cho từng cấp độ</Text>
      </div>

      <Card title="🏆 Cấu hình Badge Levels" style={{ marginBottom: 24 }}>

        {badges.map((badge, index) => (
          <Card
            key={badge.id}
            type="inner"
            title={`Badge #{badge.id}: ${badge.name}`}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Option 1: Paste URL */}
              <div>
                <Text strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Text>
                <Input.Search
                  placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
                  value={badgeUrls[badge.id] || (badge.image && badge.image.startsWith('http') ? badge.image : '')}
                  onChange={(e) => setBadgeUrls({ ...badgeUrls, [badge.id]: e.target.value })}
                  onSearch={() => handleBadgeUrlSubmit(badge.id)}
                  enterButton={
                    <Button 
                      type="primary" 
                      icon={<LinkOutlined />}
                      loading={urlLoading[badge.id]}
                    >
                      Lưu URL
                    </Button>
                  }
                  loading={urlLoading[badge.id]}
                  size="middle"
                  style={{ marginTop: 8 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 24 }}>
                {/* Option 2: Image Upload */}
                <div>
                  <Text strong>Option 2: Upload file (localStorage)</Text>
                  <Upload
                    beforeUpload={() => false}
                    onChange={(info) => handleImageUpload(badge.id, info)}
                    maxCount={1}
                    listType="picture-card"
                    showUploadList={false}
                    style={{ marginTop: 8 }}
                  >
                    {badge.image ? (
                      <Image 
                        src={badge.image} 
                        alt={badge.name}
                        preview={false}
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                        <Button icon={<UploadOutlined />} size="small">Upload</Button>
                      </div>
                    )}
                  </Upload>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Tên Badge</Text>
                  <Input
                    value={badge.name}
                    onChange={(e) => updateBadge(badge.id, 'name', e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Text strong>Điểm tối thiểu</Text>
                    <InputNumber
                      value={badge.minPoints}
                      onChange={(value) => updateBadge(badge.id, 'minPoints', value)}
                      style={{ width: '100%', marginTop: 8 }}
                      disabled={index === 0}
                    />
                  </div>
                  <div>
                    <Text strong>Điểm tối đa</Text>
                    <InputNumber
                      value={badge.maxPoints}
                      onChange={(value) => updateBadge(badge.id, 'maxPoints', value)}
                      style={{ width: '100%', marginTop: 8 }}
                      disabled={index === badges.length - 1}
                    />
                  </div>
                </div>

                <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
                  Mức điểm: {badge.minPoints} - {badge.maxPoints === 999999 ? '∞' : badge.maxPoints} điểm
                </Paragraph>
              </div>
              </div>
            </div>
          </Card>
        ))}

        <Alert
          message="💡 Hướng dẫn"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Upload hình ảnh badge cho từng cấp độ (khuyến nghị: PNG với nền trong suốt)</li>
              <li>Điểm tối thiểu của badge sau phải bằng điểm tối đa + 1 của badge trước</li>
              <li>Badge cuối cùng không có giới hạn điểm tối đa</li>
              <li>Hình ảnh sẽ được lưu dưới dạng Base64 trong localStorage</li>
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginTop: 20 }}
        />
      </Card>

      <Button
        type="primary"
        size="large"
        icon={<SaveOutlined />}
        onClick={handleSave}
        block
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: '48px'
        }}
      >
        Lưu cấu hình Badge
      </Button>
    </div>
  );
};

export default AdminDashboardConfig;

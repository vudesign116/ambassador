import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Upload, Typography, Card, Form, Input, Modal, List, Image, Popconfirm, Space, message } from 'antd';
import { SaveOutlined, UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import RichTextEditor from '../components/RichTextEditor';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminIntroductionConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    logo: '',
    introText: '',
    awards: []
  });
  const [loading, setLoading] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [awardForm] = Form.useForm();
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftForm, setGiftForm] = useState({ image: '', name: '' });
  const [giftImageUrl, setGiftImageUrl] = useState('');
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
    const savedConfig = await loadConfig('admin_introduction_config');
    console.log('Loading introduction config:', savedConfig);
    if (savedConfig) {
      console.log('Parsed introduction config:', savedConfig);
      setConfig(savedConfig);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await saveConfig('admin_introduction_config', config);
    setLoading(false);
    message.success('✅ Đã lưu cấu hình Introduction page! (Sync mọi thiết bị)');
  };

  const handleLogoUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      // Check file size (max 1MB for logo)
      if (file.size > 1 * 1024 * 1024) {
        message.warning('Logo quá lớn! Vui lòng chọn ảnh nhỏ hơn 1MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const newConfig = { ...config, logo: reader.result };
          setConfig(newConfig);
          
          const configString = JSON.stringify(newConfig);
          console.log('Saving introduction config, size:', (configString.length / 1024).toFixed(2), 'KB');
          
          await saveConfig('admin_introduction_config', newConfig);
          console.log('✅ Logo saved successfully (synced to Google Sheets)');
          message.success('✅ Logo đã được tải lên! (Sync mọi thiết bị)');
        } catch (error) {
          console.error('Error saving logo:', error);
          message.error('Lỗi khi lưu logo! Ảnh có thể quá lớn.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAward = () => {
    setEditingAward(null);
    awardForm.resetFields();
    awardForm.setFieldsValue({ title: '', description: '', gifts: [] });
    setShowAwardModal(true);
  };

  const handleEditAward = (award, index) => {
    setEditingAward(index);
    awardForm.setFieldsValue(award);
    setShowAwardModal(true);
  };

  const handleDeleteAward = async (index) => {
    const updatedAwards = config.awards.filter((_, i) => i !== index);
    const updatedConfig = { ...config, awards: updatedAwards };
    setConfig(updatedConfig);
    await saveConfig('admin_introduction_config', updatedConfig);
    message.success('✅ Đã xóa giải thưởng! (Sync mọi thiết bị)');
  };

  const handleSaveAward = async () => {
    try {
      const values = await awardForm.validateFields();

      let updatedAwards;
      if (editingAward !== null) {
        updatedAwards = config.awards.map((award, i) => 
          i === editingAward ? values : award
        );
        message.success('Cập nhật giải thưởng thành công');
      } else {
        updatedAwards = [...config.awards, values];
        message.success('Thêm giải thưởng thành công');
      }

      const updatedConfig = { ...config, awards: updatedAwards };
      setConfig(updatedConfig);
      await saveConfig('admin_introduction_config', updatedConfig);
      console.log('✅ Saved award with reward_key (synced to Google Sheets):', values.reward_key);
      
      setShowAwardModal(false);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin giải thưởng');
    }
  };

  const handleAddGift = () => {
    setGiftForm({ image: '', name: '' });
    setGiftImageUrl('');
    setShowGiftModal(true);
  };

  const handleGiftUrlSubmit = async () => {
    if (!giftImageUrl.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading(true);
    
    try {
      const result = await processBannerUrl(giftImageUrl);
      
      if (result.success) {
        setGiftForm({ ...giftForm, image: result.url });
        message.success('✅ URL ảnh đã được lưu!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving gift URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleGiftImageUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGiftForm({ ...giftForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGift = () => {
    if (!giftForm.name) {
      message.error('Vui lòng nhập tên quà');
      return;
    }
    const currentGifts = awardForm.getFieldValue('gifts') || [];
    awardForm.setFieldsValue({
      gifts: [...currentGifts, giftForm]
    });
    setShowGiftModal(false);
    message.success('Đã thêm quà');
  };

  const handleDeleteGift = (index) => {
    const currentGifts = awardForm.getFieldValue('gifts') || [];
    awardForm.setFieldsValue({
      gifts: currentGifts.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2}>Quản lý trang Introduction</Title>
          <Text type="secondary">Logo, nội dung giới thiệu và danh sách giải thưởng</Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={loading}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Lưu tất cả
        </Button>
      </div>

      {/* Logo Section */}
      <Card title="📱 M.Ambassador Logo" style={{ marginBottom: 24 }}>
        {/* Option 1: Paste URL */}
        <div style={{ marginBottom: 20 }}>
          <Paragraph strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Paragraph>
          <Input.Search
            placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
            onChange={(e) => setGiftImageUrl(e.target.value)}
            onSearch={async () => {
              if (!giftImageUrl.trim()) {
                message.warning('Vui lòng nhập URL ảnh');
                return;
              }
              setUrlLoading(true);
              try {
                const result = await processBannerUrl(giftImageUrl);
                if (result.success) {
                  const newConfig = { ...config, logo: result.url };
                  setConfig(newConfig);
                  await saveConfig('admin_introduction_config', newConfig);
                  message.success('✅ Logo URL đã được lưu! (Sync mọi thiết bị)');
                } else {
                  message.error(result.error);
                }
              } catch (error) {
                console.error('❌ Error saving logo URL:', error);
                message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
              } finally {
                setUrlLoading(false);
              }
            }}
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
        <div style={{ marginBottom: 16 }}>
          <Paragraph strong>Option 2: Upload file (localStorage)</Paragraph>
          <Upload
            beforeUpload={() => false}
            onChange={handleLogoUpload}
            maxCount={1}
            listType="picture-card"
            showUploadList={false}
          >
            {config.logo ? (
              <img src={config.logo} alt="Logo" style={{ maxHeight: '120px', width: 'auto' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
                <Paragraph type="secondary">Upload M.Ambassador Logo</Paragraph>
                <Button icon={<UploadOutlined />}>Chọn logo</Button>
              </div>
            )}
          </Upload>
        </div>

        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
          Khuyến nghị: Logo PNG hoặc SVG, nền trong suốt, kích thước tối đa 1MB
        </Text>
      </Card>

      {/* Intro Text Section */}
      <Card title="📝 Nội dung giới thiệu" style={{ marginBottom: 24 }}>
        <RichTextEditor
          value={config.introText}
          onChange={(content) => setConfig({ ...config, introText: content })}
          placeholder="Nhập nội dung giới thiệu về chương trình M.Ambassador..."
          height="300px"
        />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          Nội dung này sẽ hiển thị trong card space-y-4 card-small-text
        </Text>
      </Card>

      {/* Awards Section */}
      <Card 
        title="🏆 Danh sách giải thưởng"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAward}>
            Thêm giải thưởng
          </Button>
        }
      >
        <List
          dataSource={config.awards}
          locale={{ emptyText: 'Chưa có giải thưởng nào' }}
          renderItem={(award, index) => (
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => handleEditAward(award, index)}>Sửa</Button>,
                <Popconfirm
                  title="Xóa giải thưởng"
                  description="Bạn có chắc muốn xóa giải thưởng này?"
                  onConfirm={() => handleDeleteAward(index)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <div>
                    {award.icon && <span style={{ marginRight: 8 }}>{award.icon}</span>}
                    <span>{award.title}</span>
                  </div>
                }
                description={
                  <div>
                    <Text code style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
                      Key: {award.reward_key || 'Chưa set'}
                    </Text>
                    <Paragraph ellipsis={{ rows: 2 }}>{award.description}</Paragraph>
                    <Text type="secondary">Số quà: {award.gifts?.length || 0}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Award Modal */}
      <Modal
        title={editingAward !== null ? 'Sửa giải thưởng' : 'Thêm giải thưởng'}
        open={showAwardModal}
        onOk={handleSaveAward}
        onCancel={() => setShowAwardModal(false)}
        okText={editingAward !== null ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={700}
      >
        <Form form={awardForm} layout="vertical">
          <Form.Item
            label="🔑 Reward Key (API Mapping)"
            name="reward_key"
            rules={[
              { required: true, message: 'Vui lòng nhập reward key' },
              { pattern: /^[a-z_]+$/, message: 'Chỉ dùng chữ thường và dấu gạch dưới (VD: th_monthly_reward)' }
            ]}
            tooltip="Key này phải khớp với field trong API response. VD: th_monthly_reward, product_expert_reward, best_active_member"
          >
            <Input placeholder="VD: th_monthly_reward, best_active_member" />
          </Form.Item>

          <Form.Item
            label="📛 Tên giải thưởng (Hiển thị cho user)"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên giải thưởng' }]}
          >
            <Input placeholder="VD: Thành viên tích cực nhất tháng" />
          </Form.Item>

          <Form.Item
            label="🎨 Icon (Emoji)"
            name="icon"
            tooltip="Chọn emoji để hiển thị cạnh tên giải thưởng"
          >
            <Input placeholder="VD: 🎁 🏆 📚 🌟 💎" maxLength={2} />
          </Form.Item>

          <Form.Item
            label="📝 Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Mô tả về giải thưởng" />
          </Form.Item>

          <Form.Item label="Danh sách quà" name="gifts">
            <div>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddGift}
                block
                style={{ marginBottom: 16 }}
              >
                Thêm quà
              </Button>
              <List
                dataSource={awardForm.getFieldValue('gifts') || []}
                locale={{ emptyText: 'Chưa có quà nào' }}
                renderItem={(gift, giftIndex) => (
                  <List.Item
                    actions={[
                      <Button 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteGift(giftIndex)}
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={gift.image && <Image src={gift.image} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />}
                      title={gift.name}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Gift Modal */}
      <Modal
        title="Thêm quà"
        open={showGiftModal}
        onOk={handleSaveGift}
        onCancel={() => setShowGiftModal(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        {/* Option 1: Paste URL */}
        <div style={{ marginBottom: 16 }}>
          <Paragraph strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Paragraph>
          <Input.Search
            placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
            value={giftImageUrl}
            onChange={(e) => setGiftImageUrl(e.target.value)}
            onSearch={handleGiftUrlSubmit}
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
            size="middle"
          />
        </div>

        {/* Option 2: Upload file */}
        <div style={{ marginBottom: 16 }}>
          <Paragraph strong>Option 2: Upload file (localStorage)</Paragraph>
          <Upload
            beforeUpload={() => false}
            onChange={handleGiftImageUpload}
            maxCount={1}
            listType="picture-card"
            showUploadList={false}
          >
            {giftForm.image ? (
              <img src={giftForm.image} alt="Gift" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <div>
          <Paragraph strong>Tên quà *</Paragraph>
          <Input
            placeholder="VD: Laptop Dell XPS"
            value={giftForm.name}
            onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminIntroductionConfig;

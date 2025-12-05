import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Upload, 
  Space,
  Typography,
  Image,
  Tag,
  Popconfirm,
  message
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { processBannerUrl } from '../utils/imageUrlHelper';
import { saveConfig, loadConfig } from '../utils/configSync';

const { Title } = Typography;
const { TextArea } = Input;

const AdminMiniGames = () => {
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [form] = Form.useForm();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const savedGames = await loadConfig('admin_mini_games_config');
    if (savedGames) {
      setGames(savedGames);
    }
  };

  const saveGames = async (updatedGames) => {
    await saveConfig('admin_mini_games_config', updatedGames);
    setGames(updatedGames);
  };

  const handleAdd = () => {
    setEditingGame(null);
    form.resetFields();
    form.setFieldsValue({ available: true, comingSoon: false });
    setShowModal(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    form.setFieldsValue(game);
    setShowModal(true);
  };

  const handleDelete = async (gameId) => {
    const updatedGames = games.filter(g => g.id !== gameId);
    await saveGames(updatedGames);
    message.success('✅ Đã xóa mini game! (Sync mọi thiết bị)');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      let updatedGames;
      if (editingGame) {
        updatedGames = games.map(g => 
          g.id === editingGame.id ? { ...values, id: g.id } : g
        );
        message.success('✅ Cập nhật thành công! (Sync mọi thiết bị)');
      } else {
        const newGame = { ...values, id: Date.now() };
        updatedGames = [...games, newGame];
        message.success('✅ Thêm mini game thành công! (Sync mọi thiết bị)');
      }

      await saveGames(updatedGames);
      setShowModal(false);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin');
    }
  };

  const handleThumbnailUrlSubmit = async () => {
    if (!thumbnailUrl.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    setUrlLoading(true);
    
    try {
      const result = await processBannerUrl(thumbnailUrl);
      
      if (result.success) {
        form.setFieldsValue({ thumbnail: result.url });
        message.success('✅ URL ảnh đã được lưu!');
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('❌ Error saving thumbnail URL:', error);
      message.error('Lỗi khi lưu URL. Vui lòng thử lại.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleImageUpload = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setFieldsValue({ thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 100,
      render: (thumbnail) => (
        <Image
          width={60}
          height={60}
          src={thumbnail || '/placeholder.png'}
          style={{ objectFit: 'cover', borderRadius: 8 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.available ? (
            <Tag color="success">Hoạt động</Tag>
          ) : (
            <Tag color="error">Đã tắt</Tag>
          )}
          {record.comingSoon && <Tag color="warning">Coming Soon</Tag>}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mini game"
            description="Bạn có chắc muốn xóa mini game này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Quản lý Mini Games</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          size="large"
        >
          Thêm Mini Game
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={games}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: 'Chưa có mini game nào. Nhấn "Thêm Mini Game" để tạo mới.'
        }}
      />

      <Modal
        title={editingGame ? 'Sửa Mini Game' : 'Thêm Mini Game Mới'}
        open={showModal}
        onOk={handleSubmit}
        onCancel={() => setShowModal(false)}
        okText={editingGame ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ available: true, comingSoon: false }}
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề game" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả game" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh thumbnail"
            name="thumbnail"
          >
            <div>
              {/* Option 1: Paste URL */}
              <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>Option 1: Paste URL ảnh công khai (Recommended) 🌐</Typography.Text>
                <Input.Search
                  placeholder="https://drive.google.com/... hoặc https://i.imgur.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  onSearch={handleThumbnailUrlSubmit}
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
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* Option 2: Upload file */}
              <div>
                <Typography.Text strong>Option 2: Upload file (localStorage)</Typography.Text>
                <Upload
                  beforeUpload={() => false}
                  onChange={handleImageUpload}
                  maxCount={1}
                  listType="picture-card"
                  style={{ marginTop: 8 }}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </div>

              {form.getFieldValue('thumbnail') && (
                <Image
                  width={200}
                  src={form.getFieldValue('thumbnail')}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Link liên kết"
            name="url"
          >
            <Input placeholder="https://example.com/game" type="url" />
          </Form.Item>

          <Form.Item
            label="Game đang hoạt động"
            name="available"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Hiển thị Coming Soon"
            name="comingSoon"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMiniGames;

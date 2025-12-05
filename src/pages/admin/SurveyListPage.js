import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Switch, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { useSurveys } from '../../hooks/useSurvey';
import surveyService from '../../services/surveyService';
import '../../styles/AdminSurvey.css';

const SurveyListPage = () => {
  const navigate = useNavigate();
  const { surveys, loading, refetch } = useSurveys();
  const [deletingId, setDeletingId] = useState(null);

  const handleToggleStatus = async (surveyId, currentStatus) => {
    const result = await surveyService.toggleSurveyStatus(surveyId, !currentStatus);
    if (result.success) {
      message.success('Cập nhật trạng thái thành công');
      refetch();
    } else {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = (surveyId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa khảo sát này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeletingId(surveyId);
        const result = await surveyService.deleteSurvey(surveyId);
        if (result.success) {
          message.success('Xóa khảo sát thành công');
          refetch();
        } else {
          message.error('Có lỗi xảy ra');
        }
        setDeletingId(null);
      }
    });
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Thời gian',
      key: 'dateRange',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}
          </div>
          <div style={{ fontSize: '12px' }}>
            Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      title: 'Số câu hỏi',
      key: 'questionCount',
      render: (_, record) => record.questions?.length || 0,
      align: 'center',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const now = new Date();
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        const isInDateRange = now >= startDate && now <= endDate;
        
        return (
          <Space direction="vertical" size="small">
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record.id, record.isActive)}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
            {record.isActive && isInDateRange && (
              <Tag color="success">Đang hoạt động</Tag>
            )}
            {record.isActive && !isInDateRange && (
              <Tag color="warning">Ngoài thời gian</Tag>
            )}
            {!record.isActive && (
              <Tag color="default">Đã tắt</Tag>
            )}
          </Space>
        );
      },
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/admin/surveys/${record.id}/responses`)}
          >
            Xem kết quả
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/surveys/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === record.id}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="survey-list-page">
      <div className="header-gradient">
        <button
          className="btn-link"
          onClick={() => navigate('/admin')}
          style={{ marginBottom: '16px', fontSize: '16px' }}
        >
          ← Quay lại trang chủ
        </button>
        <h2 className="header-title">QUẢN LÝ KHẢO SÁT</h2>
      </div>

      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="title-3">Danh sách khảo sát</h3>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/surveys/create')}
            >
              Tạo khảo sát mới
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={surveys}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng ${total} khảo sát`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyListPage;

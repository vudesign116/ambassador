import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Select, Input, Space, Typography, Tag, Popconfirm, message } from 'antd';
import { DownloadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

function AdminRewardSelections() {
  const [selections, setSelections] = useState([]);
  const [filter, setFilter] = useState('all'); // all, this-month, last-month
  const [searchPhone, setSearchPhone] = useState('');
  const [rewardCategories, setRewardCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSelections();
    loadRewardCategories();
  }, []);

  const loadRewardCategories = () => {
    try {
      const introConfig = localStorage.getItem('admin_introduction_config');
      if (introConfig) {
        const config = JSON.parse(introConfig);
        setRewardCategories(config.awards || []);
      }
    } catch (err) {
      console.error('Error loading reward categories:', err);
    }
  };

  const loadSelections = () => {
    try {
      const data = JSON.parse(localStorage.getItem('reward_selections') || '[]');
      // Sort by timestamp, newest first
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSelections(data);
    } catch (err) {
      console.error('Error loading selections:', err);
    }
  };

  const filterSelections = () => {
    let filtered = [...selections];

    // Filter by phone
    if (searchPhone) {
      filtered = filtered.filter(s => s.phone && s.phone.includes(searchPhone));
    }

    // Filter by month
    if (filter === 'this-month') {
      const thisMonth = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
      filtered = filtered.filter(s => s.month === thisMonth);
    } else if (filter === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
      filtered = filtered.filter(s => s.month === lastMonthStr);
    }

    return filtered;
  };

  const handleClearAll = () => {
    localStorage.removeItem('reward_selections');
    setSelections([]);
    message.success('Đã xóa toàn bộ dữ liệu!');
  };

  const handleExport = () => {
    const filtered = filterSelections();
    
    // Create header row dynamically based on reward categories
    const headers = ['STT', 'Số điện thoại', 'Tháng', 'Điểm'];
    rewardCategories.forEach(cat => {
      headers.push(cat.name);
    });
    headers.push('Thời gian');

    // Create data rows
    const data = filtered.map((s, index) => {
      const row = {
        'STT': index + 1,
        'Số điện thoại': s.phone || '',
        'Tháng': s.month || '',
        'Điểm': s.point || ''
      };
      
      // Add reward selections dynamically
      rewardCategories.forEach(cat => {
        const key = cat.key || cat.name.toLowerCase().replace(/\s+/g, '_');
        row[cat.name] = s.selections?.[key] || '';
      });
      
      row['Thời gian'] = new Date(s.timestamp).toLocaleString('vi-VN');
      return row;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    
    // Set column widths
    const colWidths = headers.map(h => ({ wch: h.length > 20 ? 30 : 15 }));
    ws['!cols'] = colWidths;

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lựa chọn quà');
    XLSX.writeFile(wb, `reward_selections_${Date.now()}.xlsx`);
    
    message.success('Đã xuất file Excel thành công!');
  };

  const filteredSelections = filterSelections();

  // Build columns dynamically based on reward categories
  const buildColumns = () => {
    const baseColumns = [
      {
        title: 'STT',
        key: 'index',
        width: 60,
        fixed: 'left',
        render: (_, __, index) => index + 1,
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        fixed: 'left',
        width: 150,
        render: (phone) => <Text strong>{phone || '-'}</Text>,
      },
      {
        title: 'Tháng',
        dataIndex: 'month',
        key: 'month',
        width: 100,
        render: (month) => month || '-',
      },
      {
        title: 'Điểm',
        dataIndex: 'point',
        key: 'point',
        width: 80,
        render: (point) => <Tag color="blue">{point || 0}</Tag>,
      },
    ];

    // Add dynamic reward category columns
    const colors = ['success', 'processing', 'warning', 'error', 'purple', 'cyan'];
    const rewardColumns = rewardCategories.map((cat, idx) => ({
      title: cat.name,
      key: cat.key || cat.name,
      width: 150,
      render: (_, record) => {
        const key = cat.key || cat.name.toLowerCase().replace(/\s+/g, '_');
        const value = record.selections?.[key];
        return value ? <Tag color={colors[idx % colors.length]}>{value}</Tag> : <Text type="secondary">-</Text>;
      },
    }));

    const timeColumn = {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(timestamp).toLocaleString('vi-VN')}
        </Text>
      ),
    };

    return [...baseColumns, ...rewardColumns, timeColumn];
  };

  const columns = buildColumns();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>📦 Quản lý Lựa chọn Quà tặng</Title>
        <Text type="secondary">Xem và quản lý các lựa chọn quà tặng của người dùng</Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Space>
              <Text strong>Tháng:</Text>
              <Select value={filter} onChange={setFilter} style={{ width: 150 }}>
                <Option value="all">Tất cả</Option>
                <Option value="this-month">Tháng này</Option>
                <Option value="last-month">Tháng trước</Option>
              </Select>
            </Space>

            <Space>
              <Text strong>Số điện thoại:</Text>
              <Input
                placeholder="Tìm kiếm..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
              />
            </Space>

            <Space style={{ marginLeft: 'auto' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Xuất Excel
              </Button>
              <Popconfirm
                title="Xóa toàn bộ dữ liệu"
                description="Bạn có chắc chắn muốn xóa toàn bộ dữ liệu lựa chọn quà?"
                onConfirm={handleClearAll}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa toàn bộ
                </Button>
              </Popconfirm>
            </Space>
          </Space>

          <Text>
            <Text strong>Tổng số:</Text> {filteredSelections.length} lựa chọn
          </Text>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredSelections}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bản ghi` }}
          locale={{ emptyText: 'Chưa có dữ liệu lựa chọn quà nào' }}
        />
      </Card>
    </div>
  );
}

export default AdminRewardSelections;

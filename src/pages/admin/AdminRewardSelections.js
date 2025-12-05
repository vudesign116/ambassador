import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Typography, Space, Tag, DatePicker, Select, message, Spin } from 'antd';
import { GiftOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import '../styles/AdminSurvey.css';

// Extend dayjs with plugins
dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * Admin Reward Selections Page
 * Hiển thị danh sách lựa chọn quà tặng của users
 */
const AdminRewardSelections = () => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadSelections();
  }, [navigate]);

  const loadSelections = () => {
    setLoading(true);
    
    // Load from localStorage (fallback)
    const localData = JSON.parse(localStorage.getItem('reward_selections') || '[]');
    
    // Transform data for table
    const transformed = localData.flatMap((selection, index) => {
      const records = [];
      const selectionObj = selection.selections || {};
      
      // Get reward config for mapping
      const introConfig = JSON.parse(localStorage.getItem('admin_introduction_config') || '{}');
      const rewards = introConfig.rewards || [];
      
      // Map each reward type
      Object.keys(selectionObj).forEach(rewardType => {
        const gift = selectionObj[rewardType];
        if (gift) {
          // Find reward config
          const rewardConfig = rewards.find(r => r.id === rewardType) || {};
          
          records.push({
            key: `${index}_${rewardType}`,
            stt: records.length + 1,
            ma_kh_dms: localStorage.getItem('ma_kh_dms') || 'N/A',
            phone: selection.phone,
            month: selection.month,
            point: selection.point || 0,
            rewardList: rewardConfig.title || rewardType,
            giftName: gift.name,
            timestamp: selection.timestamp,
            rawData: selection
          });
        }
      });
      
      return records;
    });
    
    setSelections(transformed);
    setFilteredData(transformed);
    setLoading(false);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    applyFilters(dates, monthFilter);
  };

  const handleMonthFilterChange = (value) => {
    setMonthFilter(value);
    applyFilters(dateRange, value);
  };

  const applyFilters = (dates, month) => {
    let filtered = [...selections];

    // Filter by date range
    if (dates && dates[0] && dates[1]) {
      const start = dayjs(dates[0]).startOf('day');
      const end = dayjs(dates[1]).endOf('day');
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.timestamp);
        return itemDate.isBetween(start, end, null, '[]');
      });
    }

    // Filter by month
    if (month !== 'all') {
      filtered = filtered.filter(item => item.month === month);
    }

    setFilteredData(filtered);
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      message.warning('Không có dữ liệu để export');
      return;
    }

    // Prepare data for Excel
    const excelData = filteredData.map((item, index) => ({
      'STT': index + 1,
      'Mã DMS': item.ma_kh_dms,
      'SĐT': item.phone,
      'Tháng': item.month,
      'Điểm': item.point,
      'Danh sách giải thưởng': item.rewardList,
      'Giải thưởng': item.giftName,
      'Thời gian': dayjs(item.timestamp).format('DD/MM/YYYY HH:mm:ss')
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lựa chọn quà tặng');

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // STT
      { wch: 15 },  // Mã DMS
      { wch: 15 },  // SĐT
      { wch: 10 },  // Tháng
      { wch: 8 },   // Điểm
      { wch: 30 },  // Danh sách giải thưởng
      { wch: 40 },  // Giải thưởng
      { wch: 20 }   // Thời gian
    ];

    // Generate filename
    const dateStr = dayjs().format('YYYYMMDD_HHmmss');
    const filename = `LuaChonQuaTang_${dateStr}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
    message.success(`Đã export file ${filename}`);
  };

  // Get unique months for filter
  const uniqueMonths = [...new Set(selections.map(s => s.month))].filter(Boolean).sort();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => index + 1
    },
    {
      title: 'Mã DMS',
      dataIndex: 'ma_kh_dms',
      key: 'ma_kh_dms',
      width: 120
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      align: 'center'
    },
    {
      title: 'Điểm',
      dataIndex: 'point',
      key: 'point',
      width: 80,
      align: 'center',
      render: (point) => <Tag color="green">{point}</Tag>
    },
    {
      title: 'Danh sách giải thưởng',
      dataIndex: 'rewardList',
      key: 'rewardList',
      width: 200
    },
    {
      title: 'Giải thưởng',
      dataIndex: 'giftName',
      key: 'giftName',
      width: 300,
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss')
    }
  ];

  return (
    <div className="survey-list-page">
      <div style={{ marginBottom: 24 }}>
        <Button
          onClick={() => navigate('/admin')}
          style={{ marginBottom: 16 }}
        >
          ← Quay lại trang chủ
        </Button>
        
        <Title level={2}>
          <GiftOutlined style={{ marginRight: 8 }} />
          Quản lý Lựa chọn Quà tặng
        </Title>
        <Text type="secondary">
          Xem và quản lý danh sách lựa chọn quà tặng của người dùng
        </Text>
      </div>

      <Card
        title={
          <Space>
            <GiftOutlined />
            <span>Danh sách Lựa chọn ({filteredData.length})</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSelections}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
            >
              Export Excel
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
          <Space wrap>
            <Text strong>Lọc theo thời gian:</Text>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Space>

          <Space wrap>
            <Text strong>Lọc theo tháng:</Text>
            <Select
              style={{ width: 200 }}
              value={monthFilter}
              onChange={handleMonthFilterChange}
              placeholder="Chọn tháng"
            >
              <Select.Option value="all">Tất cả</Select.Option>
              {uniqueMonths.map(month => (
                <Select.Option key={month} value={month}>
                  {month}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} lựa chọn`
            }}
            scroll={{ x: 1200 }}
            bordered
          />
        </Spin>

        {filteredData.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#999' 
          }}>
            <GiftOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Chưa có lựa chọn quà tặng nào</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminRewardSelections;

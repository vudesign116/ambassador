import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Tag, Spin, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useSurvey, useSurveyResponses } from '../../hooks/useSurvey';
import * as XLSX from 'xlsx';
import '../../styles/AdminSurvey.css';

const SurveyResponsesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { survey, loading: surveyLoading } = useSurvey(id);
  const { responses, loading: responsesLoading } = useSurveyResponses(id);

  const getAnswerDisplay = (question, answer) => {
    if (!answer) return '-';
    
    switch (question.type) {
      case 'checkbox':
        return Array.isArray(answer) ? answer.join(', ') : answer;
      case 'rating':
        return `${answer} ⭐`;
      default:
        return answer;
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!survey || !responses || responses.length === 0) {
      return;
    }

    // Prepare data for Excel
    const excelData = responses.map((response, index) => {
      const row = {
        'STT': index + 1,
        'Số điện thoại': response.phoneNumber,
        'Thời gian': new Date(response.submittedAt).toLocaleString('vi-VN'),
      };

      // Add answers for each question
      survey.questions.forEach((question, qIndex) => {
        const answer = response.answers[question.id];
        row[`Câu ${qIndex + 1}: ${question.question}`] = getAnswerDisplay(question, answer);
      });

      return row;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 15 }, // Phone
      { wch: 20 }, // Time
      ...survey.questions.map(() => ({ wch: 30 })) // Questions
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Kết quả khảo sát');

    // Generate filename with survey title and date
    const fileName = `KhaoSat_${survey.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Thời gian',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    ...(survey?.questions || []).map((question, index) => ({
      title: `Câu ${index + 1}`,
      key: `q${index}`,
      render: (_, record) => getAnswerDisplay(question, record.answers[question.id]),
      width: 200,
    })),
  ];

  if (surveyLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="survey-responses-page">
      <div className="header-gradient">
        <button
          className="btn-link"
          onClick={() => navigate('/admin/surveys')}
          style={{ marginBottom: '16px', fontSize: '16px' }}
        >
          ← Quay lại danh sách
        </button>
        <h2 className="header-title">KẾT QUẢ KHẢO SÁT</h2>
      </div>

      <div className="container">
        <Card style={{ marginBottom: '16px' }}>
          <h3 className="title-3">{survey?.title}</h3>
          {survey?.description && (
            <p className="text-secondary">{survey.description}</p>
          )}
          <div style={{ marginTop: '16px' }}>
            <Tag color="blue">Tổng số phản hồi: {responses.length}</Tag>
            <Tag color="green">
              Từ {new Date(survey?.startDate).toLocaleDateString('vi-VN')} đến{' '}
              {new Date(survey?.endDate).toLocaleDateString('vi-VN')}
            </Tag>
          </div>
        </Card>

        <Card title="Danh sách câu hỏi">
          {survey?.questions.map((question, index) => (
            <div key={question.id} style={{ marginBottom: '16px' }}>
              <strong>
                Câu {index + 1}: {question.question}
                {question.required && <span style={{ color: 'red' }}> *</span>}
              </strong>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Loại: {question.type} | 
                {question.options && ` Lựa chọn: ${question.options.join(', ')}`}
              </div>
            </div>
          ))}
        </Card>

        <Card 
          title="Câu trả lời chi tiết" 
          style={{ marginTop: '16px' }}
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              disabled={!responses || responses.length === 0}
            >
              Xuất Excel
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={responses}
            rowKey="id"
            loading={responsesLoading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Tổng ${total} câu trả lời`,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default SurveyResponsesPage;

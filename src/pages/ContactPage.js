import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();

  const contactInfo = [
    {
      icon: '📞',
      title: 'Hotline',
      content: '1900 1234',
      subtitle: 'Miễn phí từ 8:00 - 18:00'
    },
    {
      icon: '📧',
      title: 'Email',
      content: 'support@meraplion.com',
      subtitle: 'Phản hồi trong 24h'
    },
    {
      icon: '📍',
      title: 'Địa chỉ',
      content: '123 Đường ABC, Quận 1, TP.HCM',
      subtitle: 'Văn phòng chính'
    },
    {
      icon: '🕐',
      title: 'Giờ làm việc',
      content: 'Thứ 2 - Thứ 6: 8:00 - 18:00',
      subtitle: 'Thứ 7: 8:00 - 12:00'
    },
  ];

  const faqs = [
    {
      question: 'Làm thế nào để tích điểm?',
      answer: 'Bạn có thể tích điểm bằng cách xem tài liệu, video và tham gia các hoạt động hàng ngày.'
    },
    {
      question: 'Khi nào điểm được cập nhật?',
      answer: 'Điểm được cập nhật tự động sau khi bạn hoàn thành các hoạt động.'
    },
    {
      question: 'Làm sao để đổi quà?',
      answer: 'Quà sẽ được trao tự động cho Top 50 thành viên có điểm cao nhất mỗi quý.'
    }
  ];

  return (
    <div className="full-height">
      <div className="header-gradient">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button
            className="btn-link"
            onClick={() => navigate('/')}
            style={{ color: 'white', marginRight: '16px' }}
          >
            ← Quay lại
          </button>
        </div>
        <h2 className="header-title">Liên Hệ CSKH</h2>
      </div>

      <div className="container space-y-6">
        <div className="card">
          <h3 className="title-3 text-center text-primary-color" style={{ marginBottom: '16px' }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn!
          </h3>
          
          <p className="text-center text-secondary" style={{ marginBottom: '32px', lineHeight: 1.6 }}>
            Đội ngũ chăm sóc khách hàng MerapLion sẵn sàng giải đáp mọi thắc mắc của bạn về chương trình M.Ambassador
          </p>

          <div className="space-y-4">
            {contactInfo.map((item, index) => (
              <div key={index} className="list-item">
                <div className="list-item-icon" style={{ fontSize: '24px' }}>{item.icon}</div>
                <div className="list-item-content">
                  <div className="list-item-title" style={{ fontWeight: 'bold' }}>
                    {item.title}
                  </div>
                  <div style={{ marginTop: '4px', fontWeight: '500' }}>
                    {item.content}
                  </div>
                  <div className="list-item-subtitle" style={{ marginTop: '4px' }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="title-3 text-center text-primary-color" style={{ marginBottom: '24px' }}>
            Câu hỏi thường gặp
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index}>
                <div style={{ padding: '16px 0' }}>
                  <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {faq.question}
                  </h4>
                  <p className="text-secondary">
                    {faq.answer}
                  </p>
                </div>
                {index < faqs.length - 1 && (
                  <div style={{ height: '1px', background: '#e0e0e0', margin: '0 -24px' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
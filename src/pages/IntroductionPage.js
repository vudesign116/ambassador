import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Space, Image, Divider } from 'antd';
import { RightOutlined, GiftOutlined } from '@ant-design/icons';
import ambassadorLogo from '../images/MAmbassador-logo.png';

const { Title, Text, Paragraph } = Typography;

const IntroductionPage = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Quý Dược sĩ';
  const [logo, setLogo] = useState(ambassadorLogo);
  const [introText, setIntroText] = useState('');
  const [rewardLevels, setRewardLevels] = useState([
    {
      title: 'Học Gia Trẻ',
      stars: '⭐⭐',
      threshold: '3.000 điểm/quý',
      gift: 'Máy sấy tóc Philips HP8108 1000W',
      color: '#FFD700',
    },
    {
      title: 'Chuyên Gia',
      stars: '⭐⭐⭐',
      threshold: '5.000 điểm/quý',
      gift: 'Quạt cầm tay tốc độ cao Shimono SM-HF18(W)',
      color: '#FF6B9D',
    },
  ]);

  // Load configuration from admin
  useEffect(() => {
    const adminConfig = localStorage.getItem('admin_introduction_config');
    if (adminConfig) {
      const config = JSON.parse(adminConfig);
      if (config.logo) setLogo(config.logo);
      if (config.introText) setIntroText(config.introText);
      if (config.awards && config.awards.length > 0) {
        // Convert admin awards format to component format
        const formattedAwards = config.awards.map(award => ({
          title: award.title,
          description: award.description,
          gifts: award.gifts || []
        }));
        setRewardLevels(formattedAwards);
      }
    }
  }, []);

  return (
    <div className="full-height introduction-page-bg" style={{ paddingBottom: '80px' }}>
      <div className="header-no-bg">
        <img src={logo} alt="M.Ambassador Logo" className="ambassador-logo" />
      </div>

      <div className="container">
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>Xin chào {userName}!</Title>
          
          {introText ? (
            <div dangerouslySetInnerHTML={{ __html: introText }} />
          ) : (
            <Space direction="vertical" size="middle">
              <Paragraph>
                Cảm ơn Quý Dược sĩ đã tham gia chương trình{' '}
                <Text strong>M.Ambassador</Text> của MerapLion.
              </Paragraph>

              <Paragraph>
                Với mong muốn xây dựng mối quan hệ bền vững và hỗ trợ thành lâu và quý Dược sĩ tự vận hiện thành trong chương trình chăm sóc sức khỏe gia đình Việt, <Text strong>MerapLion</Text> thấu hiểu rằng kiến thức chuyên môn chính là hành trang quan trọng giúp Quý Dược sĩ tư vấn hiệu quả và mang lại giá trị thiết thực cho bệnh nhân.
              </Paragraph>

              <Paragraph>
                Chính vì vậy, chúng tôi không ngừng nỗ lực chia sẻ, hỗ trợ và tạo loạt kiến thức thông qua các hoạt động thực tiễn. Trên hành trình đó, <Text strong>MerapLion</Text> luôn ghi nhớ và theo dõi những giá trị đôi bạn – <Text strong>"Trách nhiệm – Đồng hành"</Text>, như lời cam kết bền chặt dành cho cộng đồng Dược sĩ Việt Nam.
              </Paragraph>

              <Paragraph>
                Chương trình <Text strong>M.Ambassador</Text> không chỉ là nơi cung cấp những kiến thức hữu ích mà còn mang đến nhiều trải nghiệm giá trị.
              </Paragraph>

              <Paragraph>
                Quý Dược sĩ hãy tích cực tra cứu, cập nhật kiến thức và tham gia tương tác để nâng cao chuyên môn, tận hưởng trải nghiệm giá trị thông qua hệ sinh thái phong phú dưới nhẻ.
              </Paragraph>
            </Space>
          )}
        </Card>

        {rewardLevels.map((level, index) => (
          <Card 
            key={index} 
            title={
              <Space>
                <GiftOutlined />
                <Text strong>{level.title}</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {level.description && (
              <Paragraph>{level.description}</Paragraph>
            )}

            {level.gifts && level.gifts.length > 0 ? (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {level.gifts.map((gift, giftIndex) => (
                  <div key={giftIndex}>
                    {giftIndex > 0 && <Divider />}
                    {gift.image && (
                      <Image
                        src={gift.image}
                        alt={gift.name}
                        style={{ 
                          width: '100%', 
                          borderRadius: 8
                        }}
                        preview={{
                          mask: (
                            <div style={{ fontSize: 16 }}>
                              👁️ Xem lớn
                            </div>
                          )
                        }}
                      />
                    )}
                    <Text strong style={{ display: 'block', marginTop: 8 }}>
                      {gift.name}
                    </Text>
                  </div>
                ))}
              </Space>
            ) : (
              <div>
                <div style={{
                  height: 240,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8
                }}>
                  <Text type="secondary">📦 Gift Image</Text>
                </div>
                <Text strong style={{ display: 'block', marginTop: 8 }}>
                  {level.gift || 'Chưa có quà'}
                </Text>
              </div>
            )}
          </Card>
        ))}

      </div>

      <Button
        type="primary"
        size="large"
        onClick={() => navigate('/scoring-rules')}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          height: 48,
          fontWeight: 'bold',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>TIẾP TỤC</span>
        <RightOutlined style={{ position: 'absolute', right: 16 }} />
      </Button>
    </div>
  );
};

export default IntroductionPage;
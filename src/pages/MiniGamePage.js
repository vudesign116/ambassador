import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Empty, Typography, Row, Col, Badge } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MiniGamePage = () => {
  const navigate = useNavigate();
  const [games] = useState([
    // Sample games để test - Uncomment để xem
    {
      id: 1,
      title: 'MerapLion Puzzle',
      description: 'Xếp hình ghép MerapLion thành công!',
      thumbnail: 'https://via.placeholder.com/400x160/667eea/ffffff?text=Puzzle+Game',
      url: 'https://example.com/game-puzzle', // Link đến minigame
      available: true,
      comingSoon: false
    },
    {
      id: 2,
      title: 'Pharma Quiz',
      description: 'Câu đố kiến thức dược phẩm',
      thumbnail: 'https://via.placeholder.com/400x160/764ba2/ffffff?text=Quiz+Game',
      url: 'https://example.com/game-quiz',
      available: true,
      comingSoon: false
    },
    {
      id: 3,
      title: 'Memory Match',
      description: 'Tìm cặp thẻ giống nhau',
      thumbnail: 'https://via.placeholder.com/400x160/f093fb/ffffff?text=Memory+Game',
      url: 'https://example.com/game-memory',
      available: false,
      comingSoon: true
    }
    // Để trống array = không có game: []
  ]);

  const handleGameClick = (game) => {
    if (game.available && game.url) {
      // Mở game trong tab mới
      window.open(game.url, '_blank', 'noopener,noreferrer');
      console.log('Opening game:', game.title, game.url);
    }
  };



  return (
    <div className="full-height mini-game-page-bg" style={{ paddingBottom: '80px' }}>
      <div className="container" style={{ paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            size="large"
          />
          <Title level={3} style={{ margin: 0 }}>Mini Games</Title>
        </div>

        {games.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={5}>Hiện tại chưa có chương trình Mini Game dành cho bạn</Title>
                  <Text type="secondary">Hãy quay lại sau!</Text>
                </div>
              }
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {games.map((game) => (
              <Col xs={24} sm={12} md={8} key={game.id}>
                <Badge.Ribbon 
                  text="Coming Soon" 
                  color="volcano"
                  style={{ display: game.comingSoon ? 'block' : 'none' }}
                >
                  <Card
                    hoverable={game.available}
                    cover={
                      <div style={{ position: 'relative' }}>
                        <img 
                          alt={game.title} 
                          src={game.thumbnail}
                          style={{ height: 160, objectFit: 'cover', width: '100%' }}
                        />
                        {game.available && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                            cursor: 'pointer'
                          }}
                          className="play-overlay-ant"
                          >
                            <PlayCircleOutlined style={{ fontSize: 48, color: 'white' }} />
                          </div>
                        )}
                      </div>
                    }
                    onClick={() => handleGameClick(game)}
                    style={{ opacity: game.available ? 1 : 0.6 }}
                  >
                    <Card.Meta
                      title={game.title}
                      description={game.description}
                    />
                    <Button
                      type="primary"
                      block
                      disabled={!game.available}
                      style={{ 
                        marginTop: 12,
                        background: game.available ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                        border: 'none'
                      }}
                    >
                      {game.comingSoon ? 'Coming Soon' : 'Chơi ngay'}
                    </Button>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default MiniGamePage;
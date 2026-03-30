import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Empty, Typography, Row, Col, Badge } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { loadConfig } from '../utils/configSync';

const { Title, Text } = Typography;

const MiniGamePage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);

  useEffect(() => {
    loadConfig('admin_mini_games_config').then((saved) => {
      console.log('[MiniGame] loadConfig result:', saved);
      if (saved && Array.isArray(saved)) {
        setGames(saved);
      }
    }).catch((err) => {
      console.error('[MiniGame] loadConfig ERROR:', err);
    });
  }, []);

  const handleGameClick = (game) => {
    const phone = localStorage.getItem('phoneNumber') || '';
    const isAvailable = game.available === true || game.available === 'true';
    console.log('[MiniGame] click — available:', game.available, '| phone:', phone, '| url:', game.url);
    if (!game.url || !isAvailable) return;
    const resolvedUrl = game.url
      .replace(/\{phone\}/g, encodeURIComponent(phone))
      .replace(/%7Bphone%7D/gi, encodeURIComponent(phone));
    console.log('[MiniGame] opening:', resolvedUrl);
    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
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
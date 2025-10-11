import React, { useState } from 'react';
import UserBadge from '../components/UserBadge';
import RadarChart from '../components/RadarChart';
import CelebrationAnimation from '../components/CelebrationAnimation';
import iconHospital from '../images/icon-hospital.png';
import iconInfo from '../images/icon-info.png';
import iconDna from '../images/icon-dna.png';
import iconBook from '../images/icon-book.png';
import iconBrain from '../images/icon-brain.png';
import iconTips from '../images/icon-tips.png';



const DashboardPage = () => {
  const [playDialogOpen, setPlayDialogOpen] = useState(false);
  const [userScore, setUserScore] = useState(520); // Make this state for demo
  const [showCelebration, setShowCelebration] = useState(false);
  const userName = localStorage.getItem('userName') || 'Phạm Thị Hương';
  const lastUpdated = '08:00 08/03/2025';

  // Function to get current date and time in Vietnamese format
  const getCurrentDateTime = () => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const day = days[now.getDay()];
    const date = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}, ${date}/${month}/${year}`;
  };

  // Demo function to test different badge levels
  const cycleBadgeLevel = () => {
    setShowCelebration(true); // Trigger celebration animation
    if (userScore < 500) {
      setUserScore(750); // Học Giả Trẻ
    } else if (userScore < 1000) {
      setUserScore(1500); // Nhà Nghiên Cứu
    } else {
      setUserScore(250); // Tân Binh
    }
  };

  const dailyTasks = [
    { title: 'Thông tin sản phẩm', points: '1-2 điểm', icon: iconHospital, completed: false },
    { title: 'Thông tin về MerapLion', points: '2 điểm', icon: iconInfo, completed: false },
    { title: 'Thông tin bệnh học', points: '1 điểm', icon: iconDna, completed: false },
    { title: 'Số tay người thầy thuốc', points: '1 điểm', icon: iconBook, completed: false },
    { title: 'Tư vấn cũng chuyên gia', points: '1 điểm', icon: iconBrain, completed: false },
  ];

  return (
    <div className="full-height" style={{ paddingBottom: '80px' }}>
      <div className="header-gradient" style={{ borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div className="logo-circle logo-small" style={{ marginRight: '16px', marginBottom: 0 }}>
            U
          </div>
          <div>
            <p className="text-secondary" style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' }}>
              Xin Chào, {userName}
            </p>
            <p className="text-secondary" style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '500' }}>
              {getCurrentDateTime()}
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button 
              className="btn-link" 
              style={{ color: 'white', fontSize: '10px', opacity: 0.8 }}
              onClick={cycleBadgeLevel}
            >
              Demo Badge
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card card-elevated score-display" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
            <button className="btn-link" style={{ color: 'var(--primary-color)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              Lịch sử điểm
            </button>
          </div>

          <UserBadge score={userScore} />

          <h3 className="title-3" style={{ fontSize: '16px', marginTop: '8px', marginBottom: '8px', textAlign: 'center' }}>TỔNG QUAN HOẠT ĐỘNG</h3>

          <p className="text-secondary" style={{ marginBottom: '16px', marginTop: '8px', fontSize: '13px', fontWeight: '600' }}>
            Cập nhật {lastUpdated}
          </p>

          <RadarChart userScore={userScore} />
        </div>

        <div className="card">
          <h3 className="title-3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            MẸO TĂNG ĐIỂM
            <img src={iconTips} alt="Tips" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </h3>
          <p className="text-secondary" style={{ marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
            Điểm tổng hợp từ việc xem tài liệu, video và mức độ tích cực của bạn mỗi ngày
          </p>

          <div className="space-y-4">
            {dailyTasks.map((task, index) => (
              <div key={index} className="list-item">
                <div className="list-item-icon">
                  <img src={task.icon} alt={task.title} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{task.title}</div>
                  <div className="list-item-subtitle">{task.points}</div>
                </div>
                <button className="btn btn-primary" style={{ padding: '8px 12px', minHeight: 'auto' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="fab" onClick={() => setPlayDialogOpen(true)}>
        ▶️
      </button>

      <div className="bottom-nav">
        <div className="nav-item nav-item-active">
          <div className="nav-item-icon">👤</div>
          <div className="nav-item-label">TỔNG QUAN</div>
        </div>
        <div className="nav-item">
          <div className="nav-item-icon">🎮</div>
          <div className="nav-item-label">MINI GAME</div>
        </div>
      </div>

      {playDialogOpen && (
        <div className="modal-overlay" onClick={() => setPlayDialogOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="modal-close"
                onClick={() => setPlayDialogOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <h2 className="title-2 text-center" style={{ marginBottom: '24px' }}>
                TĂNG ĐIỂM NGAY
              </h2>

              <p className="text-center text-secondary" style={{ marginBottom: '32px', fontSize: '13px', fontWeight: '600' }}>
                Điểm tổng hợp từ việc xem tài liệu, video và mức độ tích cực của bạn mỗi ngày
              </p>

              <div className="space-y-4">
                {dailyTasks.map((task, index) => (
                  <div key={index} className="list-item">
                    <div className="list-item-icon">
                      <img src={task.icon} alt={task.title} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    </div>
                    <div className="list-item-content">
                      <div className="list-item-title">{task.title}</div>
                      <div className="list-item-subtitle">{task.points}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 12px', minHeight: 'auto' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <CelebrationAnimation
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default DashboardPage;
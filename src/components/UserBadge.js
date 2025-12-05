import React from 'react';

// Import badge images
import name1Badge from '../assets/badges/name1.png';
import name2Badge from '../assets/badges/name2.png';
import name3Badge from '../assets/badges/name3.png';
import name4Badge from '../assets/badges/name4.png';
import name5Badge from '../assets/badges/name5.png';

const UserBadge = ({ score }) => {
  // Load badge config from admin or use defaults
  const getBadgeConfig = () => {
    const adminBadges = localStorage.getItem('admin_badges_config');
    if (adminBadges) {
      return JSON.parse(adminBadges);
    }
    // Default badges if admin config not found
    return [
      { id: 1, name: 'TÂN BINH', minPoints: 0, maxPoints: 500, image: name1Badge },
      { id: 2, name: 'HỌC GIẢ TRẺ', minPoints: 501, maxPoints: 1000, image: name2Badge },
      { id: 3, name: 'NHÀ NGHIÊN CỨU', minPoints: 1001, maxPoints: 2000, image: name3Badge },
      { id: 4, name: 'CHUYÊN GIA', minPoints: 2001, maxPoints: 3000, image: name4Badge },
      { id: 5, name: 'BẬC THẦY TRI THỨC', minPoints: 3001, maxPoints: 999999, image: name5Badge }
    ];
  };

  const badges = getBadgeConfig();
  
  // Find current badge based on score
  const getCurrentBadge = (score) => {
    for (let i = badges.length - 1; i >= 0; i--) {
      if (score >= badges[i].minPoints) {
        return badges[i];
      }
    }
    return badges[0];
  };

  const currentBadge = getCurrentBadge(score);

  // Get badge image based on score (support both admin image and default)
  const getBadgeImage = () => {
    return currentBadge.image || name1Badge;
  };

  // Get badge title based on score
  const getBadgeTitle = () => {
    return currentBadge.name;
  };

  return (
    <div className="user-badge" style={{ textAlign: 'center', marginBottom: '16px' }}>
      <style>
        {`
          @keyframes floatBadge {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .badge-image-container img {
            animation: floatBadge 3s ease-in-out infinite;
          }
        `}
      </style>
      <div className="badge-image-container" style={{ marginBottom: '8px' }}>
        <img
          src={getBadgeImage()}
          alt={getBadgeTitle()}
          style={{
            width: '258px',
            height: '258px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))'
          }}
        />
      </div>
      <h1 className="score-number" style={{ margin: '0', lineHeight: '1' }}>
        {score.toLocaleString()}
        <span className="score-label">Điểm</span>
      </h1>
    </div>
  );
};

export default UserBadge;
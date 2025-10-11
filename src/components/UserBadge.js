import React from 'react';

// Import badge images
import name1Badge from '../assets/badges/name1.png';
import name2Badge from '../assets/badges/name2.png';
import name3Badge from '../assets/badges/name3.png';

const UserBadge = ({ score }) => {
  // Get badge image based on score
  const getBadgeImage = (score) => {
    if (score >= 1001) return name3Badge;
    if (score >= 501) return name2Badge;
    return name1Badge;
  };

  // Get badge title based on score
  const getBadgeTitle = (score) => {
    if (score >= 1001) return 'NHÀ NGHIÊN CỨU';
    if (score >= 501) return 'HỌC GIẢ TRẺ';
    return 'TÂN BINH';
  };

  return (
    <div className="user-badge" style={{ textAlign: 'center', marginBottom: '16px' }}>
      <div className="badge-image-container" style={{ marginBottom: '8px' }}>
        <img
          src={getBadgeImage(score)}
          alt={getBadgeTitle(score)}
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
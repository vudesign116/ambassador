import React from 'react';

const RadarChart = ({ userScore, categoryStats = [] }) => {
  // Use API data if available, otherwise use default categories
  const defaultCategories = [
    { name: 'MerapLion', value: 0 },
    { name: 'Sản phẩm', value: 0 },
    { name: 'Bệnh học', value: 0 },
    { name: 'Sổ tay thầy thuốc', value: 0 },
    { name: 'Tư vấn chuyên gia', value: 0 },
    { name: 'Mini Game', value: 0 },
    { name: 'Điểm Giới thiệu', value: 0 },
    { name: 'Điểm Duy trì', value: 0 }
  ];

  // Use categoryStats from API or default
  let categories = categoryStats.length > 0 ? categoryStats : defaultCategories;
  
  // Ensure we have exactly 8 categories for octagon
  const targetCategoryCount = 8;
  if (categories.length < targetCategoryCount) {
    const missingCount = targetCategoryCount - categories.length;
    for (let i = 0; i < missingCount; i++) {
      categories.push({ name: `Category ${i + 1}`, value: 0, maxPoints: 1 });
    }
  } else if (categories.length > targetCategoryCount) {
    categories = categories.slice(0, targetCategoryCount);
  }

  // Find max value for visualization scaling (use highest value for consistent shape)
  const maxValueForScale = Math.max(...categories.map(c => c.value), 1);

  const size = 260; // Tăng size để chứa 8 cạnh
  const center = size / 2;
  const radius = 75; // Radius cho octagon

  // Calculate octagon points (8 sides)
  const getOctagonPoints = (scale = 1) => {
    const points = [];
    for (let i = 0; i < targetCategoryCount; i++) {
      const angle = (i * (360 / targetCategoryCount) - 90) * (Math.PI / 180); // 45 degrees per side for octagon
      const x = center + Math.cos(angle) * radius * scale;
      const y = center + Math.sin(angle) * radius * scale;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Calculate data polygon points
  const getDataPoints = () => {
    const points = [];
    categories.forEach((category, index) => {
      const angle = (index * (360 / targetCategoryCount) - 90) * (Math.PI / 180); // 45 degrees for octagon
      const scale = category.value / maxValueForScale; // Normalize based on max value for visualization
      const x = center + Math.cos(angle) * radius * scale;
      const y = center + Math.sin(angle) * radius * scale;
      points.push(`${x},${y}`);
    });
    return points.join(' ');
  };

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      margin: '0 auto',
      marginBottom: '24px',
      padding: '10px 0', // Thêm padding trên dưới để cân đối
      animation: 'radarChartFadeIn 1s ease-out'
    }}>
      <svg width={size} height={size}>
        {/* Background octagon levels */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
          <polygon
            key={index}
            points={getOctagonPoints(scale)}
            fill="none"
            stroke="#E0F7FA"
            strokeWidth="1"
            opacity="0.3"
            style={{
              animation: `radarHexagonDraw 1.5s ease-out ${index * 0.1}s both`
            }}
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, index) => {
          const angle = (index * (360 / 8) - 90) * (Math.PI / 180); // 45 degrees for octagon
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#B2EBF2"
              strokeWidth="1"
              opacity="0.5"
              style={{
                animation: `radarAxisDraw 1s ease-out ${index * 0.1 + 0.5}s both`
              }}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={getDataPoints()}
          fill="rgba(77, 208, 225, 0.3)"
          stroke="#26C6DA"
          strokeWidth="2"
          style={{
            animation: 'radarDataFill 2s ease-out 1s both'
          }}
        />

        {/* Outer octagon */}
        <polygon
          points={getOctagonPoints(1)}
          fill="none"
          stroke="#4DD0E1"
          strokeWidth="2"
          style={{
            animation: 'radarOuterHexagon 1s ease-out 0.3s both'
          }}
        />
      </svg>

      {/* Category labels at octagon points */}
      {categories.map((category, index) => {
        const angle = (index * (360 / 8) - 90) * (Math.PI / 180); // 45 degrees for octagon
        const labelRadius = radius + 30; // Tăng từ 22 lên 30 để labels xa hơn
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        
        // Calculate percentage based on total points of all categories (relative distribution)
        const totalPoints = categories.reduce((sum, cat) => sum + (cat.value || 0), 0);
        const percentage = totalPoints > 0 ? Math.round((category.value / totalPoints) * 100) : 0;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: '8px',
              color: '#666',
              fontWeight: '500',
              textAlign: 'center',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              maxWidth: '70px',
              lineHeight: '1.3',
              animation: `radarLabelFade 0.5s ease-out ${index * 0.1 + 1.5}s both`
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {/* NEW label for Điểm Giới thiệu and Điểm Duy trì */}
              {(category.name === 'Điểm Giới thiệu' || category.name === 'Điểm Duy trì') && (
                <span style={{
                  fontSize: '7px',
                  padding: '1px 3px',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '2px',
                  animation: 'blink-red 1.5s ease-in-out infinite'
                }}>
                  NEW
                </span>
              )}
              <span>{category.name}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {category.value} điểm
            </div>
            <div style={{ fontSize: '9px', color: '#999', fontWeight: '600' }}>
              ({percentage}%)
            </div>
            {/* Show "Sắp diễn ra" label for Mini Game */}
            {category.name === 'Mini Game' && (
              <div style={{ 
                fontSize: '9px', 
                color: '#ff9800', 
                fontWeight: '600', 
                marginTop: '2px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                (Sắp diễn ra)
              </div>
            )}
          </div>
        );
      })}

      {/* Center content */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        animation: 'radarCenterBurst 1s ease-out 1s both'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{
            color: 'var(--primary-color)',
            fontWeight: 'bold',
            fontSize: '18px',
            animation: 'radarScorePulse 1s ease-out 1.5s both'
          }}>
            {userScore}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#666',
            animation: 'radarLabelSlideUp 0.8s ease-out 1.8s both'
          }}>
            Tổng điểm
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
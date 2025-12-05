import React from 'react';

const RadarChart = ({ userScore, categoryStats = [] }) => {
  // Use API data if available, otherwise use default categories
  const defaultCategories = [
    { name: 'MerapLion', value: 0 },
    { name: 'Sản phẩm', value: 0 },
    { name: 'Bệnh học', value: 0 },
    { name: 'Sổ tay thầy thuốc', value: 0 },
    { name: 'Tư vấn chuyên gia', value: 0 },
    { name: 'Mini Game', value: 0 }
  ];

  // Use categoryStats from API or default
  let categories = categoryStats.length > 0 ? categoryStats : defaultCategories;
  
  // Ensure we have exactly 6 categories for hexagon
  if (categories.length < 6) {
    const missingCount = 6 - categories.length;
    for (let i = 0; i < missingCount; i++) {
      categories.push({ name: `Category ${i + 1}`, value: 0, maxPoints: 1 });
    }
  } else if (categories.length > 6) {
    categories = categories.slice(0, 6);
  }

  // Find max value for visualization scaling (use highest value for consistent pentagon shape)
  const maxValueForScale = Math.max(...categories.map(c => c.value), 1);

  const size = 240; // Tăng từ 200 lên 240 để có thêm không gian cho labels
  const center = size / 2;
  const radius = 70; // Giảm từ 75 xuống 70 để cân đối với size mới

  // Calculate hexagon points (6 sides)
  const getHexagonPoints = (scale = 1) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 90) * (Math.PI / 180); // Start from top, 60 degrees per side
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
      const angle = (index * 60 - 90) * (Math.PI / 180); // 60 degrees for hexagon
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
        {/* Background hexagon levels */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
          <polygon
            key={index}
            points={getHexagonPoints(scale)}
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
          const angle = (index * 60 - 90) * (Math.PI / 180); // 60 degrees for hexagon
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

        {/* Outer hexagon */}
        <polygon
          points={getHexagonPoints(1)}
          fill="none"
          stroke="#4DD0E1"
          strokeWidth="2"
          style={{
            animation: 'radarOuterHexagon 1s ease-out 0.3s both'
          }}
        />
      </svg>

      {/* Category labels at hexagon points */}
      {categories.map((category, index) => {
        const angle = (index * 60 - 90) * (Math.PI / 180); // 60 degrees for hexagon
        const labelRadius = radius + 20; // Tăng từ 15 lên 20 để labels xa hơn
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;
        
        // Calculate percentage based on total points of all 6 categories (relative distribution)
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
              maxWidth: '65px',
              lineHeight: '1.2',
              animation: `radarLabelFade 0.5s ease-out ${index * 0.1 + 1.5}s both`
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{category.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {category.value} điểm ({percentage}%)
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
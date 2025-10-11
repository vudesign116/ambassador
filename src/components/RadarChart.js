import React from 'react';

const RadarChart = ({ userScore }) => {
  // Sample data for different categories (6 categories for hexagon)
  const categories = [
    { name: 'Sản phẩm', value: 75 },
    { name: 'Số tay thầy thuốc', value: 60 },
    { name: 'Tư vấn chuyên gia', value: 85 },
    { name: 'Bệnh học', value: 45 },
    { name: 'MerapLion', value: 90 },
    { name: 'Kiến thức y khoa', value: 70 }
  ];

  const size = 200;
  const center = size / 2;
  const radius = 75;

  // Calculate hexagon points (6 sides)
  const getHexagonPoints = (scale = 1) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 90) * (Math.PI / 180); // Start from top
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
      const angle = (index * 60 - 90) * (Math.PI / 180);
      const scale = category.value / 100;
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
          const angle = (index * 60 - 90) * (Math.PI / 180);
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
        const angle = (index * 60 - 90) * (Math.PI / 180);
        const labelRadius = radius + 15;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: '9px',
              color: '#666',
              fontWeight: '500',
              textAlign: 'center',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              maxWidth: '60px',
              lineHeight: '1.1',
              animation: `radarLabelFade 0.5s ease-out ${index * 0.1 + 1.5}s both`
            }}
          >
            {category.name}
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
          color: 'var(--primary-color)',
          fontWeight: 'bold',
          fontSize: '14px',
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
  );
};

export default RadarChart;
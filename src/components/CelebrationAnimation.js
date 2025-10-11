import React, { useEffect, useState } from 'react';

const CelebrationAnimation = ({ isVisible, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isVisible) {
      // Tạo particles cho hiệu ứng pháo hoa
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 8 + 4,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
          velocityX: (Math.random() - 0.5) * 10,
          velocityY: (Math.random() - 0.5) * 10,
          life: 100
        });
      }
      setParticles(newParticles);

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete && onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(38, 198, 218, 0.8) 50%, rgba(0, 191, 165, 0.7) 100%)',
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Particles animation */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            animation: 'firework 3s ease-out forwards'
          }}
        />
      ))}

      {/* Celebration text container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: '90vw'
      }}>
        <div style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
          animation: 'celebrationBounce 0.8s ease-in-out infinite',
          lineHeight: '1.2',
          marginBottom: '15px',
          whiteSpace: 'nowrap',
          display: 'inline-block'
        }}>
          🎉 CHÚC MỪNG 🎉
        </div>

        <div style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '600',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.8s ease-out',
          lineHeight: '1.3',
          whiteSpace: 'nowrap'
        }}>
          Bạn đã thăng hạng!
        </div>
      </div>

      {/* Confetti effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-10px',
              width: '10px',
              height: '10px',
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 3)],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti ${2 + Math.random() * 2}s linear forwards`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes firework {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-100px);
          }
        }

        @keyframes celebrationBounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-10px) scale(1.05);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
          75% {
            transform: translateY(-15px) scale(1.08);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationAnimation;
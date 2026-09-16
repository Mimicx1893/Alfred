import React, { useMemo } from 'react';

const RAIN_COUNT = 80;

function BatcaveBackground() {
  const rainLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      const left = Math.random() * 100;
      const duration = 0.8 + Math.random() * 1.4;
      const delay = Math.random() * 2;
      const opacity = 0.15 + Math.random() * 0.35;
      lines.push({ id: i, left, duration, delay, opacity });
    }
    return lines;
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: '#06080d' }}
    >
      {/* Beacon glow */}
      <div
        className="absolute"
        style={{
          top: '40%',
          left: '50%',
          width: 600,
          height: 600,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(255,183,0,0.35) 0%, rgba(255,183,0,0.12) 35%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.15,
          animation: 'pulseTower 4s ease-in-out infinite',
          willChange: 'opacity, transform',
        }}
      />

      {/* Radar ring 1 */}
      <div
        className="absolute rounded-full border border-[#ffb700]/20"
        style={{
          top: '40%',
          left: '50%',
          width: 300,
          height: 300,
          transform: 'translate(-50%, -50%)',
          animation: 'rotateCW 8s linear infinite',
          willChange: 'transform',
        }}
      />

      {/* Radar ring 2 */}
      <div
        className="absolute rounded-full border border-[#ffb700]/10"
        style={{
          top: '40%',
          left: '50%',
          width: 200,
          height: 200,
          transform: 'translate(-50%, -50%)',
          animation: 'rotateCCW 12s linear infinite',
          willChange: 'transform',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, #00d4ff 2px, #00d4ff 3px)',
          pointerEvents: 'none',
        }}
      />

      {/* Data-grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '140px 100%',
          pointerEvents: 'none',
        }}
      />

      {/* Bat-signal eye */}
      <div
        className="absolute"
        style={{
          top: '30%',
          left: '50%',
          width: 60,
          height: 26,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          filter: 'blur(6px) brightness(1.2) drop-shadow(0 0 12px white)',
          animation: 'eyePulse 3s ease-in-out infinite',
          willChange: 'opacity, transform, filter',
        }}
      />

      {/* SVG data-grid overlay (dashed lines scrolling) */}
      <svg
        className="absolute inset-0 opacity-[0.04]"
        style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={`${(i + 1) * 8}%`}
            x2="100%"
            y2={`${(i + 1) * 8}%`}
            stroke="#00d4ff"
            strokeWidth="1"
            strokeDasharray="6 10"
            style={{
              animation: 'dashMove 1.6s linear infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </svg>

      {/* Rain */}
      {rainLines.map((line) => (
        <div
          key={line.id}
          className="absolute top-0"
          style={{
            left: `${line.left}%`,
            width: 1,
            height: '110%',
            background:
              'linear-gradient(180deg, transparent, rgba(0,212,255,0.35))',
            opacity: line.opacity,
            animation: `rainFall ${line.duration}s linear ${line.delay}s infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}

export default BatcaveBackground;
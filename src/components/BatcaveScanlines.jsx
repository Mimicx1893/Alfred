import React from 'react';

function BatcaveScanlines({ className = '' }) {
  return (
    <div
      className={['absolute inset-0 pointer-events-none z-50 opacity-[0.06] mix-blend-screen', className].filter(Boolean).join(' ')}
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00d4ff 2px, #00d4ff 3px)',
        backgroundSize: '100% 4px',
      }}
    />
  );
}

export default BatcaveScanlines;

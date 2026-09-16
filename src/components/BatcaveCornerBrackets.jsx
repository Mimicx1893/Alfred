import React from 'react';

function BatcaveCornerBrackets({ className = '', size = 'w-14 h-14' }) {
  return (
    <>
      <div className={`absolute -top-6 -left-6 ${size} border-l-2 border-t-2 border-bat-cyan/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)] ${className}`} />
      <div className={`absolute -top-6 -right-6 ${size} border-r-2 border-t-2 border-bat-cyan/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)] ${className}`} />
      <div className={`absolute -bottom-6 -left-6 ${size} border-l-2 border-b-2 border-bat-cyan/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)] ${className}`} />
      <div className={`absolute -bottom-6 -right-6 ${size} border-r-2 border-b-2 border-bat-cyan/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)] ${className}`} />
    </>
  );
}

export default BatcaveCornerBrackets;

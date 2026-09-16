import React from 'react';

function BatcaveHud({ items, className = '' }) {
  return (
    <div className={['space-y-1.5 text-[10px] tracking-wider font-hud', className].filter(Boolean).join(' ')}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="text-gotham-muted uppercase">{item.label}</span>
          <span className={`${item.color || 'text-gotham-text'} ${item.className || ''}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BatcaveHud;

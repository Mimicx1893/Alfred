import React from 'react';

function BatcavePanel({ children, className = '', title, glow = false, headerAction }) {
  return (
    <div
      className={[
        'bg-gotham-panel border border-gotham-border rounded-lg',
        glow ? 'shadow-glow' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gotham-border/60">
          {title && (
            <h3 className="text-gotham-accent text-xs font-bold tracking-[0.2em] uppercase">{title}</h3>
          )}
          {headerAction}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export default BatcavePanel;

import React from 'react';

const STATUS_STYLES = {
  active:  { color: 'bg-gotham-success', label: 'ONLINE' },
  idle:    { color: 'bg-gotham-warning', label: 'IDLE' },
  blocked: { color: 'bg-orange-500',    label: 'BLOCKED' },
  error:   { color: 'bg-gotham-danger', label: 'ERROR' },
  offline: { color: 'bg-gotham-muted',  label: 'OFFLINE' },
};

function BatcaveStatusLight({ status = 'offline', label, pulse = true, className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.offline;
  const displayLabel = label || style.label;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${style.color} ${pulse && status === 'active' ? 'animate-pulseGlow' : ''}`}
        style={
          status === 'active'
            ? { boxShadow: '0 0 10px #00ff88' }
            : status === 'error'
              ? { boxShadow: '0 0 10px #ff4444' }
              : status === 'blocked'
                ? { boxShadow: '0 0 10px #ff8800' }
                : undefined
        }
      />
      <span className="text-[9px] text-gotham-muted tracking-wider font-hud uppercase">{displayLabel}</span>
    </div>
  );
}

export default BatcaveStatusLight;

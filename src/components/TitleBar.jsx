import React from 'react';

function TitleBar() {
  return (
    <div className="h-8 bg-gotham-dark border-b border-gotham-border flex items-center justify-between px-4 select-none" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 100 100" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0a0a0f" stroke="#00d4ff" strokeWidth="3"/>
          <path d="M30 65 L50 35 L70 65 M35 55 L65 55" stroke="#00d4ff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="70" r="4" fill="#00d4ff"/>
        </svg>
        <span className="text-gotham-accent text-xs font-bold tracking-widest">ALFRED</span>
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => window.alfred?.minimizeWindow()}
          className="w-8 h-8 flex items-center justify-center text-gotham-muted hover:text-gotham-text hover:bg-gotham-panel rounded transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => window.alfred?.maximizeWindow()}
          className="w-8 h-8 flex items-center justify-center text-gotham-muted hover:text-gotham-text hover:bg-gotham-panel rounded transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          onClick={() => window.alfred?.closeWindow()}
          className="w-8 h-8 flex items-center justify-center text-gotham-muted hover:text-gotham-danger hover:bg-gotham-danger/10 rounded transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TitleBar;

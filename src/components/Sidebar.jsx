import React from 'react';

const navItems = [
  { id: 'chat', label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-4.72C3.512 14.042 3 12.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: 'agents', label: 'Agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'hologram-table', label: 'Hologram', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'suit-lab', label: 'Suit Lab', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'metrics', label: 'Metrics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function Sidebar({ activeSection, onNavigate, isConnected }) {
  return (
    <div className="w-16 bg-gotham-dark border-r border-gotham-border flex flex-col items-center py-4 gap-2">
      <button
        onClick={() => onNavigate('voicehome')}
        className="mb-4 group"
        title="Home"
      >
        <svg viewBox="0 0 100 100" className="w-8 h-8 transition-transform duration-200 group-hover:scale-105" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0a0a0f" stroke="#00d4ff" strokeWidth="3"/>
          <path d="M30 65 L50 35 L70 65 M35 55 L65 55" stroke="#00d4ff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="70" r="4" fill="#00d4ff"/>
        </svg>
      </button>

      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${
            activeSection === item.id
              ? 'bg-gotham-accent/20 text-gotham-accent'
              : 'text-gotham-muted hover:text-gotham-text hover:bg-gotham-panel'
          }`}
          title={item.label}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
          </svg>
          {activeSection === item.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gotham-accent rounded-r-full" />
          )}
          <span className="absolute left-14 bg-gotham-panel border border-gotham-border text-gotham-text text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </span>
        </button>
      ))}

      <div className="mt-auto flex flex-col items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-gotham-success animate-pulseGlow' : 'bg-gotham-danger'}`} />
        <span className="text-[9px] text-gotham-muted tracking-wider">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
      </div>
    </div>
  );
}

export default Sidebar

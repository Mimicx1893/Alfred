import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';

function MilestoneBar({ label, current, target, unit = 'USD', achieved }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gotham-text font-medium">{label}</span>
        <span className="text-gotham-muted">
          {achieved ? '✓ Achieved' : `${pct}%`} · ${current.toLocaleString()} / ${target.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gotham-dark rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            achieved ? 'bg-gotham-success' : 'bg-gotham-accent'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Metrics() {
  const { metrics } = useStore();
  const [milestones, setMilestones] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/memory/milestones')
      .then(r => r.json())
      .then(data => setMilestones(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch('http://127.0.0.1:3001/api/memory/events?agent=alfred&limit=10')
      .then(r => r.json())
      .then(data => setRecentEvents(Array.isArray(data.events) ? data.events.slice(0, 8) : []))
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Ambassador Signups', value: metrics.ambassadorSignups.toLocaleString(), change: 'GoMining + Goli', positive: true },
    { label: 'Ad RPM', value: `$${metrics.adRpm.toFixed(2)}`, change: 'All channels', positive: true },
    { label: 'Videos Published', value: metrics.videosPublished.toString(), change: 'Phase 1', positive: true },
    { label: 'Pipeline Health', value: metrics.pipelineHealth, change: `${metrics.activeAgents} agents active`, positive: metrics.pipelineHealth === 'green' },
  ];

  const agentLabel = { riddler: '🔍', joker: '🃏', scarecrow: '🌾', mrfeeze: '❄️', clayface: '🎭', harley: '🎪', penguin: '🐧', twoface: '🪙', poisonivy: '🌿', catwoman: '🐱', bane: '💪', alfred: '🤵' };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gotham-accent tracking-widest font-butler mb-1">FLYWHEEL METRICS</h2>
        <p className="text-gotham-muted text-xs">Ambassador signups, RPM, milestone progress — not vanity views</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-gotham-panel border border-gotham-border rounded-lg p-4 hover:border-gotham-accent/30 transition-colors">
            <p className="text-gotham-muted text-[10px] uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gotham-text mb-1">{card.value}</p>
            <p className={`text-xs ${card.positive ? 'text-gotham-success' : 'text-gotham-danger'}`}>{card.change}</p>
          </div>
        ))}
      </div>

      {/* Revenue milestone progress */}
      <div className="bg-gotham-panel border border-gotham-border rounded-lg p-6 mb-6">
        <h3 className="text-gotham-accent text-sm font-bold tracking-wider mb-4">REVENUE MILESTONE</h3>
        {milestones.length === 0 ? (
          <p className="text-gotham-muted text-xs">No milestones set yet. Alfred will create one at launch.</p>
        ) : (
          milestones.map(m => (
            <MilestoneBar
              key={m.id}
              label={m.label}
              current={m.current_value || 0}
              target={m.target_value}
              unit={m.unit || 'USD'}
              achieved={!!m.achieved_at}
            />
          ))
        )}
      </div>

      {/* Engine A pipeline */}
      <div className="bg-gotham-panel border border-gotham-border rounded-lg p-6 mb-6">
        <h3 className="text-gotham-accent text-sm font-bold tracking-wider mb-4">ENGINE A PIPELINE</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {['Riddler', 'Joker', 'Poison Ivy', 'Scarecrow', 'Mr. Freeze', 'Clayface', 'Harley Quinn', 'Penguin'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="bg-gotham-dark border border-gotham-border rounded px-3 py-1.5 text-xs text-gotham-text">
                {step}
              </div>
              {i < 7 && <span className="text-gotham-muted text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-gotham-muted text-[10px] mt-4 uppercase tracking-wider">
          Pipeline health: <span className={`${metrics.pipelineHealth === 'green' ? 'text-gotham-success' : 'text-gotham-warning'}`}>{metrics.pipelineHealth}</span>
        </p>
      </div>

      {/* Recent event log */}
      <div className="bg-gotham-panel border border-gotham-border rounded-lg p-6">
        <h3 className="text-gotham-accent text-sm font-bold tracking-wider mb-4">RECENT FLYWHEEL EVENTS</h3>
        {recentEvents.length === 0 ? (
          <p className="text-gotham-muted text-xs">No events yet. Events appear as agents execute.</p>
        ) : (
          <div className="space-y-2">
            {recentEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 text-xs border-b border-gotham-border/50 pb-2 last:border-0">
                <span className="text-gotham-muted/60 w-16 shrink-0">
                  {ev.created_at ? new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
                <span className="text-gotham-accent/70 w-24 shrink-0 truncate">{agentLabel[ev.agent] || ev.agent}</span>
                <span className="text-gotham-muted/80 truncate flex-1">{ev.type}{ev.channel ? ` · ${ev.channel}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Metrics;


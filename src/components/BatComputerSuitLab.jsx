import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../store/useStore';
import BatcavePanel from './BatcavePanel';
import BatcaveHud from './BatcaveHud';
import BatcaveScanlines from './BatcaveScanlines';
import BatcaveCornerBrackets from './BatcaveCornerBrackets';
import BatcaveStatusLight from './BatcaveStatusLight';

const SYSTEMS = [
  { id: 'life-support', name: 'LIFE SUPPORT', uptime: '99.99%', status: 'active', load: 12 },
  { id: 'comms', name: 'COMMS ARRAY', uptime: '99.97%', status: 'active', load: 34 },
  { id: 'navigation', name: 'NAVIGATION', uptime: '99.95%', status: 'active', load: 28 },
  { id: 'stealth', name: 'STEALTH SYSTEM', uptime: '99.90%', status: 'idle', load: 5 },
  { id: 'weapons', name: 'WEAPONS CTRL', uptime: '99.88%', status: 'idle', load: 0 },
  { id: 'sonar', name: 'SONAR / ECHO', uptime: '99.92%', status: 'active', load: 18 },
  { id: 'power', name: 'POWER CORE', uptime: '100.00%', status: 'active', load: 67 },
  { id: 'hud', name: 'HEADS-UP DISPLAY', uptime: '99.99%', status: 'active', load: 22 },
];

const formatTime = () => new Date().toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

function Meter({ value }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-gotham-border" aria-label={`${value}% load`}>
      <div className="h-full rounded-full bg-batCyan shadow-[0_0_8px_#00d4ff] transition-[width] duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function BatComputerSuitLab() {
  const [time, setTime] = useState(formatTime);
  const [selectedSystem, setSelectedSystem] = useState('power');
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const { isConnected } = useStore();
  const selected = useMemo(() => SYSTEMS.find(system => system.id === selectedSystem) || SYSTEMS[0], [selectedSystem]);

  useEffect(() => {
    const interval = window.setInterval(() => setTime(formatTime()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const runDiagnostic = () => {
    setDiagnosticRunning(true);
    window.setTimeout(() => setDiagnosticRunning(false), 1800);
  };

  return (
    <section className="relative h-full min-h-0 w-full overflow-hidden bg-[#080c12] font-hud text-gotham-text select-none">
      <BatcaveScanlines />
      <BatcaveCornerBrackets />
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b border-batCyan/20 bg-[#080c12]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.3em] text-batCyan">BATCOMPUTER OS</span>
          <span className="h-4 w-px shrink-0 bg-gotham-border" />
          <span className="truncate text-[10px] uppercase tracking-wider text-gotham-muted">Suit Lab // Diagnostics</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <BatcaveStatusLight status={isConnected ? 'active' : 'offline'} label={isConnected ? 'LINK ACTIVE' : 'LINK DOWN'} />
          <span className="hidden h-4 w-px bg-gotham-border sm:block" />
          <time className="text-xs tracking-widest text-gotham-warning" dateTime={time}>{time}</time>
        </div>
      </header>

      <div className="relative z-20 flex h-full flex-col gap-4 overflow-y-auto px-4 pb-20 pt-20 sm:px-6 lg:block">
        <div className="lg:absolute lg:left-6 lg:top-1/2 lg:w-64 lg:-translate-y-1/2">
          <BatcavePanel title="SUIT SYSTEMS" glow>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {SYSTEMS.map(system => {
                const active = selectedSystem === system.id;
                return (
                  <button key={system.id} type="button" onClick={() => setSelectedSystem(system.id)} aria-pressed={active} className={`w-full rounded border px-3 py-2 text-left transition-all ${active ? 'border-batCyan/50 bg-batCyan/10 text-batCyan shadow-[inset_2px_0_#00d4ff]' : 'border-gotham-border bg-gotham-dark text-gotham-muted hover:border-gotham-accent/40 hover:text-gotham-text'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider">{system.name}</span>
                      <BatcaveStatusLight status={system.status} className="origin-right scale-75" />
                    </div>
                    {active && <div className="mt-2"><Meter value={system.load} /><div className="mt-1 flex justify-between text-[9px]"><span className="text-gotham-muted">LOAD</span><span>{system.load}%</span></div></div>}
                  </button>
                );
              })}
            </div>
          </BatcavePanel>
        </div>

        <div className="space-y-4 lg:absolute lg:right-6 lg:top-1/2 lg:w-72 lg:-translate-y-1/2">
          <BatcavePanel title={selected.name} glow>
            <BatcaveHud items={[
              { label: 'SYSTEM ID', value: selected.id.toUpperCase() },
              { label: 'STATUS', value: selected.status.toUpperCase(), color: selected.status === 'active' ? 'text-gotham-success' : 'text-gotham-warning' },
              { label: 'UPTIME', value: selected.uptime, color: 'text-batCyan' },
              { label: 'LOAD', value: `${selected.load}%`, color: selected.load > 50 ? 'text-gotham-warning' : 'text-gotham-success' },
              { label: 'TEMPERATURE', value: `${(35 + selected.load * 0.4).toFixed(1)}°C` },
              { label: 'INTEGRITY', value: '100%', color: 'text-gotham-success' },
              { label: 'LAST DIAGNOSTIC', value: diagnosticRunning ? 'RUNNING...' : '2 MIN AGO' },
              { label: 'NEXT SERVICE', value: '14 DAYS' },
            ]} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={runDiagnostic} disabled={diagnosticRunning} className="rounded border border-gotham-border bg-gotham-dark py-2 text-[10px] text-gotham-text transition-all hover:border-batCyan/50 hover:text-batCyan disabled:cursor-wait disabled:opacity-60">{diagnosticRunning ? 'SCANNING...' : 'RUN DIAGNOSTIC'}</button>
              <button type="button" className="rounded border border-batCyan/50 bg-batCyan/10 py-2 text-[10px] text-batCyan transition-all hover:bg-batCyan/20">CALIBRATE</button>
            </div>
          </BatcavePanel>
          <BatcavePanel title="SUIT TELEMETRY">
            <BatcaveHud items={[
              { label: 'ARMOR INTEGRITY', value: '100%', color: 'text-gotham-success' },
              { label: 'O2 RESERVE', value: '47 MIN', color: 'text-batCyan' },
              { label: 'HEART RATE', value: '72 BPM' },
              { label: 'NEURAL SYNC', value: 'STABLE', color: 'text-gotham-success' },
              { label: 'EXOSKELETON', value: 'ONLINE', color: 'text-gotham-success' },
            ]} />
          </BatcavePanel>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <div className="flex h-64 w-64 items-center justify-center rounded-full border border-batCyan/20 shadow-[0_0_80px_rgba(0,212,255,0.08)]">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border border-dashed border-batCyan/30"><span className="text-[9px] tracking-[0.35em] text-batCyan/50">SUIT CORE</span></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 sm:w-auto">
        <BatcavePanel className="px-4 py-2 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] tracking-wider">
            <BatcaveStatusLight status="active" label="ALL SYSTEMS NOMINAL" pulse />
            <span className="text-gotham-muted">BATSUIT MK IV // PROTOTYPE</span>
            <span className="text-batCyan/60">BUILD 2026.09.08</span>
          </div>
        </BatcavePanel>
      </div>
    </section>
  );
}

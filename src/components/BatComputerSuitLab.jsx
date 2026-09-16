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

const TELEMETRY = [
  ['ARMOR INTEGRITY', '100%', 'text-gotham-success'],
  ['O2 RESERVE', '47 MIN', 'text-batCyan'],
  ['HEART RATE', '72 BPM', 'text-gotham-text'],
  ['NEURAL SYNC', 'STABLE', 'text-gotham-success'],
  ['EXOSKELETON', 'ONLINE', 'text-gotham-success'],
];

const formatTime = () => new Date().toLocaleTimeString('en-US', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
});

function Meter({ value, color = 'bg-batCyan' }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-gotham-border">
      <div className={`h-full rounded-full ${color} shadow-[0_0_8px_currentColor] transition-[width] duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Readout({ label, value, color = 'text-gotham-text' }) {
  return <div className="flex items-center justify-between gap-3 border-b border-gotham-border/40 py-1.5 text-[9px] tracking-wider"><span className="text-gotham-muted">{label}</span><span className={color}>{value}</span></div>;
}

export default function BatComputerSuitLab() {
  const [time, setTime] = useState(formatTime);
  const [selectedSystem, setSelectedSystem] = useState('power');
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
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
    <section className="suit-lab relative h-full min-h-0 w-full overflow-hidden bg-[#070b11] font-hud text-gotham-text select-none">
      <BatcaveScanlines />
      <BatcaveCornerBrackets />
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.055]" style={{ backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
      <div className="suit-lab-vignette pointer-events-none absolute inset-0 z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-batCyan/10 shadow-[0_0_20px_#00d4ff]" />

      <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between border-b border-batCyan/25 bg-[#070b11]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.3em] text-batCyan animate-flicker">BATCOMPUTER OS</span>
          <span className="h-4 w-px shrink-0 bg-gotham-border" />
          <span className="truncate text-[10px] uppercase tracking-wider text-gotham-muted">Suit Lab // Diagnostics // MK IV</span>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-6"><BatcaveStatusLight status={isConnected ? 'active' : 'offline'} label={isConnected ? 'LINK ACTIVE' : 'LINK DOWN'} /><span className="hidden h-4 w-px bg-gotham-border sm:block" /><time className="text-xs tracking-widest text-gotham-warning">{time}</time></div>
      </header>

      <div className="absolute inset-0 z-20 overflow-y-auto px-4 pb-20 pt-20 sm:px-6 lg:overflow-hidden">
        <aside className="lg:absolute lg:left-6 lg:top-1/2 lg:w-64 lg:-translate-y-1/2">
          <BatcavePanel title="SUIT SYSTEMS" glow>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {SYSTEMS.map(system => {
                const active = selectedSystem === system.id;
                return <button key={system.id} type="button" onClick={() => setSelectedSystem(system.id)} aria-pressed={active} className={`w-full rounded border px-3 py-2 text-left transition-all ${active ? 'border-batCyan/60 bg-batCyan/10 text-batCyan shadow-[inset_2px_0_#00d4ff]' : 'border-gotham-border bg-gotham-dark text-gotham-muted hover:border-gotham-accent/40 hover:text-gotham-text'}`}>
                  <div className="flex items-center justify-between gap-2"><span className="text-[10px] uppercase tracking-wider">{system.name}</span><BatcaveStatusLight status={system.status} className="origin-right scale-75" /></div>
                  {active && <div className="mt-2"><Meter value={system.load} /><div className="mt-1 flex justify-between text-[9px]"><span className="text-gotham-muted">LOAD</span><span>{system.load}%</span></div></div>}
                </button>;
              })}
            </div>
          </BatcavePanel>
        </aside>

        <main className="mx-auto flex min-h-[620px] max-w-5xl items-center justify-center py-6 lg:h-full lg:py-0">
          <div className="relative flex h-[360px] w-[360px] items-center justify-center sm:h-[440px] sm:w-[440px]">
            <div className="absolute inset-0 rounded-full border border-batCyan/15 animate-rotateSlow" />
            <div className="absolute inset-6 rounded-full border border-dashed border-batCyan/25 animate-rotateReverse" />
            <div className="absolute inset-16 rounded-full border border-batCyan/20 shadow-[0_0_80px_rgba(0,212,255,0.12),inset_0_0_50px_rgba(0,212,255,0.08)]" />
            <div className="absolute inset-24 rounded-full border-2 border-batCyan/40 shadow-[0_0_25px_#00d4ff] animate-pulseGlow" />
            <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-batCyan/60 bg-[#0b1720]/80 text-center shadow-[0_0_60px_rgba(0,212,255,0.25)] sm:h-40 sm:w-40">
              <span className="text-2xl font-bold tracking-[0.2em] text-batCyan">MK IV</span><span className="mt-2 text-[8px] tracking-[0.35em] text-gotham-muted">SUIT CORE</span><span className="mt-1 text-[8px] text-gotham-success">NOMINAL</span>
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.35em] text-batCyan/60">REACTOR // 100%</div><div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.35em] text-batCyan/60">BATCOMPUTER // SECURE</div>
          </div>
        </main>

        <aside className="space-y-4 lg:absolute lg:right-6 lg:top-1/2 lg:w-72 lg:-translate-y-1/2">
          <BatcavePanel title={selected.name} glow>
            <div className="space-y-0.5">
              <Readout label="SYSTEM ID" value={selected.id.toUpperCase()} /><Readout label="STATUS" value={selected.status.toUpperCase()} color={selected.status === 'active' ? 'text-gotham-success' : 'text-gotham-warning'} /><Readout label="UPTIME" value={selected.uptime} color="text-batCyan" /><Readout label="LOAD" value={`${selected.load}%`} color={selected.load > 50 ? 'text-gotham-warning' : 'text-gotham-success'} /><Readout label="TEMPERATURE" value={`${(35 + selected.load * 0.4).toFixed(1)}°C`} /><Readout label="INTEGRITY" value="100%" color="text-gotham-success" /><Readout label="LAST DIAGNOSTIC" value={diagnosticRunning ? 'RUNNING...' : '2 MIN AGO'} /><Readout label="NEXT SERVICE" value="14 DAYS" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={runDiagnostic} disabled={diagnosticRunning} className="rounded border border-gotham-border bg-gotham-dark py-2 text-[10px] transition-all hover:border-batCyan/50 hover:text-batCyan disabled:opacity-60">{diagnosticRunning ? 'SCANNING...' : 'RUN DIAGNOSTIC'}</button><button type="button" onClick={() => setCalibrated(true)} className={`rounded border py-2 text-[10px] transition-all ${calibrated ? 'border-gotham-success/50 bg-gotham-success/10 text-gotham-success' : 'border-batCyan/50 bg-batCyan/10 text-batCyan hover:bg-batCyan/20'}`}>{calibrated ? 'CALIBRATED' : 'CALIBRATE'}</button></div>
          </BatcavePanel>
          <BatcavePanel title="SUIT TELEMETRY"><div>{TELEMETRY.map(([label, value, color]) => <Readout key={label} label={label} value={value} color={color} />)}</div><div className="mt-3 grid grid-cols-3 gap-1 text-center text-[8px] text-gotham-muted"><span className="border border-gotham-border/60 px-1 py-2">LATENCY<br /><b className="text-batCyan">12ms</b></span><span className="border border-gotham-border/60 px-1 py-2">FPS<br /><b className="text-gotham-success">60</b></span><span className="border border-gotham-border/60 px-1 py-2">THREAT<br /><b className="text-gotham-success">NONE</b></span></div></BatcavePanel>
        </aside>
      </div>

      <div className="absolute bottom-3 left-1/2 z-40 w-[calc(100%-2rem)] -translate-x-1/2 sm:w-auto"><BatcavePanel className="px-4 py-2 sm:px-6"><div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] tracking-wider"><BatcaveStatusLight status="active" label="ALL SYSTEMS NOMINAL" pulse /><span className="text-gotham-muted">BATSUIT MK IV // PROTOTYPE</span><span className="text-batCyan/60">BUILD 2026.09.08</span></div></BatcavePanel></div>
    </section>
  );
}

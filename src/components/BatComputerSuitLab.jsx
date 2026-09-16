import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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

export default function BatComputerSuitLab() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [selectedSystem, setSelectedSystem] = useState('power');
  const { isConnected } = useStore();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(interval);
  }, []);

  const selected = useMemo(() => SYSTEMS.find(s => s.id === selectedSystem) || SYSTEMS[0], [selectedSystem]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0e14] font-hud select-none">
      <BatcaveScanlines />
      <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', backgroundSize: '80px 80px', boxShadow: 'inset 0 0 80px rgba(0,240,255,0.08)' }} />

      <BatcaveCornerBrackets />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-batCyan/20 bg-[#0a0e14]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="text-batCyan text-xs tracking-[0.3em] font-bold uppercase">BATCOMPUTER OS</div>
          <div className="w-px h-4 bg-gotham-border" />
          <div className="text-gotham-muted text-[10px] tracking-wider uppercase">Suit Lab // Diagnostics</div>
        </div>
        <div className="flex items-center gap-6">
          <BatcaveStatusLight status={isConnected ? 'active' : 'offline'} label={isConnected ? 'LINK ACTIVE' : 'LINK DOWN'} />
          <div className="h-4 w-px bg-gotham-border" />
          <span className="text-gotham-warning text-xs tracking-widest font-hud">{time}</span>
        </div>
      </div>

      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64">
        <BatcavePanel title="SUIT SYSTEMS" glow>
          <div className="space-y-2">
            {SYSTEMS.map(system => (
              <button
                key={system.id}
                onClick={() => setSelectedSystem(system.id)}
                className={`w-full text-left px-3 py-2 rounded border transition-all ${
                  selectedSystem === system.id
                    ? 'bg-batCyan/10 border-batCyan/40 text-batCyan'
                    : 'bg-gotham-dark border-gotham-border text-gotham-muted hover:text-gotham-text hover:border-gotham-accent/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-wider uppercase">{system.name}</span>
                  <BatcaveStatusLight status={system.status} className="scale-75 origin-right" />
                </div>
                {selectedSystem === system.id && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="h-1 w-full bg-gotham-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-batCyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${system.load}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gotham-muted">LOAD</span>
                      <span className="text-[9px] text-batCyan">{system.load}%</span>
                    </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </BatcavePanel>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-72">
        <BatcavePanel title={selected.name} glow>
          <BatcaveHud
            items={[
              { label: 'SYSTEM ID', value: selected.id.toUpperCase() },
              { label: 'STATUS', value: selected.status.toUpperCase(), color: selected.status === 'active' ? 'text-gotham-success' : 'text-gotham-warning' },
              { label: 'UPTIME', value: selected.uptime, color: 'text-batCyan' },
              { label: 'LOAD', value: `${selected.load}%`, color: selected.load > 50 ? 'text-gotham-warning' : 'text-gotham-success' },
              { label: 'TEMPERATURE', value: `${(35 + selected.load * 0.4).toFixed(1)}°C` },
              { label: 'INTEGRITY', value: '100%', color: 'text-gotham-success' },
              { label: 'LAST DIAGNOSTIC', value: '2 MIN AGO' },
              { label: 'NEXT SERVICE', value: '14 DAYS' },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="bg-gotham-dark border border-gotham-border text-gotham-text text-[10px] py-2 rounded hover:border-batCyan/50 hover:text-batCyan transition-all">RUN DIAGNOSTIC</button>
            <button className="bg-batCyan/10 border border-batCyan/50 text-batCyan text-[10px] py-2 rounded hover:bg-batCyan/20 transition-all">CALIBRATE</button>
          </div>
        </BatcavePanel>

        <BatcavePanel title="SUIT TELEMETRY" className="mt-4">
          <BatcaveHud
            items={[
              { label: 'ARMOR INTEGRITY', value: '100%', color: 'text-gotham-success' },
              { label: 'O2 RESERVE', value: '47 MIN', color: 'text-batCyan' },
              { label: 'HEART RATE', value: '72 BPM' },
              { label: 'NEURAL SYNC', value: 'STABLE', color: 'text-gotham-success' },
              { label: 'EXOSKELETON', value: 'ONLINE', color: 'text-gotham-success' },
            ]}
          />
        </BatcavePanel>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <BatcavePanel className="px-6 py-3">
          <div className="flex items-center gap-6 text-[10px] tracking-wider font-hud">
            <BatcaveStatusLight status="active" label="ALL SYSTEMS NOMINAL" pulse />
            <span className="text-gotham-muted">BATSUIT MK IV // PROTOTYPE</span>
            <span className="text-batCyan/60">BUILD 2026.09.08</span>
          </div>
        </BatcavePanel>
      </div>
    </div>
  );
}

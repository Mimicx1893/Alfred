import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import useStore from '../store/useStore';
import { useVoice } from '../hooks/useVoice';

const NUM_BARS = 120;
const INNER_RADIUS = 100;
const MAX_BAR_HEIGHT = 32;

function VoiceHome() {
  const { activeSection, setActiveSection, isConnected } = useStore();
  const { isListening, isSpeaking, startListening, stopListening, transcript } = useVoice();
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 80 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 80 });

  const rotateX = useTransform(springY, [0, 1], [-8, 8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.warn('Autoplay prevented, waiting for user interaction');
        });
      }
    };

    attemptPlay();

    const handleInteraction = () => {
      attemptPlay();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleToggleListen = (e) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const navigateToChat = () => setActiveSection('chat');

  const bars = useMemo(() => {
    return Array.from({ length: NUM_BARS }, (_, i) => {
      const angle = (i / NUM_BARS) * 2 * Math.PI - Math.PI / 2;
      const height = MAX_BAR_HEIGHT * 0.5 + MAX_BAR_HEIGHT * 0.5 * Math.sin(i * 0.4);
      return { id: i, angle, height };
    });
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center h-full w-full bg-[#0a0e14] overflow-hidden select-none">
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00d4ff 2px, #00d4ff 3px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.04]" style={{ 
        backgroundImage: 'linear-gradient(90deg, #00d4ff 1px, transparent 1px), linear-gradient(#00d4ff 1px, transparent 1px)', 
        backgroundSize: '100px 100%',
        boxShadow: 'inset 0 0 60px rgba(0,240,255,0.08)'
      }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 h-[56px] border-b border-[#00d4ff]/20 bg-[#0a0e14]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
          <div className="text-[11px] md:text-[13px] tracking-[0.2em] font-bold flex items-center gap-2">
            <span className="text-[#00d4ff]">BATCOMPUTER OS</span>
            <span className="text-[#5a6b7e]">//</span>
            <span className="text-white">ORACLE</span>
            <span className="ml-4 text-[#00ff88] hidden md:inline">STATUS: OPERATIONAL</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 text-[10px] tracking-widest">
            <span className="text-[#5a6b7e]">RAM 12%</span>
            <div className="w-12 h-[2px] bg-[#1a2332]">
              <div className="h-full bg-[#00d4ff] transition-all duration-700" style={{ width: '12%' }} />
            </div>
            <span className="text-[#5a6b7e]">CPU 8%</span>
            <div className="w-12 h-[2px] bg-[#1a2332]">
              <div className="h-full bg-[#ffb700] transition-all duration-700" style={{ width: '8%' }} />
            </div>
            <span className="text-[#5a6b7e] hidden xl:inline">DISK 62%</span>
          </div>
          <div className="text-[11px] text-[#ffb700] tracking-widest tabular-nums">{time}</div>
        </div>
      </div>

      {/* Center HUD */}
      <div className="relative flex items-center justify-center z-50" style={{ width: 'min(95vw, 95vh)', height: 'min(95vw, 95vh)', maxWidth: 800, maxHeight: 800, marginTop: '56px' }}>
        {/* Video background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.6) contrast(1.2) saturate(0.7)' }}
            onError={() => {
              if (videoRef.current) {
                videoRef.current.style.display = 'none';
              }
            }}
          >
            <source src="/batcomputer_animated.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14]/50 via-transparent to-[#0a0e14]/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e14]/40 via-transparent to-[#0a0e14]/60" />
        </motion.div>

        {/* Rotating rings */}
        <motion.div
          className="absolute rounded-full border border-[#00d4ff]/30"
          style={{ width: '100%', height: '100%', boxShadow: '0 0 20px rgba(0,240,255,0.2), inset 0 0 20px rgba(0,240,255,0.1)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full border border-[#00d4ff]/15 border-dashed"
          style={{ width: '88%', height: '88%', top: '6%', left: '6%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full border border-[#00d4ff]/10"
          style={{ width: '75%', height: '75%', top: '12.5%', left: '12.5%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />

        {/* Corner brackets */}
        <div className="absolute -top-6 -left-6 w-16 h-16 border-l-2 border-t-2 border-[#00d4ff] z-50 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
        <div className="absolute -top-6 -right-6 w-16 h-16 border-r-2 border-t-2 border-[#00d4ff] z-50 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
        <div className="absolute -bottom-6 -left-6 w-16 h-16 border-l-2 border-b-2 border-[#00d4ff] z-50 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
        <div className="absolute -bottom-6 -right-6 w-16 h-16 border-r-2 border-b-2 border-[#00d4ff] z-50 shadow-[0_0_15px_rgba(0,240,255,0.4)]" />

        {/* Speaking pulse rings */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute rounded-full border border-[#00d4ff]/30"
              style={{ width: '85%', height: '85%', top: '7.5%', left: '7.5%', boxShadow: '0 0 30px rgba(0,240,255,0.3)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute rounded-full border border-[#00d4ff]/20"
              style={{ width: '95%', height: '95%', top: '2.5%', left: '2.5%', boxShadow: '0 0 40px rgba(0,240,255,0.2)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute rounded-full border border-[#00d4ff]/10"
              style={{ width: '105%', height: '105%', top: '-2.5%', left: '-2.5%', boxShadow: '0 0 50px rgba(0,240,255,0.15)' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* Listening pulse */}
        {isListening && (
          <motion.div
            className="absolute rounded-full border-2 border-[#00d4ff]"
            style={{ width: '75%', height: '75%', top: '12.5%', left: '12.5%', boxShadow: '0 0 40px rgba(0,240,255,0.4)' }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Rotating bars */}
        <svg width="100%" height="100%" viewBox="0 0 420 420" className="absolute z-0">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <g style={{ transformOrigin: '210px 210px' }} className={isSpeaking ? 'animate-rotateSlow' : 'animate-spin-slow'}>
            {bars.map((bar) => {
              const angleRad = bar.angle;
              const x1 = 210 + INNER_RADIUS * Math.cos(angleRad);
              const y1 = 210 + INNER_RADIUS * Math.sin(angleRad);
              const x2 = 210 + (INNER_RADIUS + bar.height) * Math.cos(angleRad);
              const y2 = 210 + (INNER_RADIUS + bar.height) * Math.sin(angleRad);

              return (
                <line
                  key={bar.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSpeaking ? 'url(#barGradient)' : isListening ? '#00d4ff80' : '#4a4a5a'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ 
                    transition: 'all 0.3s ease',
                    filter: isSpeaking ? 'drop-shadow(0 0 4px rgba(0,212,255,0.8))' : 'none'
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Center text */}
        <motion.div
          className="relative z-50 text-center pointer-events-none"
          style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="text-[#00d4ff] text-base tracking-[0.4em] font-bold font-hud mb-2"
            style={{ 
              textShadow: '0 0 20px rgba(0,240,255,0.8), 0 0 40px rgba(0,240,255,0.4), 0 0 60px rgba(0,240,255,0.2)',
              filter: 'drop-shadow(0 0 10px rgba(0,240,255,0.6))'
            }}
            animate={{ 
              textShadow: [
                '0 0 20px rgba(0,240,255,0.8), 0 0 40px rgba(0,240,255,0.4)',
                '0 0 30px rgba(0,240,255,1), 0 0 60px rgba(0,240,255,0.6)',
                '0 0 20px rgba(0,240,255,0.8), 0 0 40px rgba(0,240,255,0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ALFRED
          </motion.div>
          <div className="text-[#6b6b80] text-xs tracking-wider mt-1 font-hud">
            {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'STANDBY'}
          </div>
          {transcript && (
            <motion.div 
              className="text-[#c8c8d0] text-xs mt-3 text-center px-4 max-w-[250px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap font-hud"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              "{transcript}"
            </motion.div>
          )}
        </motion.div>

        {/* Radar sweep */}
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,0.1) 30deg, transparent 60deg)',
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-10 flex gap-4 z-50">
        <motion.button
          onClick={navigateToChat}
          className="px-6 py-3 bg-[#12121a]/90 backdrop-blur-md border border-[#2a2a3a] text-[#c8c8d0] text-xs tracking-[0.15em] rounded hover:border-[#00d4ff]/60 hover:text-[#00d4ff] transition-all font-hud shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
        >
          OPEN CHAT
        </motion.button>
        <motion.button
          onClick={handleToggleListen}
          className={`px-6 py-3 border text-xs tracking-[0.15em] rounded transition-all font-hud backdrop-blur-md ${
            isListening
              ? 'bg-[#ff4444]/20 border-[#ff4444]/50 text-[#ff4444] shadow-[0_0_25px_rgba(255,68,68,0.3)]'
              : 'bg-[#00d4ff]/10 border-[#00d4ff]/50 text-[#00d4ff] shadow-[0_0_25px_rgba(0,240,255,0.2)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? 'STOP LISTENING' : 'ACTIVATE VOICE'}
        </motion.button>
        <motion.button
          onClick={() => setActiveSection('metrics')}
          className="px-6 py-3 bg-[#12121a]/90 backdrop-blur-md border border-[#2a2a3a] text-[#c8c8d0] text-xs tracking-[0.15em] rounded hover:border-[#00d4ff]/60 hover:text-[#00d4ff] transition-all font-hud shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,240,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
        >
          SYSTEM STATUS
        </motion.button>
      </div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-14 h-14 border-l-2 border-t-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute top-6 right-6 w-14 h-14 border-r-2 border-t-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute bottom-6 left-6 w-14 h-14 border-l-2 border-b-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
      <div className="absolute bottom-6 right-6 w-14 h-14 border-r-2 border-b-2 border-[#00d4ff]/40 z-50 pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" />

      {/* Footer */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-[#6b6b80]/50 tracking-widest font-hud z-50">
        WAYNE ENTERPRISES // BAT-SYSTEMS INTERFACE // BUILD 8.4.2 // ALFRED v3.2.1
      </div>
    </div>
  );
}

export default VoiceHome;

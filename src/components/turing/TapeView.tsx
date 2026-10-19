import React, { useEffect, useRef, useState } from 'react';
import type { TMExecutionState } from '../../types/turing';
import { ArrowLeft, ArrowRight, Dot, Compass, LocateFixed, Eye, Disc } from 'lucide-react';

interface TapeViewProps {
  state: TMExecutionState;
  blankSymbol: string;
  onCellClick?: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Precision Hard Disk Drive (HDD) Mechanical Actuator Arm & Slider Component
// ---------------------------------------------------------------------------
interface HDDHeadProps {
  isSeeking: boolean;
}

const HDDHeadAssembly: React.FC<HDDHeadProps> = React.memo(({ isSeeking }) => {
  return (
    <div
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-100 ${
        isSeeking ? 'hdd-head-seeking' : ''
      }`}
      style={{ width: 44, height: 50 }}
    >
      <svg
        width="44"
        height="50"
        viewBox="0 0 44 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
      >
        <defs>
          {/* Actuator arm brushed metallic gradient */}
          <linearGradient id="hdd-arm-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Pivot bearing concentric gradient */}
          <radialGradient id="hdd-pivot-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="75%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>

          {/* Ceramic slider block gradient */}
          <linearGradient id="hdd-slider-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="40%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Magnetic flux beam cone */}
          <linearGradient id="hdd-flux-beam" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Pivot Bearing Axis Housing (Top) */}
        <circle cx="22" cy="7" r="6.5" fill="url(#hdd-pivot-grad)" stroke="#475569" strokeWidth="0.8" />
        <circle cx="22" cy="7" r="4.2" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
        <circle cx="22" cy="7" r="2" fill="#1e293b" />
        {/* Jeweled screw slots */}
        <line x1="20.5" y1="7" x2="23.5" y2="7" stroke="#cbd5e1" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="22" y1="5.5" x2="22" y2="8.5" stroke="#cbd5e1" strokeWidth="0.6" strokeLinecap="round" />

        {/* Stainless Steel Tapered Load Beam / Arm */}
        <path
          d="M 18 10.5 L 20 40 L 24 40 L 26 10.5 Z"
          fill="url(#hdd-arm-grad)"
          stroke="#475569"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Beveled edge highlights */}
        <path d="M 18.5 11.5 L 20.2 39" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.8" />
        <path d="M 25.5 11.5 L 23.8 39" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.6" />

        {/* Aerodynamic triangular cutout (lightening hole) */}
        <path
          d="M 22 15 L 20.8 28 L 23.2 28 Z"
          fill="#0f172a"
          fillOpacity="0.45"
          stroke="#475569"
          strokeWidth="0.5"
        />

        {/* Dual Gold / Copper Flexible Micro-Lead Traces */}
        <path d="M 19 12 L 20.5 39" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="2.5,1" />
        <path d="M 25 12 L 23.5 39" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="2.5,1" />

        {/* Gimbal Spring Flexure */}
        <rect x="20.5" y="40" width="3" height="3" rx="0.5" fill="#64748b" stroke="#334155" strokeWidth="0.5" />

        {/* Ceramic Read/Write Slider Transducer Block */}
        <rect
          x="17"
          y="43"
          width="10"
          height="5.5"
          rx="1"
          fill="url(#hdd-slider-grad)"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />

        {/* Microscopic Magnetic Pole Tips */}
        <rect x="19.5" y="48" width="1.5" height="1.5" fill="#38bdf8" />
        <rect x="23" y="48" width="1.5" height="1.5" fill="#38bdf8" />

        {/* Micro SMD Activity Sensor LED (amber on seek, cyan on read) */}
        <circle
          cx="22"
          cy="45.5"
          r="1"
          fill={isSeeking ? "#f59e0b" : "#22d3ee"}
          className="animate-pulse"
        />

        {/* Active Magnetic Flux Emission Cone from Pole Tips */}
        <polygon
          points="19.5,49.5 24.5,49.5 26,53 18,53"
          fill="url(#hdd-flux-beam)"
          opacity="0.85"
        />
      </svg>
    </div>
  );
});

HDDHeadAssembly.displayName = 'HDDHeadAssembly';

export const TapeView: React.FC<TapeViewProps> = React.memo(({
  state,
  blankSymbol,
  onCellClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCellRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const prevHeadRef = useRef(state.headPosition);
  const prevStepRef = useRef(state.stepCount);

  // Trigger mechanical seek twitch on head position or step change
  useEffect(() => {
    if (prevHeadRef.current !== state.headPosition || prevStepRef.current !== state.stepCount) {
      prevHeadRef.current = state.headPosition;
      prevStepRef.current = state.stepCount;
      setIsSeeking(true);
      const timer = setTimeout(() => setIsSeeking(false), 200);
      return () => clearTimeout(timer);
    }
  }, [state.headPosition, state.stepCount]);

  // Calculate visible range: include visited range plus extra padding around head
  const padding = 12;
  const minIndex = Math.min(state.minVisitedIndex - padding, state.headPosition - padding, -padding);
  const maxIndex = Math.max(state.maxVisitedIndex + padding, state.headPosition + padding, padding);

  const cellIndices: number[] = [];
  for (let i = minIndex; i <= maxIndex; i++) {
    cellIndices.push(i);
  }

  // Auto-scroll tape to keep head smoothly centered in view with 120fps cadence
  const lastScrollTimeRef = useRef<number>(0);
  useEffect(() => {
    if (activeCellRef.current && containerRef.current) {
      const container = containerRef.current;
      const cell = activeCellRef.current;
      const scrollTarget = cell.offsetLeft - container.offsetWidth / 2 + cell.offsetWidth / 2;
      
      const now = performance.now();
      const isRapidStepping = (now - lastScrollTimeRef.current) < 220;
      lastScrollTimeRef.current = now;

      // During rapid simulation execution, instant scroll prevents browser scroll physics from queuing and dropping frames.
      // During single-stepping or idle inspection, smooth scroll provides buttery-smooth 120fps centering.
      container.scrollTo({
        left: scrollTarget,
        behavior: isRapidStepping ? 'auto' : 'smooth',
      });
    }
  }, [state.headPosition]);

  // Center head manually button
  const handleCenterHead = () => {
    if (activeCellRef.current && containerRef.current) {
      const container = containerRef.current;
      const cell = activeCellRef.current;
      container.scrollTo({
        left: cell.offsetLeft - container.offsetWidth / 2 + cell.offsetWidth / 2,
        behavior: 'smooth',
      });
    }
  };

  const currentReadSymbol = state.tape[state.headPosition] ?? blankSymbol;

  return (
    <div className="w-full glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl overflow-hidden relative bg-[#faf7f2]/95 dark:bg-slate-950/70">
      {/* Top Holographic Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 mb-4 border-b border-stone-200 dark:border-white/[0.07]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Current State Badge */}
          <div className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-500/40 shadow-sm backdrop-blur">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-violet-800 dark:text-violet-300 tracking-wider">State</span>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-violet-600 dark:bg-violet-500/30 font-mono font-black text-white text-xs sm:text-sm">
              {state.currentState}
            </span>
          </div>

          {/* Read Symbol */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-cyan-950/70 border border-teal-200 dark:border-cyan-500/40 shadow-sm backdrop-blur">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-teal-800 dark:text-cyan-300 tracking-wider">Scanned</span>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-lg bg-teal-600 dark:bg-cyan-500/30 font-mono font-black text-white dark:text-cyan-100 text-xs sm:text-sm">
              {currentReadSymbol === blankSymbol ? `${blankSymbol} (blank)` : `'${currentReadSymbol}'`}
            </span>
          </div>

          {/* Last Transition Direction Pill */}
          {state.lastTransition && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#f4efe8] dark:bg-slate-900/90 border border-stone-200/90 dark:border-white/10 text-xs">
              <Compass className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              <span className="text-stone-600 dark:text-slate-400">Wrote</span>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-500/30">
                '{state.lastTransition.writeSymbol}'
              </span>
              <span className="text-stone-600 dark:text-slate-400">Moved</span>
              <span className="font-mono font-bold text-sky-800 dark:text-sky-300 flex items-center gap-0.5 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-200 dark:border-sky-500/30">
                {state.lastTransition.direction === 'L' ? <ArrowLeft className="w-3.5 h-3.5" /> :
                 state.lastTransition.direction === 'R' ? <ArrowRight className="w-3.5 h-3.5" /> :
                 <Dot className="w-3.5 h-3.5" />}
                {state.lastTransition.direction}
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Numbers & Center Head Action */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto text-xs font-mono">
          <button
            onClick={handleCenterHead}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#faf7f2] hover:bg-[#f4efe6] dark:bg-slate-900 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200/90 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/20 transition active:scale-95 text-xs shadow-xs"
            title="Center tape on head"
          >
            <LocateFixed className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
            <span className="hidden xs:inline">Center Head</span>
            <span className="xs:hidden">Center</span>
          </button>

          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#f4efe8] dark:bg-slate-900/90 border border-stone-200/90 dark:border-white/10 text-stone-700 dark:text-slate-300 font-semibold">
            Head: <span className="font-bold text-violet-700 dark:text-cyan-300">{state.headPosition}</span>
          </div>

          <div className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#f4efe8] dark:bg-slate-900/90 border border-stone-200/90 dark:border-white/10 text-stone-700 dark:text-slate-300 font-semibold">
            Step: <span className="font-black text-teal-700 dark:text-cyan-400 text-xs sm:text-sm">{state.stepCount}</span>
          </div>
        </div>
      </div>

      {/* Cybernetic Tape Drive Chassis Container */}
      <div className="tape-chassis rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-stone-200/90 dark:border-white/[0.08] relative shadow-inner">
        {/* Animated HDD Actuator Head Status Reticle */}
        <div className="relative w-full h-8 flex items-center justify-center pointer-events-none mb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#faf7f2] dark:bg-slate-900 border border-teal-300/80 dark:border-cyan-500/40 shadow-xs">
              <Disc className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 animate-spin" style={{ animationDuration: '3.5s' }} />
              <span className="uppercase text-[10px] text-teal-900 dark:text-cyan-300 font-extrabold tracking-wider">
                MAGNETIC READ / WRITE HEAD
              </span>
              <span className="text-[10px] text-stone-400 dark:text-slate-500">•</span>
              <span className="text-[10px] text-stone-600 dark:text-slate-400 font-mono">
                TRACK {state.headPosition}
              </span>
              <span className={`w-2 h-2 rounded-full transition-colors ${isSeeking ? 'bg-amber-500 animate-ping' : 'bg-teal-500 dark:bg-cyan-400'}`} />
            </div>
          </div>
        </div>

        {/* Horizontally Scrollable Tape Strip with extra top clearance for HDD Actuator Arm */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto pt-16 pb-5 px-4 rounded-xl bg-[#ece5da] dark:bg-[#030611] border border-stone-200/90 dark:border-white/[0.06] shadow-inner"
        >
          <div className="flex items-center gap-2 min-w-max mx-auto py-2">
            {cellIndices.map((idx) => {
              const isHead = idx === state.headPosition;
              const isOrigin = idx === 0;
              const symbol = state.tape[idx] ?? blankSymbol;
              const isBlank = symbol === blankSymbol;

              return (
                <div
                  key={idx}
                  ref={isHead ? activeCellRef : undefined}
                  onClick={() => onCellClick && onCellClick(idx)}
                  className={`relative flex flex-col items-center justify-center w-14 h-16 rounded-xl font-mono transition-[transform,border-color,background-color] duration-150 transform-gpu select-none cursor-pointer ${
                    isHead
                      ? 'bg-gradient-to-b from-teal-50 to-[#faf7f2] dark:from-cyan-950/90 dark:via-slate-900 dark:to-slate-950 border-2 border-teal-500 dark:border-cyan-400 shadow-md scale-110 z-10 will-change-transform'
                      : isOrigin
                      ? 'bg-[#faf7f2] dark:bg-slate-900/90 border-2 border-violet-400 dark:border-violet-500/50 hover:border-violet-500 shadow-xs'
                      : 'bg-[#faf7f2] dark:bg-slate-900/50 border border-stone-200/90 dark:border-white/[0.06] hover:border-stone-400 dark:hover:border-white/20 shadow-xs'
                  }`}
                >
                  {/* Hard Disk Drive Mechanical Actuator Arm hovering directly over active cell */}
                  {isHead && (
                    <>
                      <div className="absolute -top-[48px] left-1/2 -translate-x-1/2 pointer-events-none z-30">
                        <HDDHeadAssembly isSeeking={isSeeking} />
                      </div>
                      {/* Magnetic flux recording field & scanner (replaces plain blue line) */}
                      <div className="hdd-magnetic-field" />
                    </>
                  )}

                  {/* Cell Index Label */}
                  <span
                    className={`absolute top-1 text-[9px] font-mono tracking-tight ${
                      isHead
                        ? 'text-teal-700 dark:text-cyan-300 font-bold'
                        : isOrigin
                        ? 'text-violet-700 dark:text-violet-400 font-bold'
                        : 'text-stone-400 dark:text-slate-500'
                    }`}
                  >
                    {idx}
                  </span>

                  {/* Symbol Glyphs */}
                  <span
                    className={`text-xl font-extrabold mt-2 transition-transform ${
                      isHead
                        ? 'text-teal-950 dark:text-cyan-100 scale-110'
                        : isBlank
                        ? 'text-stone-300 dark:text-slate-600 font-normal'
                        : 'text-stone-800 dark:text-slate-100'
                    }`}
                  >
                    {isBlank ? blankSymbol : symbol}
                  </span>

                  {/* Origin Badge */}
                  {isOrigin && (
                    <span className="absolute -bottom-2 text-[8px] tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/60 shadow-xs font-bold">
                      start
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Navigation Cues */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-3 px-2">
          <span className="hidden md:flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition">
            ◀ Dynamic Blank Tape Left
          </span>
          <span className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium mx-auto md:mx-0 text-center w-full md:w-auto">
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Click any cell to inspect • Infinite bidirectional tape</span>
            <span className="sm:hidden">Swipe or click cells • Infinite tape</span>
          </span>
          <span className="hidden md:flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition">
            Dynamic Blank Tape Right ▶
          </span>
        </div>
      </div>
    </div>
  );
});

TapeView.displayName = 'TapeView';

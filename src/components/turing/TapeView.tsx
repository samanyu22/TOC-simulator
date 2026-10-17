import React, { useEffect, useRef } from 'react';
import type { TMExecutionState } from '../../types/turing';
import { ArrowLeft, ArrowRight, Dot, Compass, LocateFixed, Eye } from 'lucide-react';

interface TapeViewProps {
  state: TMExecutionState;
  blankSymbol: string;
  onCellClick?: (index: number) => void;
}

export const TapeView: React.FC<TapeViewProps> = ({
  state,
  blankSymbol,
  onCellClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCellRef = useRef<HTMLDivElement>(null);

  // Calculate visible range: include visited range plus extra padding around head
  const padding = 12;
  const minIndex = Math.min(state.minVisitedIndex - padding, state.headPosition - padding, -padding);
  const maxIndex = Math.max(state.maxVisitedIndex + padding, state.headPosition + padding, padding);

  const cellIndices: number[] = [];
  for (let i = minIndex; i <= maxIndex; i++) {
    cellIndices.push(i);
  }

  // Auto-scroll tape to keep head smoothly centered in view
  useEffect(() => {
    if (activeCellRef.current && containerRef.current) {
      const container = containerRef.current;
      const cell = activeCellRef.current;
      const scrollTarget = cell.offsetLeft - container.offsetWidth / 2 + cell.offsetWidth / 2;
      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth',
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
    <div className="w-full glass-panel rounded-3xl p-6 border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden relative bg-white/95 dark:bg-slate-950/70">
      {/* Top Holographic Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-4 border-b border-slate-200 dark:border-white/[0.07]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Current State Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-violet-100 dark:bg-violet-950/70 border border-violet-300 dark:border-violet-500/40 shadow-sm backdrop-blur">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse"></span>
            <span className="text-[11px] uppercase font-bold text-violet-800 dark:text-violet-300 tracking-wider">Current State</span>
            <span className="px-2 py-0.5 rounded-lg bg-violet-600 dark:bg-violet-500/30 font-mono font-black text-white text-sm">
              {state.currentState}
            </span>
          </div>

          {/* Read Symbol */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/40 shadow-sm backdrop-blur">
            <span className="text-[11px] uppercase font-bold text-cyan-800 dark:text-cyan-300 tracking-wider">Scanned Symbol</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-600 dark:bg-cyan-500/30 font-mono font-black text-white dark:text-cyan-100 text-sm">
              {currentReadSymbol === blankSymbol ? `${blankSymbol} (blank)` : `'${currentReadSymbol}'`}
            </span>
          </div>

          {/* Last Transition Direction Pill */}
          {state.lastTransition && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-xs">
              <Compass className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Wrote</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-500/30">
                '{state.lastTransition.writeSymbol}'
              </span>
              <span className="text-slate-600 dark:text-slate-400">Moved</span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-300 flex items-center gap-0.5 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-300 dark:border-sky-500/30">
                {state.lastTransition.direction === 'L' ? <ArrowLeft className="w-3.5 h-3.5" /> :
                 state.lastTransition.direction === 'R' ? <ArrowRight className="w-3.5 h-3.5" /> :
                 <Dot className="w-3.5 h-3.5" />}
                {state.lastTransition.direction}
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Numbers & Center Head Action */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={handleCenterHead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition active:scale-95 text-xs shadow-xs"
            title="Center tape on head"
          >
            <LocateFixed className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
            <span>Center Head</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold">
            Head: <span className="font-bold text-violet-600 dark:text-cyan-300">{state.headPosition}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold">
            Step: <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm">{state.stepCount}</span>
          </div>
        </div>
      </div>

      {/* Cybernetic Tape Drive Chassis Container */}
      <div className="tape-chassis rounded-2xl p-4 border border-slate-200 dark:border-white/[0.08] relative shadow-inner">
        {/* Animated Laser Tape Head Optical Reticle */}
        <div className="relative w-full h-8 flex items-center justify-center pointer-events-none mb-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
            <span className="text-cyan-600 dark:text-cyan-400 animate-bounce text-sm">▼</span>
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-400/60 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping"></span>
              <span className="uppercase text-[10px] text-cyan-800 dark:text-cyan-300">READ / WRITE HEAD</span>
            </div>
            <span className="text-cyan-600 dark:text-cyan-400 animate-bounce text-sm">▼</span>
          </div>
        </div>

        {/* Horizontally Scrollable Tape Strip */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto py-4 px-4 rounded-xl bg-slate-100 dark:bg-[#030611] border border-slate-300/80 dark:border-white/[0.06] shadow-inner"
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
                  className={`relative flex flex-col items-center justify-center w-14 h-16 rounded-xl font-mono transition-all duration-200 select-none cursor-pointer ${
                    isHead
                      ? 'bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/90 dark:via-slate-900 dark:to-slate-950 border-2 border-cyan-500 dark:border-cyan-400 shadow-md scale-110 z-10'
                      : isOrigin
                      ? 'bg-white dark:bg-slate-900/90 border-2 border-violet-400 dark:border-violet-500/50 hover:border-violet-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/[0.06] hover:border-slate-400 dark:hover:border-white/20 shadow-xs'
                  }`}
                >
                  {/* Laser line on active cell */}
                  {isHead && <div className="tape-head-beam left-1/2 -translate-x-1/2" />}

                  {/* Cell Index Label */}
                  <span
                    className={`absolute top-1 text-[9px] font-mono tracking-tight ${
                      isHead
                        ? 'text-cyan-700 dark:text-cyan-300 font-bold'
                        : isOrigin
                        ? 'text-violet-600 dark:text-violet-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {idx}
                  </span>

                  {/* Symbol Glyphs */}
                  <span
                    className={`text-xl font-extrabold mt-2 transition-transform ${
                      isHead
                        ? 'text-cyan-900 dark:text-cyan-100 scale-110'
                        : isBlank
                        ? 'text-slate-300 dark:text-slate-600 font-normal'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {isBlank ? blankSymbol : symbol}
                  </span>

                  {/* Origin Badge */}
                  {isOrigin && (
                    <span className="absolute -bottom-2 text-[8px] tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/60 shadow-xs font-bold">
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
          <span className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition">
            ◀ Dynamic Blank Tape Left
          </span>
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Click any cell to inspect • Infinite bidirectional tape</span>
          </span>
          <span className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition">
            Dynamic Blank Tape Right ▶
          </span>
        </div>
      </div>
    </div>
  );
};

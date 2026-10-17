import React from 'react';
import type { TMStatus } from '../../types/turing';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Sparkles,
  Sliders,
  Send
} from 'lucide-react';

interface TMControlsProps {
  status: TMStatus;
  statusMessage: string;
  stepCount: number;
  inputString: string;
  onInputChange: (val: string) => void;
  onApplyInput: () => void;
  onRun: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  stepLimit: number;
  onStepLimitChange: (limit: number) => void;
}

export const TMControls: React.FC<TMControlsProps> = ({
  status,
  statusMessage,
  stepCount,
  inputString,
  onInputChange,
  onApplyInput,
  onRun,
  onPause,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  stepLimit,
  onStepLimitChange,
}) => {
  const isRunning = status === 'running';
  const isHalted = ['accepted', 'rejected', 'halted_undefined', 'step_limit_reached'].includes(status);

  return (
    <div className="w-full space-y-4">
      {/* Telemetry Status Banner */}
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-md ${
          status === 'accepted'
            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/70 dark:border-emerald-500/50 dark:text-emerald-200 dark:shadow-glow-emerald'
            : status === 'rejected'
            ? 'bg-rose-50 border-rose-400 text-rose-900 dark:bg-rose-950/70 dark:border-rose-500/50 dark:text-rose-200 dark:shadow-glow-rose'
            : status === 'halted_undefined'
            ? 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/70 dark:border-amber-500/50 dark:text-amber-200'
            : status === 'step_limit_reached'
            ? 'bg-yellow-50 border-yellow-400 text-yellow-900 dark:bg-yellow-950/70 dark:border-yellow-500/50 dark:text-yellow-200'
            : isRunning
            ? 'bg-cyan-50 border-cyan-400 text-cyan-900 dark:bg-cyan-950/70 dark:border-cyan-500/50 dark:text-cyan-200 dark:shadow-glow-cyan'
            : 'glass-panel border-stone-200/90 dark:border-white/[0.08] text-stone-700 dark:text-slate-300 bg-[#faf7f2]/95 dark:bg-slate-950/70'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 shrink-0">
            {status === 'accepted' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            ) : status === 'rejected' ? (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : status === 'halted_undefined' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : status === 'step_limit_reached' ? (
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            ) : isRunning ? (
              <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />
            ) : (
              <Clock className="w-5 h-5 text-stone-500 dark:text-slate-400" />
            )}
          </div>

          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              <span className="uppercase tracking-widest text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4efe8] dark:bg-black/40 border border-stone-200/90 dark:border-white/10 font-bold">
                {status.replace(/_/g, ' ')}
              </span>
              <span className="text-stone-900 dark:text-white font-medium">{statusMessage}</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5 font-mono">
              Transitions fired: <span className="font-bold text-stone-800 dark:text-slate-200">{stepCount}</span>
            </div>
          </div>
        </div>

        {status === 'accepted' && (
          <span className="text-xs font-mono font-black px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50 shadow-xs">
            ✓ ACCEPTED
          </span>
        )}
        {status === 'rejected' && (
          <span className="text-xs font-mono font-black px-3.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/50 shadow-xs">
            ✕ REJECTED
          </span>
        )}
      </div>

      {/* Main Execution Controls Deck */}
      <div className="glass-panel rounded-3xl p-5 border border-stone-200/90 dark:border-white/[0.08] shadow-xl bg-[#faf7f2]/95 dark:bg-slate-950/70 flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Input String Deck */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <label className="text-xs font-mono font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Input Tape:
          </label>
          <div className="flex items-center gap-1.5 w-full lg:w-72">
            <input
              type="text"
              value={inputString}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="e.g. 111 or 0101"
              className="w-full px-3.5 py-2 rounded-xl bg-[#faf7f2] dark:bg-slate-950/90 border border-stone-200/90 dark:border-white/[0.1] font-mono text-sm text-stone-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 shadow-xs transition"
            />
            <button
              onClick={onApplyInput}
              title="Apply input string and reset tape"
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#f4efe8] hover:bg-[#ebe4d8] dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono font-bold text-stone-800 dark:text-slate-200 border border-stone-200/90 dark:border-white/10 transition shrink-0 active:scale-95 shadow-xs"
            >
              <Send className="w-3 h-3 text-teal-600 dark:text-cyan-400" />
              <span>Set</span>
            </button>
          </div>
        </div>

        {/* Playback Controls Hub */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-sm transition shadow-lg shadow-amber-900/30 active:scale-95 whitespace-nowrap shrink-0 min-w-[144px]"
            >
              <Pause className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Pause</span>
            </button>
          ) : (
            <button
              onClick={onRun}
              disabled={isHalted}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition active:scale-95 shadow-md whitespace-nowrap shrink-0 min-w-[144px] ${
                isHalted
                  ? 'bg-stone-100 dark:bg-slate-900 text-stone-400 dark:text-slate-600 border border-stone-200 dark:border-white/[0.04] cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/25 border border-violet-500/30'
              }`}
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span className="whitespace-nowrap">{stepCount > 0 && !isHalted ? 'Resume' : 'Run Machine'}</span>
            </button>
          )}

          <button
            onClick={onStepForward}
            disabled={isRunning || isHalted}
            title="Execute single transition"
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition active:scale-95 shadow-xs whitespace-nowrap shrink-0 ${
              isRunning || isHalted
                ? 'bg-stone-100 dark:bg-slate-950 text-stone-400 dark:text-slate-600 border-stone-200 dark:border-white/[0.04] cursor-not-allowed'
                : 'bg-[#faf7f2] hover:bg-[#f4efe6] dark:bg-slate-900/90 dark:hover:bg-slate-800 text-stone-800 dark:text-slate-200 border-stone-200/90 dark:border-white/[0.1] hover:border-stone-400 dark:hover:border-white/20'
            }`}
          >
            <SkipForward className="w-4 h-4 text-teal-600 dark:text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">Step</span>
          </button>

          <button
            onClick={onReset}
            title="Reset tape to initial configuration"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#faf7f2] hover:bg-[#f4efe6] dark:bg-slate-900/90 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200/90 dark:border-white/[0.1] hover:border-stone-400 dark:hover:border-white/20 text-sm font-semibold transition active:scale-95 shadow-xs whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-stone-500 dark:text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">Reset</span>
          </button>
        </div>

        {/* Speed & Execution Limit Settings */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-end">
          {/* Speed slider with custom gradient accent */}
          <div className="flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-stone-500 dark:text-slate-400" />
            <span className="text-xs font-mono text-stone-600 dark:text-slate-400 font-semibold">Speed:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-24 accent-cyan-500 cursor-pointer h-1.5 rounded-lg bg-stone-300 dark:bg-slate-800"
            />
            <span className="text-xs font-mono font-bold text-teal-800 dark:text-cyan-300 px-2 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 shadow-xs">
              {speed}x
            </span>
          </div>

          {/* Safety Step Limit Selector */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
            <span className="text-xs font-mono text-stone-600 dark:text-slate-400 font-semibold">Limit:</span>
            <select
              value={stepLimit}
              onChange={(e) => onStepLimitChange(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 text-xs font-mono text-stone-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              <option value={500}>500 steps</option>
              <option value={1000}>1,000 steps</option>
              <option value={2000}>2,000 steps</option>
              <option value={5000}>5,000 steps</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

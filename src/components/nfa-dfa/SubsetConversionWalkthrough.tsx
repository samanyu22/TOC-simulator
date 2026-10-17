import React, { useState, useEffect, useRef } from 'react';
import type { ConversionStep, DFADefinition } from '../../types/automata';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';

interface SubsetConversionWalkthroughProps {
  steps: ConversionStep[];
  dfa: DFADefinition;
  currentStepIndex: number;
  onStepChange: (updater: number | ((prev: number) => number)) => void;
  onReset: () => void;
}

export const SubsetConversionWalkthrough: React.FC<SubsetConversionWalkthroughProps> = ({
  steps,
  dfa,
  currentStepIndex,
  onStepChange,
  onReset,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 4
  const timerRef = useRef<any>(null);

  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const currentStep: ConversionStep | undefined = steps[currentStepIndex - 1];

  // Progress percentage
  const progressPercent = totalSteps > 0 ? Math.round((currentStepIndex / totalSteps) * 100) : 0;

  // Step controls
  const handleNext = () => {
    if (currentStepIndex < totalSteps) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 1) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handlePlay = () => {
    if (isFinished) {
      onStepChange(1);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Play loop
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(200, 1500 / speed);
      timerRef.current = setInterval(() => {
        onStepChange((prev: number) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps, onStepChange]);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-2xl space-y-5 transition-colors duration-200">
      {/* Header and Step Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600/15 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 border border-violet-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span>Subset Construction Stepper</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300">
                Powerset Algorithm
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>Interactive step-by-step determinization:</span>
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-cyan-700 dark:text-cyan-300">
                S' = ε-closure( ⋃ δ(q, a) )
              </span>
            </p>
          </div>
        </div>

        {/* Step Indicator Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-mono text-xs">
            <span className="text-slate-500 dark:text-slate-400">Step</span>
            <span className="font-black text-cyan-700 dark:text-cyan-300">{currentStepIndex}</span>
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <span className="text-slate-500 dark:text-slate-400">{totalSteps}</span>
          </div>

          {isFinished && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs dark:shadow-glow-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300/40 dark:border-white/[0.04]">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 dark:to-cyan-400 transition-all duration-300 shadow-glow-cyan"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Playback Controls Hub */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] transition-colors">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold transition shadow-md shadow-amber-900/20 active:scale-95"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-violet-900/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isFinished ? 'Replay' : 'Play Walkthrough'}</span>
            </button>
          )}

          <button
            onClick={handlePrev}
            disabled={currentStepIndex <= 1 || isPlaying}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition active:scale-95 shadow-xs"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={isFinished || isPlaying}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition active:scale-95 shadow-xs"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10 transition active:scale-95 shadow-xs"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector Chips */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <span>Speed:</span>
          {[1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                speed === s 
                  ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border border-cyan-400 shadow-xs dark:shadow-glow-cyan' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border border-slate-200 dark:border-white/5'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Detailed Breakdown Card */}
      {currentStep ? (
        <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-cyan-400/40 dark:border-cyan-500/30 shadow-md dark:shadow-glow-cyan space-y-4 transition-colors">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Source Subset */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-500/50 text-violet-900 dark:text-violet-200">
              <span className="text-slate-500 dark:text-slate-400">Source:</span>
              <span className="font-black text-sm">{currentStep.currentSubset}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />

            {/* Read Symbol */}
            <div className="px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-200">
              <span className="text-slate-500 dark:text-slate-400">Read: </span>
              <span className="font-black text-sm">'{currentStep.symbol}'</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />

            {/* Target Subset */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
              currentStep.isNewSubset
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-200 shadow-xs dark:shadow-glow-emerald'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
            }`}>
              <span className="text-slate-500 dark:text-slate-400">Target:</span>
              <span className="font-black text-sm">{currentStep.targetSubsetName}</span>
              {currentStep.isNewSubset && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded uppercase font-black tracking-wide border border-emerald-500/40">
                  NEW STATE
                </span>
              )}
            </div>
          </div>

          {/* Explanation in plain English */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 transition-colors">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">{currentStep.explanation}</p>
          </div>

          {/* Discovered Subsets Badges */}
          <div className="pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-bold">
              All Discovered Subsets ({currentStep.discoveredSubsets.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {currentStep.discoveredSubsets.map((sub) => {
                const isAcc = dfa.acceptStates.includes(sub);
                const isCurrent = sub === currentStep.targetSubsetName;

                return (
                  <span
                    key={sub}
                    className={`px-3 py-1 rounded-xl font-mono text-xs border transition-all duration-150 ${
                      isCurrent
                        ? 'bg-cyan-500/25 text-cyan-950 dark:text-white border-cyan-400 font-black shadow-xs dark:shadow-glow-cyan scale-105'
                        : isAcc
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/50'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {sub} {isAcc && '★'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mx-auto" />
          <div>Ready to convert! Click "Play Walkthrough" or "Step Forward" to begin.</div>
        </div>
      )}
    </div>
  );
};

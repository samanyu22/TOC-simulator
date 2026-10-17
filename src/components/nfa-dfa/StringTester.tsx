import React, { useState } from 'react';
import type { NFADefinition, DFADefinition, StringSimResult, StringSimStep } from '../../types/automata';
import { simulateStringOnNfaAndDfa } from '../../simulators/nfa-dfa/simulator';
import { 
  Play, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  GitCompare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StringTesterProps {
  nfa: NFADefinition;
  dfa: DFADefinition;
  onActiveStateChange?: (nfaStates: string[], dfaState: string) => void;
}

export const StringTester: React.FC<StringTesterProps> = ({
  nfa,
  dfa,
  onActiveStateChange,
}) => {
  const [testString, setTestString] = useState(nfa.defaultInput || '01');
  const [simResult, setSimResult] = useState<StringSimResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Run full simulation
  const handleRunAll = (strToTest: string = testString) => {
    const res = simulateStringOnNfaAndDfa(strToTest, nfa, dfa);
    setSimResult(res);
    setCurrentStepIndex(res.steps.length);

    if (onActiveStateChange) {
      onActiveStateChange(res.finalNFAStates, res.finalDFAState);
    }

    if (res.nfaAccepted && res.dfaAccepted) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    }
  };

  // Step forward char by char
  const handleStepForward = () => {
    let res = simResult;
    if (!res) {
      res = simulateStringOnNfaAndDfa(testString, nfa, dfa);
      setSimResult(res);
      setCurrentStepIndex(0);
    }

    if (currentStepIndex < res.steps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = res.steps[nextIdx - 1];
      if (onActiveStateChange) {
        onActiveStateChange(step.nfaNextActiveStates, step.dfaNextState);
      }

      if (nextIdx === res.steps.length && res.nfaAccepted && res.dfaAccepted) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleReset = () => {
    setSimResult(null);
    setCurrentStepIndex(0);
    if (onActiveStateChange) {
      onActiveStateChange([nfa.initialState], dfa.initialState);
    }
  };

  // Quick preset test strings
  const presetStrings = ['', '0', '1', '01', '101', '0101', '0011', '1111'];

  const currentStep: StringSimStep | undefined = 
    simResult && currentStepIndex > 0 ? simResult.steps[currentStepIndex - 1] : undefined;

  const isCompleted = simResult && currentStepIndex === simResult.steps.length;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-600/15 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
              <span>Dual String Simulator & Equivalence Tester</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-bold">
                NFA ⟷ DFA
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Simultaneously executes input string on both automata to verify identical language recognition.
            </p>
          </div>
        </div>
      </div>

      {/* Input String and Execution Hub */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value);
              setSimResult(null);
              setCurrentStepIndex(0);
            }}
            placeholder="Type input string (e.g. 0101)"
            className="w-full px-4 py-2.5 rounded-2xl bg-[#faf7f2] dark:bg-slate-950/90 border border-stone-200/90 dark:border-white/10 font-mono text-sm text-stone-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunAll()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test String</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={Boolean(isCompleted)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#faf7f2] dark:bg-slate-900 hover:bg-[#f4efe8] dark:hover:bg-slate-800 disabled:opacity-40 text-stone-700 dark:text-slate-200 border border-stone-200/90 dark:border-white/10 text-xs font-semibold transition active:scale-95 shadow-xs"
          >
            <SkipForward className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Step Char</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-2xl bg-[#faf7f2] dark:bg-slate-900 hover:bg-[#f4efe8] dark:hover:bg-slate-800 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white border border-stone-200/90 dark:border-white/10 transition active:scale-95 shadow-xs"
            title="Reset Tester"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono text-stone-500 dark:text-slate-400 font-bold">Quick Presets:</span>
        {presetStrings.map(p => (
          <button
            key={p}
            onClick={() => {
              setTestString(p);
              handleRunAll(p);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#f4efe8] dark:bg-slate-950/80 hover:bg-[#ebe4d8] dark:hover:bg-slate-800 text-xs font-mono text-stone-700 dark:text-slate-300 border border-stone-200/90 dark:border-white/[0.08] transition active:scale-95 shadow-xs"
          >
            {p === '' ? 'ε (empty string)' : `"${p}"`}
          </button>
        ))}
      </div>

      {/* Interactive Tape Ribbon with Laser Cursor */}
      {testString.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/80 border border-stone-200/90 dark:border-white/[0.08] space-y-2 transition-colors">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-slate-400 font-bold">
            <span>Input Ribbon:</span>
            <span>Position: {currentStepIndex} / {testString.length}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm overflow-x-auto py-1">
            {testString.split('').map((char, idx) => {
              const isCurrent = currentStepIndex > 0 && idx === currentStepIndex - 1;
              const isPast = idx < currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`w-9 h-11 rounded-xl flex flex-col items-center justify-center font-black border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-cyan-500/20 dark:bg-cyan-500/25 border-cyan-500 dark:border-cyan-400 text-cyan-950 dark:text-white shadow-xs dark:shadow-glow-cyan scale-110 z-10'
                      : isPast
                      ? 'bg-[#ebe4d8] dark:bg-slate-900 border-stone-300/70 dark:border-slate-700 text-stone-800 dark:text-slate-300'
                      : 'bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-white/[0.06] text-stone-400 dark:text-slate-600'
                  }`}
                >
                  <span className="text-sm">{char}</span>
                  <span className="text-[8px] opacity-60 font-normal">#{idx}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dual Simulation Display Cards */}
      {simResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* NFA Trace Box */}
          <div className="p-5 rounded-2xl bg-[#faf7f2]/95 dark:bg-slate-950/80 border border-violet-200 dark:border-violet-500/40 shadow-sm dark:shadow-glow-violet space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 font-mono">
                NFA State Superposition
              </span>
              {isCompleted && (
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono border ${
                  simResult.nfaAccepted 
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' 
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                }`}>
                  {simResult.nfaAccepted ? '✓ ACCEPTED' : '✕ REJECTED'}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-violet-50 dark:bg-slate-900 font-mono text-base font-black text-violet-900 dark:text-violet-200 border border-violet-200 dark:border-white/10 shadow-inner">
              {currentStep
                ? `{${currentStep.nfaNextActiveStates.join(', ') || '∅'}}`
                : `{${nfa.initialState}} (start)`}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 leading-relaxed font-sans">
              NFA can occupy multiple active states simultaneously along all reachable branching paths.
            </p>
          </div>

          {/* DFA Trace Box */}
          <div className="p-5 rounded-2xl bg-[#faf7f2]/95 dark:bg-slate-950/80 border border-cyan-200 dark:border-cyan-500/40 shadow-sm dark:shadow-glow-cyan space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-mono">
                DFA Current State
              </span>
              {isCompleted && (
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono border ${
                  simResult.dfaAccepted 
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' 
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                }`}>
                  {simResult.dfaAccepted ? '✓ ACCEPTED' : '✕ REJECTED'}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-slate-900 font-mono text-base font-black text-cyan-900 dark:text-cyan-200 border border-cyan-200 dark:border-white/10 shadow-inner">
              {currentStep ? currentStep.dfaNextState : dfa.initialState}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 leading-relaxed font-sans">
              DFA is strictly deterministic: exactly one subset state is active after every symbol.
            </p>
          </div>
        </div>
      )}

      {/* Equivalence Result Banner */}
      {isCompleted && (
        <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-md transition-colors ${
          simResult.equivalent
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            {simResult.equivalent ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-sm font-black">
                {simResult.equivalent
                  ? `Equivalence Verified for String "${testString || 'ε'}"`
                  : 'Behavioral Mismatch Detected!'}
              </div>
              <div className="text-xs opacity-90 mt-0.5 font-sans">
                {simResult.nfaAccepted
                  ? 'Both the original NFA and converted DFA accepted the input.'
                  : 'Both the original NFA and converted DFA rejected the input.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

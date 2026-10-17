import React from 'react';
import type { TMHistoryEntry } from '../../types/turing';
import { History, Eye, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';

interface TMHistoryProps {
  history: TMHistoryEntry[];
  inspectingStep: number | null;
  onInspectStep: (step: number | null) => void;
  blankSymbol: string;
}

export const TMHistory: React.FC<TMHistoryProps> = React.memo(({
  history,
  inspectingStep,
  onInspectStep,
  blankSymbol,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-stone-300/80 dark:border-white/[0.08] shadow-2xl space-y-4 bg-[#fffdf9]/95 dark:bg-slate-950/70">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 border border-violet-500/30">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">Execution Timeline</h3>
            <p className="text-[11px] text-stone-500 dark:text-slate-400 font-mono">
              {history.length} snapshots recorded
            </p>
          </div>
        </div>

        {inspectingStep !== null && (
          <button
            onClick={() => onInspectStep(null)}
            className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-800 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white px-2.5 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-500/40 shadow-xs transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Return to Live</span>
          </button>
        )}
      </div>

      {/* Time Travel Active Alert */}
      {inspectingStep !== null && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Inspecting state at <strong>Step #{inspectingStep}</strong>. Live machine state is preserved.
            </span>
          </div>
          <button
            onClick={() => onInspectStep(null)}
            className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 font-bold text-amber-900 dark:text-amber-100 transition shadow-xs"
          >
            Exit
          </button>
        </div>
      )}

      {/* Snapshot Logs List */}
      <div className="overflow-y-auto max-h-72 rounded-2xl border border-stone-300/80 dark:border-white/[0.08] divide-y divide-stone-200 dark:divide-white/[0.04] bg-[#f8f5ee] dark:bg-slate-950/60 shadow-inner">
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 dark:text-slate-500 space-y-1">
            <AlertCircle className="w-5 h-5 mx-auto text-stone-400 dark:text-slate-600 mb-2" />
            <div>No execution steps recorded yet.</div>
            <div className="text-[11px] text-stone-400 dark:text-slate-600">Click "Step" or "Run Machine" to log transitions.</div>
          </div>
        ) : (
          history.map((entry) => {
            const isSelected = inspectingStep === entry.step;

            // Generate tape snippet
            const head = entry.headPosition;
            let tapeSnippet = '';
            for (let i = head - 2; i <= head + 2; i++) {
              tapeSnippet += entry.tapeSnapshot[i] ?? blankSymbol;
            }

            return (
              <div
                key={entry.step}
                onClick={() => onInspectStep(entry.step)}
                className={`p-3 text-xs font-mono cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200'
                    : 'hover:bg-[#fffdf9] dark:hover:bg-slate-900/70 text-stone-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-bold text-stone-400 dark:text-slate-400 w-10 shrink-0">#{entry.step}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-950/80 border border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 font-bold shrink-0">
                    {entry.state}
                  </span>
                  <span className="text-stone-500 shrink-0 text-[11px]">pos:{entry.headPosition}</span>

                  {entry.appliedTransition ? (
                    <span className="text-stone-600 dark:text-slate-400 truncate flex items-center gap-1 text-[11px]">
                      <span>δ('{entry.appliedTransition.readSymbol}')</span>
                      <ArrowRight className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        '{entry.appliedTransition.writeSymbol}', {entry.appliedTransition.direction}
                      </span>
                    </span>
                  ) : (
                    <span className="text-stone-500 truncate text-[11px]">{entry.message}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline font-mono text-[10px] text-stone-700 dark:text-slate-400 bg-[#fffdf9] dark:bg-slate-900 px-2 py-0.5 rounded-md border border-stone-300/80 dark:border-white/5 shadow-xs font-semibold">
                    [{tapeSnippet}]
                  </span>
                  <Eye className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-white'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

TMHistory.displayName = 'TMHistory';

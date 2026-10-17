import React from 'react';
import type { NFADefinition, DFADefinition } from '../../types/automata';
import { Table, Network, CheckCircle, BarChart3 } from 'lucide-react';

interface AutomataStatsProps {
  nfa: NFADefinition;
  dfa: DFADefinition;
  tableData: Record<string, Record<string, string>>;
  viewMode: 'graph' | 'table';
  onToggleViewMode: (mode: 'graph' | 'table') => void;
}

export const AutomataStats: React.FC<AutomataStatsProps> = ({
  nfa,
  dfa,
  tableData,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-5 transition-colors duration-200">
      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-600/15 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm">Automata Metrics & Transition Function</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Formal specifications and deterministic transition matrix</p>
          </div>
        </div>

        {/* View mode toggle: Graph vs Table */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#f4efe8] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10">
          <button
            onClick={() => onToggleViewMode('graph')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'graph'
                ? 'bg-violet-600 text-white shadow-xs dark:shadow-glow-violet'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>State Graphs</span>
          </button>
          <button
            onClick={() => onToggleViewMode('table')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-cyan-600 text-white shadow-xs dark:shadow-glow-cyan'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Transition Matrix</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] hover:border-violet-500/40 transition">
          <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-mono font-bold block">Original NFA</span>
          <div className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 mt-1">{nfa.states.length}</div>
          <span className="text-[11px] text-stone-500 dark:text-slate-400 font-mono block mt-0.5">Start: {nfa.initialState}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] hover:border-cyan-500/40 transition">
          <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-mono font-bold block">Converted DFA</span>
          <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">{dfa.states.length}</div>
          <span className="text-[11px] text-stone-500 dark:text-slate-400 font-mono block mt-0.5">Start: {dfa.initialState}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] hover:border-emerald-500/40 transition">
          <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-mono font-bold block">Accepting Subsets</span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{dfa.acceptStates.length}</div>
          <span className="text-[11px] text-stone-500 dark:text-slate-400 font-mono block mt-0.5 truncate">
            {dfa.acceptStates.length > 0 ? dfa.acceptStates.join(', ') : 'None'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] hover:border-emerald-500/40 transition">
          <span className="text-[10px] text-stone-500 dark:text-slate-400 uppercase font-mono font-bold block">Determinism</span>
          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5 mt-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Complete DFA</span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-slate-400 font-mono block mt-1">Every state has |Σ| moves</span>
        </div>
      </div>

      {/* DFA Transition Table (when active) */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200/90 dark:border-white/[0.08]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#f4efe8]/95 dark:bg-slate-950 text-stone-700 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-stone-200/90 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-4 font-bold">DFA State (Subset)</th>
                <th className="py-3 px-4 font-bold">Classification</th>
                {dfa.alphabet.map((sym) => (
                  <th key={sym} className="py-3 px-4 text-cyan-700 dark:text-cyan-300 font-bold">
                    Input '{sym}'
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-white/[0.04] bg-[#faf7f2] dark:bg-slate-950/60">
              {dfa.states.map((subset) => {
                const isInit = subset === dfa.initialState;
                const isAcc = dfa.acceptStates.includes(subset);

                return (
                  <tr key={subset} className="hover:bg-[#f4efe8]/50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                      {isInit && <span className="text-cyan-600 dark:text-cyan-400 text-xs">▶</span>}
                      <span>{subset}</span>
                    </td>
                    <td className="py-3 px-4">
                      {isAcc && isInit ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 text-[10px] font-bold">
                          Start & Accept
                        </span>
                      ) : isAcc ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/50 text-[10px] font-bold">
                          Accepting
                        </span>
                      ) : isInit ? (
                        <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-200 border border-violet-300 dark:border-violet-500/50 text-[10px] font-bold">
                          Start State
                        </span>
                      ) : (
                        <span className="text-stone-500 text-[10px]">Non-accepting</span>
                      )}
                    </td>
                    {dfa.alphabet.map((sym) => {
                      const dest = tableData[subset]?.[sym] || '∅';
                      return (
                        <td key={sym} className="py-3 px-4 font-black text-cyan-700 dark:text-cyan-300">
                          {dest}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

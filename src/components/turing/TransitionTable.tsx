import React, { useState } from 'react';
import type { TMTransition, TMHeadDirection } from '../../types/turing';
import { Plus, Trash2, Search, ArrowRight, TableProperties } from 'lucide-react';

interface TransitionTableProps {
  transitions: TMTransition[];
  states: string[];
  activeTransition?: TMTransition;
  onAddTransition: (t: Omit<TMTransition, 'id'>) => void;
  onDeleteTransition: (id: string) => void;
  readOnly?: boolean;
}

export const TransitionTable: React.FC<TransitionTableProps> = React.memo(({
  transitions,
  states,
  activeTransition,
  onAddTransition,
  onDeleteTransition,
  readOnly = false,
}) => {
  const [filter, setFilter] = useState('');
  const [newFromState, setNewFromState] = useState(states[0] || 'q0');
  const [newReadSymbol, setNewReadSymbol] = useState('');
  const [newNextState, setNewNextState] = useState(states[0] || 'q0');
  const [newWriteSymbol, setNewWriteSymbol] = useState('');
  const [newDirection, setNewDirection] = useState<TMHeadDirection>('R');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newReadSymbol || newReadSymbol.length !== 1) {
      setError('Read symbol must be a single character.');
      return;
    }
    if (!newWriteSymbol || newWriteSymbol.length !== 1) {
      setError('Write symbol must be a single character.');
      return;
    }

    // Check duplicate
    const exists = transitions.some(
      t => t.currentState === newFromState && t.readSymbol === newReadSymbol
    );
    if (exists) {
      setError(`Transition for (${newFromState}, '${newReadSymbol}') already exists!`);
      return;
    }

    onAddTransition({
      currentState: newFromState,
      readSymbol: newReadSymbol,
      nextState: newNextState,
      writeSymbol: newWriteSymbol,
      direction: newDirection,
    });

    setNewReadSymbol('');
    setNewWriteSymbol('');
  };

  const filtered = transitions.filter(t => 
    t.currentState.toLowerCase().includes(filter.toLowerCase()) ||
    t.nextState.toLowerCase().includes(filter.toLowerCase()) ||
    t.readSymbol.includes(filter) ||
    t.writeSymbol.includes(filter)
  );

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-4 bg-[#faf7f2]/95 dark:bg-slate-950/70">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 border border-violet-500/30">
            <TableProperties className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
              <span>Transition Function Matrix (δ)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-stone-800 dark:text-cyan-300 font-bold shadow-xs">
                {transitions.length} rules
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              δ : Q × Γ → Q × Γ × {'{'}L, R, S{'}'}
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search state or symbol..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 text-xs text-stone-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-xs"
          />
        </div>
      </div>

      {/* Add Transition Form (if not readOnly) */}
      {!readOnly && (
        <form onSubmit={handleAdd} className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#f4efe8]/70 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.07] space-y-2.5">
          <div className="text-[11px] font-mono font-bold text-stone-600 dark:text-slate-400 uppercase tracking-wider">
            Define New Rule:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* From State */}
            <select
              value={newFromState}
              onChange={(e) => setNewFromState(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono font-bold text-violet-700 dark:text-violet-300 focus:outline-none shadow-xs"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <span className="text-stone-500 font-mono text-xs">read</span>

            {/* Read Symbol */}
            <input
              type="text"
              maxLength={1}
              value={newReadSymbol}
              onChange={(e) => setNewReadSymbol(e.target.value)}
              placeholder="sym"
              className="w-12 sm:w-14 px-2 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono text-center font-bold text-teal-700 dark:text-cyan-300 focus:outline-none shadow-xs"
            >
            </input>

            <ArrowRight className="w-4 h-4 text-stone-400" />

            {/* Next State */}
            <select
              value={newNextState}
              onChange={(e) => setNewNextState(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono font-bold text-violet-700 dark:text-violet-300 focus:outline-none shadow-xs"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <span className="text-stone-500 font-mono text-xs">write</span>

            {/* Write Symbol */}
            <input
              type="text"
              maxLength={1}
              value={newWriteSymbol}
              onChange={(e) => setNewWriteSymbol(e.target.value)}
              placeholder="sym"
              className="w-12 sm:w-14 px-2 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono text-center font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none shadow-xs"
            >
            </input>

            {/* Direction */}
            <select
              value={newDirection}
              onChange={(e) => setNewDirection(e.target.value as TMHeadDirection)}
              className="px-2.5 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono font-bold text-sky-700 dark:text-sky-300 focus:outline-none shadow-xs"
            >
              <option value="R">R (Right)</option>
              <option value="L">L (Left)</option>
              <option value="S">S (Stay)</option>
            </select>

            <button
              type="submit"
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition shadow-md shadow-violet-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>

          {error && <p className="text-xs text-rose-500 font-mono pt-1 font-semibold">{error}</p>}
        </form>
      )}

      {/* Table of Transitions */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-2xl border border-stone-200/90 dark:border-white/[0.08] shadow-xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#f4efe8]/95 dark:bg-slate-950 text-stone-700 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-stone-200/90 dark:border-white/[0.08] backdrop-blur-md">
            <tr>
              <th className="py-2.5 px-4 font-bold">Current State</th>
              <th className="py-2.5 px-4 font-bold">Read Symbol</th>
              <th className="py-2.5 px-4 font-bold">Next State</th>
              <th className="py-2.5 px-4 font-bold">Write Symbol</th>
              <th className="py-2.5 px-4 font-bold">Move Head</th>
              {!readOnly && <th className="py-2.5 px-4 text-right font-bold">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-white/[0.04] bg-[#faf7f2] dark:bg-slate-950/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400 dark:text-slate-500 font-sans text-xs">
                  No transitions found matching query.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isActive = activeTransition?.id === t.id;

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors duration-150 ${
                      isActive
                        ? 'bg-amber-500/10 dark:bg-cyan-950/80 border-l-4 border-amber-600 dark:border-cyan-500 text-stone-900 dark:text-cyan-200 shadow-sm'
                        : 'hover:bg-[#f4efe6] dark:hover:bg-slate-900/60 text-stone-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-violet-700 dark:text-violet-300">{t.currentState}</td>
                    <td className="py-2.5 px-4 font-bold text-teal-800 dark:text-cyan-300">
                      <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-cyan-950/60 border border-teal-200 dark:border-cyan-500/30">
                        '{t.readSymbol}'
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-violet-700 dark:text-violet-200">{t.nextState}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30">
                        '{t.writeSymbol}'
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-sky-700 dark:text-sky-300">
                      <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-500/30">
                        {t.direction}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteTransition(t.id)}
                          title="Delete transition"
                          className="p-1 rounded-lg text-stone-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

TransitionTable.displayName = 'TransitionTable';

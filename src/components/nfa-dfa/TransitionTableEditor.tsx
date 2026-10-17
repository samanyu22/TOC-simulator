import React, { useState } from 'react';
import type { NFADefinition, NFATransition } from '../../types/automata';
import { EPSILON } from '../../types/automata';
import { Plus, Trash2, ArrowRight, ShieldCheck, Flag } from 'lucide-react';

interface TransitionTableEditorProps {
  nfa: NFADefinition;
  onChangeNFA: (updated: NFADefinition) => void;
}

export const TransitionTableEditor: React.FC<TransitionTableEditorProps> = ({
  nfa,
  onChangeNFA,
}) => {
  const [fromState, setFromState] = useState(nfa.states[0] || 'q0');
  const [symbol, setSymbol] = useState(nfa.alphabet[0] || '0');
  const [toState, setToState] = useState(nfa.states[0] || 'q0');
  const [newStateName, setNewStateName] = useState('');
  const [newAlphabetChar, setNewAlphabetChar] = useState('');

  // Add transition
  const handleAddTransition = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: NFATransition = {
      id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromState,
      symbol: symbol === 'eps' || symbol === 'e' ? EPSILON : symbol,
      toState,
    };
    onChangeNFA({
      ...nfa,
      transitions: [...nfa.transitions, newT],
    });
  };

  // Delete transition
  const handleDeleteTransition = (id: string) => {
    onChangeNFA({
      ...nfa,
      transitions: nfa.transitions.filter(t => t.id !== id),
    });
  };

  // Add new state
  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStateName.trim();
    if (!name || nfa.states.includes(name)) return;
    onChangeNFA({
      ...nfa,
      states: [...nfa.states, name],
    });
    setNewStateName('');
  };

  // Toggle accept state
  const handleToggleAccept = (st: string) => {
    const isAcc = nfa.acceptStates.includes(st);
    const updatedAccept = isAcc
      ? nfa.acceptStates.filter(s => s !== st)
      : [...nfa.acceptStates, st];
    onChangeNFA({
      ...nfa,
      acceptStates: updatedAccept,
    });
  };

  // Set initial state
  const handleSetInitial = (st: string) => {
    onChangeNFA({
      ...nfa,
      initialState: st,
    });
  };

  // Add alphabet symbol
  const handleAddAlphabet = (e: React.FormEvent) => {
    e.preventDefault();
    const s = newAlphabetChar.trim();
    if (!s || s.length !== 1 || nfa.alphabet.includes(s)) return;
    onChangeNFA({
      ...nfa,
      alphabet: [...nfa.alphabet, s],
    });
    setNewAlphabetChar('');
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-stone-200/90 dark:border-slate-700/60 shadow-xl space-y-5 transition-colors duration-200">
      {/* State Badges & Management */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider">
            States ({nfa.states.length}):
          </label>
          <span className="text-[11px] text-stone-500 dark:text-slate-400">Click shield to toggle Accepting state</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {nfa.states.map((st) => {
            const isInit = st === nfa.initialState;
            const isAcc = nfa.acceptStates.includes(st);

            return (
              <div
                key={st}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition ${
                  isInit
                    ? 'bg-violet-100 dark:bg-violet-950/70 border-violet-300 dark:border-violet-500 text-violet-900 dark:text-violet-200 shadow-xs dark:shadow-glow-violet'
                    : 'bg-[#faf7f2] dark:bg-slate-900 border-stone-200/90 dark:border-slate-700 text-stone-800 dark:text-slate-300'
                }`}
              >
                {/* Initial button */}
                <button
                  onClick={() => handleSetInitial(st)}
                  title={isInit ? 'Current initial state' : 'Set as initial state'}
                  className={`p-0.5 rounded transition ${isInit ? 'text-violet-600 dark:text-violet-400' : 'text-stone-400 hover:text-stone-700 dark:hover:text-white'}`}
                >
                  <Flag className="w-3.5 h-3.5 fill-current" />
                </button>

                <span className="font-bold">{st}</span>

                {/* Accept toggle button */}
                <button
                  onClick={() => handleToggleAccept(st)}
                  title={isAcc ? 'Accepting State (double circle)' : 'Mark as accepting state'}
                  className={`p-0.5 rounded transition ${isAcc ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-700 dark:hover:text-white'}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Add State form */}
          <form onSubmit={handleAddState} className="flex items-center gap-1">
            <input
              type="text"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              placeholder="e.g. q3"
              className="w-16 px-2 py-1 rounded-lg bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-slate-700 text-xs font-mono text-stone-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-[#f4efe8] dark:bg-slate-800 hover:bg-[#ebe4d8] dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs transition border border-stone-200/90 dark:border-transparent"
              title="Add State"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Alphabet symbols */}
      <div>
        <label className="text-xs font-semibold text-stone-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
          Input Alphabet (Σ):
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {nfa.alphabet.map((sym) => (
            <span
              key={sym}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200 text-xs font-mono font-bold"
            >
              '{sym}'
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-500/30 text-violet-800 dark:text-violet-300 text-xs font-mono">
            '{EPSILON}' (ε-moves)
          </span>

          <form onSubmit={handleAddAlphabet} className="flex items-center gap-1">
            <input
              type="text"
              maxLength={1}
              value={newAlphabetChar}
              onChange={(e) => setNewAlphabetChar(e.target.value)}
              placeholder="+"
              className="w-10 px-2 py-1 rounded-lg bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-slate-700 text-xs font-mono text-center text-stone-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-[#f4efe8] dark:bg-slate-800 hover:bg-[#ebe4d8] dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs transition border border-stone-200/90 dark:border-transparent"
              title="Add Symbol to Alphabet"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Transition Form */}
      <form onSubmit={handleAddTransition} className="p-3.5 rounded-xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-slate-800 space-y-2 transition-colors">
        <div className="text-xs font-medium text-stone-700 dark:text-slate-300">Add NFA Transition:</div>
        <div className="flex flex-wrap items-center gap-2">
          {/* From */}
          <select
            value={fromState}
            onChange={(e) => setFromState(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 text-xs font-mono text-stone-800 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            {nfa.states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span className="text-stone-400 font-mono text-xs">on</span>

          {/* Symbol */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 text-xs font-mono text-cyan-700 dark:text-cyan-300 focus:outline-none shadow-xs"
          >
            {nfa.alphabet.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
            <option value={EPSILON}>{EPSILON} (epsilon)</option>
          </select>

          <ArrowRight className="w-4 h-4 text-stone-400 dark:text-slate-500" />

          {/* To */}
          <select
            value={toState}
            onChange={(e) => setToState(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#faf7f2] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-700 text-xs font-mono text-stone-800 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            {nfa.states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition ml-auto shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transition</span>
          </button>
        </div>
      </form>

      {/* Transition List */}
      <div className="overflow-y-auto max-h-56 rounded-xl border border-stone-200/90 dark:border-slate-800 divide-y divide-stone-200 dark:divide-slate-800/60 bg-[#faf7f2] dark:bg-slate-950/40">
        {nfa.transitions.length === 0 ? (
          <div className="p-4 text-center text-xs text-stone-400">No transitions defined.</div>
        ) : (
          nfa.transitions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-2.5 text-xs font-mono hover:bg-[#f4efe8]/60 dark:hover:bg-slate-900/40 transition"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-violet-700 dark:text-violet-400">{t.fromState}</span>
                <span className="text-stone-400">--[</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-400">{t.symbol}</span>
                <span className="text-stone-400">]--&gt;</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{t.toState}</span>
              </div>

              <button
                onClick={() => handleDeleteTransition(t.id)}
                className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                title="Delete Transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

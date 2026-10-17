import React, { useState } from 'react';
import { TM_EXAMPLES } from '../../simulators/turing-machine/examples';
import { NFA_EXAMPLES } from '../../simulators/nfa-dfa/examples';
import { Cpu, Network, Search, ArrowRight, Layers } from 'lucide-react';

interface ExampleLibraryProps {
  onLoadTM: (tmId: string) => void;
  onLoadNFA: (nfaId: string) => void;
}

export const ExampleLibrary: React.FC<ExampleLibraryProps> = ({
  onLoadTM,
  onLoadNFA,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'tm' | 'nfa'>('all');
  const [search, setSearch] = useState('');

  const filteredTMs = TM_EXAMPLES.filter(tm => 
    (filterType === 'all' || filterType === 'tm') &&
    (tm.name.toLowerCase().includes(search.toLowerCase()) || 
     tm.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredNFAs = NFA_EXAMPLES.filter(nfa => 
    (filterType === 'all' || filterType === 'nfa') &&
    (nfa.name.toLowerCase().includes(search.toLowerCase()) || 
     nfa.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-2xl relative overflow-hidden transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Predefined Machine Library
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            11 mathematically verified Turing machines and finite automata with genuine transitions.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                filterType === 'all' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('tm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                filterType === 'tm' ? 'bg-violet-600 text-white shadow-violet-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Turing Machines
            </button>
            <button
              onClick={() => setFilterType('nfa')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                filterType === 'nfa' ? 'bg-cyan-600 text-white shadow-cyan-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              NFA Automata
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, theory..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Grid of Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Turing Machines */}
        {filteredTMs.map((tm) => (
          <div
            key={tm.id}
            className="glass-panel glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-5 transition-colors"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/80 border border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold">
                  <Cpu className="w-3.5 h-3.5" />
                  Turing Machine
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  {tm.states.length} states
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{tm.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3 font-sans">
                  {tm.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  Σ: [{tm.alphabet.join(', ')}]
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-cyan-700 dark:text-cyan-300">
                  Input: "{tm.defaultInput}"
                </span>
              </div>
            </div>

            <button
              onClick={() => onLoadTM(tm.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600 text-violet-800 hover:text-white dark:bg-violet-600/30 dark:hover:bg-violet-600 dark:text-violet-200 border border-violet-400/40 dark:border-violet-500/40 text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs"
            >
              <span>Load in TM Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* NFAs */}
        {filteredNFAs.map((nfa) => (
          <div
            key={nfa.id}
            className="glass-panel glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-5 transition-colors"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold">
                  <Network className="w-3.5 h-3.5" />
                  NFA Automaton
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  {nfa.states.length} states
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{nfa.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3 font-sans">
                  {nfa.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                  Σ: [{nfa.alphabet.join(', ')}]
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-cyan-700 dark:text-cyan-300">
                  Rules: {nfa.transitions.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => onLoadNFA(nfa.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600 text-cyan-800 hover:text-white dark:bg-cyan-600/30 dark:hover:bg-cyan-600 dark:text-cyan-200 border border-cyan-400/40 dark:border-cyan-500/40 text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs"
            >
              <span>Load in NFA Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

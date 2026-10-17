import React, { useState, useMemo } from 'react';
import { TM_EXAMPLES } from '../../simulators/turing-machine/examples';
import { NFA_EXAMPLES } from '../../simulators/nfa-dfa/examples';
import type { TMDefinition } from '../../types/turing';
import type { NFADefinition } from '../../types/automata';
import { 
  Cpu, 
  Network, 
  Search, 
  ArrowRight, 
  Layers
} from 'lucide-react';

interface ExampleLibraryProps {
  onLoadTM: (tmId: string) => void;
  onLoadNFA: (nfaId: string) => void;
}

// ---------------------------------------------------------------------------
// Turing Machine Preset Card
// ---------------------------------------------------------------------------
interface TMCardProps {
  tm: TMDefinition;
  onLoad: (id: string) => void;
}

const TMCard: React.FC<TMCardProps> = ({ tm, onLoad }) => {
  return (
    <div className="glass-panel glass-card-hover rounded-3xl p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-xl flex flex-col justify-between space-y-6 transition-all">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/80 border border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold shadow-2xs">
            <Cpu className="w-3.5 h-3.5" />
            Turing Machine
          </span>
          <span className="text-[11px] font-mono text-stone-600 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5">
            {tm.states.length} states • {tm.transitions.length} rules
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">{tm.name}</h3>
          <p className="text-xs text-stone-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3 font-sans">
            {tm.description}
          </p>
        </div>

        {/* Formal Machine Meta Tokens */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-stone-600 dark:text-slate-400 pt-1">
          <span className="px-2 py-0.5 rounded-md bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5">
            Σ: [{tm.alphabet.join(', ')}]
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5">
            Tape: [{tm.tapeAlphabet.join(', ')}]
          </span>
          <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 font-bold">
            q₀: {tm.initialState}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 font-bold">
            Sample: "{tm.defaultInput}"
          </span>
        </div>
      </div>

      {/* Primary Simulator Load Button */}
      <button
        onClick={() => onLoad(tm.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600 text-violet-800 hover:text-white dark:bg-violet-600/30 dark:hover:bg-violet-600 dark:text-violet-200 border border-violet-400/40 dark:border-violet-500/40 text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs group/btn cursor-pointer"
      >
        <span>Open in TM Simulator</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// NFA Automaton Preset Card
// ---------------------------------------------------------------------------
interface NFACardProps {
  nfa: NFADefinition;
  onLoad: (id: string) => void;
}

const NFACard: React.FC<NFACardProps> = ({ nfa, onLoad }) => {
  return (
    <div className="glass-panel glass-card-hover rounded-3xl p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-xl flex flex-col justify-between space-y-6 transition-all">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold shadow-2xs">
            <Network className="w-3.5 h-3.5" />
            NFA Automaton
          </span>
          <span className="text-[11px] font-mono text-stone-600 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5">
            {nfa.states.length} states • {nfa.transitions.length} rules
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">{nfa.name}</h3>
          <p className="text-xs text-stone-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3 font-sans">
            {nfa.description}
          </p>
        </div>

        {/* Formal Meta Tokens */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-stone-600 dark:text-slate-400 pt-1">
          <span className="px-2 py-0.5 rounded-md bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5">
            Σ: [{nfa.alphabet.join(', ')}]
          </span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 font-bold">
            q₀: {nfa.initialState}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-bold">
            F: [{nfa.acceptStates.join(', ')}]
          </span>
          {nfa.defaultInput && (
            <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 font-bold">
              Sample: "{nfa.defaultInput}"
            </span>
          )}
        </div>
      </div>

      {/* Primary Simulator Load Button */}
      <button
        onClick={() => onLoad(nfa.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600 text-cyan-800 hover:text-white dark:bg-cyan-600/30 dark:hover:bg-cyan-600 dark:text-cyan-200 border border-cyan-400/40 dark:border-cyan-500/40 text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs group/btn cursor-pointer"
      >
        <span>Open in NFA Converter</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Predefined Machine Library Page
// ---------------------------------------------------------------------------
export const ExampleLibrary: React.FC<ExampleLibraryProps> = ({
  onLoadTM,
  onLoadNFA,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'tm' | 'nfa'>('all');
  const [search, setSearch] = useState('');

  const filteredTMs = useMemo(() => {
    return TM_EXAMPLES.filter(tm => 
      (filterType === 'all' || filterType === 'tm') &&
      (tm.name.toLowerCase().includes(search.toLowerCase()) || 
       tm.description.toLowerCase().includes(search.toLowerCase()) ||
       tm.alphabet.some(a => a.toLowerCase().includes(search.toLowerCase())))
    );
  }, [filterType, search]);

  const filteredNFAs = useMemo(() => {
    return NFA_EXAMPLES.filter(nfa => 
      (filterType === 'all' || filterType === 'nfa') &&
      (nfa.name.toLowerCase().includes(search.toLowerCase()) || 
       nfa.description.toLowerCase().includes(search.toLowerCase()) ||
       nfa.alphabet.some(a => a.toLowerCase().includes(search.toLowerCase())))
    );
  }, [filterType, search]);

  const totalCount = filteredTMs.length + filteredNFAs.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-8 rounded-3xl glass-panel border border-stone-200/90 dark:border-white/[0.08] shadow-2xl relative overflow-hidden transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Predefined Machine Library
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-slate-400 font-mono">
            11 mathematically verified Turing machines and finite automata ready to load into the simulators.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#f4efe8] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow' 
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              All ({TM_EXAMPLES.length + NFA_EXAMPLES.length})
            </button>
            <button
              onClick={() => setFilterType('tm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                filterType === 'tm' 
                  ? 'bg-violet-600 text-white shadow-violet-900/20' 
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              TMs ({TM_EXAMPLES.length})
            </button>
            <button
              onClick={() => setFilterType('nfa')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                filterType === 'nfa' 
                  ? 'bg-cyan-600 text-white shadow-cyan-900/20' 
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              NFAs ({NFA_EXAMPLES.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search presets, alphabet..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 text-xs text-stone-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Grid of Examples */}
      {totalCount === 0 ? (
        <div className="text-center py-16 space-y-3 glass-panel rounded-3xl border border-stone-200/90 dark:border-white/10">
          <p className="text-stone-500 text-sm">No machine presets matched "{search}".</p>
          <button
            onClick={() => { setSearch(''); setFilterType('all'); }}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold transition active:scale-95 shadow-sm"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Render Turing Machine Cards */}
          {filteredTMs.map((tm) => (
            <TMCard key={tm.id} tm={tm} onLoad={onLoadTM} />
          ))}

          {/* Render NFA Cards */}
          {filteredNFAs.map((nfa) => (
            <NFACard key={nfa.id} nfa={nfa} onLoad={onLoadNFA} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExampleLibrary;

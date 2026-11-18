import React, { useState, useMemo } from 'react';
import { NFA_EXAMPLES } from '../../simulators/nfa-dfa/examples';
import type { NFADefinition } from '../../types/automata';
import { 
  Network, 
  Search, 
  ArrowRight, 
  Layers
} from 'lucide-react';

interface ExampleLibraryProps {
  onLoadTM?: (tmId: string) => void;
  onLoadNFA: (nfaId: string) => void;
}

// ---------------------------------------------------------------------------
// NFA Automaton Preset Card
// ---------------------------------------------------------------------------
interface NFACardProps {
  nfa: NFADefinition;
  onLoad: (id: string) => void;
}

const NFACard: React.FC<NFACardProps> = ({ nfa, onLoad }) => {
  return (
    <div className="glass-panel glass-card-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4 sm:space-y-6 transition-all">
      <div className="space-y-3 sm:space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold shadow-2xs">
            <Network className="w-3.5 h-3.5 shrink-0" />
            NFA Automaton
          </span>
          <span className="text-[11px] font-mono text-stone-600 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/5 truncate">
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
        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform shrink-0" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Predefined Machine Library Page
// ---------------------------------------------------------------------------
export const ExampleLibrary: React.FC<ExampleLibraryProps> = ({
  onLoadNFA,
}) => {
  const [search, setSearch] = useState('');

  const filteredNFAs = useMemo(() => {
    return NFA_EXAMPLES.filter(nfa => 
      nfa.name.toLowerCase().includes(search.toLowerCase()) || 
      nfa.description.toLowerCase().includes(search.toLowerCase()) ||
      nfa.alphabet.some(a => a.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-stone-200/90 dark:border-white/[0.08] shadow-2xl relative overflow-hidden transition-colors">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Predefined Automata Library
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-slate-400 font-mono">
            {NFA_EXAMPLES.length} mathematically verified finite automata models ready to load into the simulator.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search automata, alphabet..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#faf7f2] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 text-xs text-stone-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* Grid of Examples */}
      {filteredNFAs.length === 0 ? (
        <div className="text-center py-16 space-y-3 glass-panel rounded-3xl border border-stone-200/90 dark:border-white/10">
          <p className="text-stone-500 text-sm">No automata presets matched "{search}".</p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold transition active:scale-95 shadow-sm"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFAs.map((nfa) => (
            <NFACard key={nfa.id} nfa={nfa} onLoad={onLoadNFA} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExampleLibrary;

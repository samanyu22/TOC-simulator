import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { NFADefinition, NFATransition } from '../../types/automata';
import { EPSILON } from '../../types/automata';
import { NFA_EXAMPLES } from '../../simulators/nfa-dfa/examples';
import { convertNfaToDfa } from '../../simulators/nfa-dfa/subset-construction';
import { AutomataGraph } from './AutomataGraph';
import { TransitionTableEditor } from './TransitionTableEditor';
import { SubsetConversionWalkthrough } from './SubsetConversionWalkthrough';
import { StringTester } from './StringTester';
import { AutomataStats } from './AutomataStats';
import { Network, BookOpen, Download, RotateCcw, Columns, Square } from 'lucide-react';

interface NFADFASimulatorProps {
  initialNFA?: NFADefinition;
  onNFAChange?: (nfa: NFADefinition) => void;
}

export const NFADFASimulator: React.FC<NFADFASimulatorProps> = ({
  initialNFA = NFA_EXAMPLES[0],
  onNFAChange,
}) => {
  const [currentNFA, setCurrentNFA] = useState<NFADefinition>(initialNFA);
  const [conversionStepIndex, setConversionStepIndex] = useState<number>(1);
  const [viewLayout, setViewLayout] = useState<'side-by-side' | 'tabbed'>('side-by-side');
  const [activeTab, setActiveTab] = useState<'nfa' | 'dfa'>('nfa');
  const [statsViewMode, setStatsViewMode] = useState<'graph' | 'table'>('graph');
  
  // Real-time active states from string tester
  const [activeNFAStates, setActiveNFAStates] = useState<string[]>([]);
  const [activeDFAState, setActiveDFAState] = useState<string>('');

  // Synchronize when initialNFA prop changes from Library or Import
  useEffect(() => {
    if (initialNFA) {
      setCurrentNFA(initialNFA);
      setConversionStepIndex(1);
      setActiveNFAStates([]);
      setActiveDFAState('');
    }
  }, [initialNFA]);

  // Re-run subset construction on NFA change
  const conversionResult = useMemo(() => {
    return convertNfaToDfa(currentNFA);
  }, [currentNFA]);

  const { dfa, steps, table } = conversionResult;

  // Handle example selection
  const handleSelectExample = (id: string) => {
    const selected = NFA_EXAMPLES.find(e => e.id === id) || NFA_EXAMPLES[0];
    setCurrentNFA(selected);
    setConversionStepIndex(1);
    setActiveNFAStates([]);
    setActiveDFAState('');
    if (onNFAChange) onNFAChange(selected);
  };

  // Export JSON
  const handleExportJSON = () => {
    const exportData = {
      nfa: currentNFA,
      dfa,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNFA.id}-automata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert NFA transitions to graph format
  const nfaGraphTransitions = useMemo(() => {
    return currentNFA.transitions.map(t => ({
      from: t.fromState,
      symbol: t.symbol,
      to: t.toState,
    }));
  }, [currentNFA.transitions]);

  // Convert DFA transitions to graph format
  const dfaGraphTransitions = useMemo(() => {
    return dfa.transitions.map(t => ({
      from: t.fromSubset,
      symbol: t.symbol,
      to: t.toSubset,
    }));
  }, [dfa.transitions]);

  // --- NFA Graph Direct Manipulation Handlers ---
  const handleAddState = useCallback((name: string, isAccept: boolean = false) => {
    setCurrentNFA(prev => {
      if (prev.states.includes(name)) return prev;
      return {
        ...prev,
        states: [...prev.states, name],
        acceptStates: isAccept ? [...prev.acceptStates, name] : prev.acceptStates,
      };
    });
    setConversionStepIndex(1);
  }, []);

  const handleAddTransition = useCallback((from: string, symbol: string, to: string) => {
    setCurrentNFA(prev => {
      const exists = prev.transitions.some(
        t => t.fromState === from && t.toState === to && t.symbol === symbol
      );
      if (exists) return prev;

      const newTransition: NFATransition = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromState: from,
        symbol: symbol === 'eps' || symbol === 'e' ? EPSILON : symbol,
        toState: to,
      };

      const updatedAlphabet = (symbol !== EPSILON && !prev.alphabet.includes(symbol))
        ? [...prev.alphabet, symbol]
        : prev.alphabet;

      return {
        ...prev,
        alphabet: updatedAlphabet,
        transitions: [...prev.transitions, newTransition],
      };
    });
    setConversionStepIndex(1);
  }, []);

  const handleDeleteState = useCallback((stateId: string) => {
    setCurrentNFA(prev => {
      if (prev.states.length <= 1) return prev;
      const remainingStates = prev.states.filter(s => s !== stateId);
      const remainingAccept = prev.acceptStates.filter(s => s !== stateId);
      const newInitial = prev.initialState === stateId ? (remainingStates[0] || 'q0') : prev.initialState;
      const remainingTransitions = prev.transitions.filter(
        t => t.fromState !== stateId && t.toState !== stateId
      );

      return {
        ...prev,
        states: remainingStates,
        acceptStates: remainingAccept,
        initialState: newInitial,
        transitions: remainingTransitions,
      };
    });
    setConversionStepIndex(1);
  }, []);

  const handleDeleteTransition = useCallback((from: string, to: string, symbol?: string) => {
    setCurrentNFA(prev => {
      const remainingTransitions = prev.transitions.filter(t => {
        if (t.fromState === from && t.toState === to) {
          if (symbol) return t.symbol !== symbol;
          return false;
        }
        return true;
      });

      return {
        ...prev,
        transitions: remainingTransitions,
      };
    });
    setConversionStepIndex(1);
  }, []);

  const handleToggleAcceptState = useCallback((stateId: string) => {
    setCurrentNFA(prev => {
      const isAcc = prev.acceptStates.includes(stateId);
      return {
        ...prev,
        acceptStates: isAcc
          ? prev.acceptStates.filter(s => s !== stateId)
          : [...prev.acceptStates, stateId],
      };
    });
    setConversionStepIndex(1);
  }, []);

  const handleSetInitialState = useCallback((stateId: string) => {
    setCurrentNFA(prev => ({
      ...prev,
      initialState: stateId,
    }));
    setConversionStepIndex(1);
  }, []);

  // Highlight elements during walkthrough
  const currentWalkthroughStep = steps[conversionStepIndex - 1];
  const highlightedNFAStates = currentWalkthroughStep
    ? currentWalkthroughStep.reachedNFAStates
    : activeNFAStates;

  const highlightedDFANode = currentWalkthroughStep
    ? currentWalkthroughStep.targetSubsetName
    : activeDFAState;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header and Example Picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 rounded-3xl glass-panel border border-stone-300/80 dark:border-white/[0.08] shadow-xl bg-[#fffdf9]/95 dark:bg-slate-950/70 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30">
              <Network className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
                <span>{currentNFA.name}</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300">
                  NFA → DFA Converter
                </span>
              </h1>
              <p className="text-xs text-stone-600 dark:text-slate-400 mt-0.5 font-sans leading-relaxed">{currentNFA.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Example Selector */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <select
              value={currentNFA.id}
              onChange={(e) => handleSelectExample(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-[#fffdf9] dark:bg-slate-950 border border-stone-300/90 dark:border-white/10 text-xs font-semibold text-stone-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              {NFA_EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Side-by-Side vs Tabbed Layout Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-[#ede7da] dark:bg-slate-950 border border-stone-300/90 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setViewLayout('side-by-side')}
              className={`p-2 rounded-xl text-xs transition ${
                viewLayout === 'side-by-side' ? 'bg-cyan-600 text-white shadow-sm' : 'text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-white'
              }`}
              title="Side-by-side comparison"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('tabbed')}
              className={`p-2 rounded-xl text-xs transition ${
                viewLayout === 'tabbed' ? 'bg-cyan-600 text-white shadow-sm' : 'text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-white'
              }`}
              title="Single page view"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            title="Export Automata JSON"
            className="p-2.5 rounded-2xl bg-[#fffdf9] dark:bg-slate-900 hover:bg-[#f6f2e8] dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-300/90 dark:border-white/10 transition active:scale-95 shadow-xs"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              setConversionStepIndex(1);
              setActiveNFAStates([]);
              setActiveDFAState('');
            }}
            title="Reset simulation"
            className="p-2.5 rounded-2xl bg-[#fffdf9] dark:bg-slate-900 hover:bg-[#f6f2e8] dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-300/90 dark:border-white/10 transition active:scale-95 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Automata Graphs Area */}
      {viewLayout === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NFA Graph */}
          <div className="space-y-2">
            <AutomataGraph
              key={`nfa-${currentNFA.id}`}
              title="Nondeterministic Finite Automaton (NFA)"
              states={currentNFA.states}
              initialState={currentNFA.initialState}
              acceptStates={currentNFA.acceptStates}
              transitions={nfaGraphTransitions}
              activeStates={highlightedNFAStates}
              isEditable={true}
              alphabet={currentNFA.alphabet}
              onAddState={handleAddState}
              onAddTransition={handleAddTransition}
              onDeleteState={handleDeleteState}
              onDeleteTransition={handleDeleteTransition}
              onToggleAcceptState={handleToggleAcceptState}
              onSetInitialState={handleSetInitialState}
            />
          </div>

          {/* DFA Graph */}
          <div className="space-y-2">
            <AutomataGraph
              key={`dfa-${currentNFA.id}`}
              title="Converted Deterministic Finite Automaton (DFA)"
              states={dfa.states}
              initialState={dfa.initialState}
              acceptStates={dfa.acceptStates}
              transitions={dfaGraphTransitions}
              activeStates={highlightedDFANode ? [highlightedDFANode] : []}
              subsetsMap={dfa.subsets}
            />
          </div>
        </div>
      ) : (
        /* Tabbed Graph Area */
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('nfa')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'nfa'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60'
              }`}
            >
              Original NFA ({currentNFA.states.length} states)
            </button>
            <button
              onClick={() => setActiveTab('dfa')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dfa'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60'
              }`}
            >
              Converted DFA ({dfa.states.length} subsets)
            </button>
          </div>

          {activeTab === 'nfa' ? (
            <AutomataGraph
              key={`nfa-tab-${currentNFA.id}`}
              title="Original NFA"
              states={currentNFA.states}
              initialState={currentNFA.initialState}
              acceptStates={currentNFA.acceptStates}
              transitions={nfaGraphTransitions}
              activeStates={highlightedNFAStates}
              isEditable={true}
              alphabet={currentNFA.alphabet}
              onAddState={handleAddState}
              onAddTransition={handleAddTransition}
              onDeleteState={handleDeleteState}
              onDeleteTransition={handleDeleteTransition}
              onToggleAcceptState={handleToggleAcceptState}
              onSetInitialState={handleSetInitialState}
            />
          ) : (
            <AutomataGraph
              key={`dfa-tab-${currentNFA.id}`}
              title="Converted DFA"
              states={dfa.states}
              initialState={dfa.initialState}
              acceptStates={dfa.acceptStates}
              transitions={dfaGraphTransitions}
              activeStates={highlightedDFANode ? [highlightedDFANode] : []}
              subsetsMap={dfa.subsets}
            />
          )}
        </div>
      )}

      {/* Step-by-Step Subset Conversion Walkthrough */}
      <SubsetConversionWalkthrough
        steps={steps}
        dfa={dfa}
        currentStepIndex={conversionStepIndex}
        onStepChange={setConversionStepIndex}
        onReset={() => setConversionStepIndex(1)}
      />

      {/* Dual String Simulator & Equivalence Tester */}
      <StringTester
        nfa={currentNFA}
        dfa={dfa}
        onActiveStateChange={(nfaStates, dfaState) => {
          setActiveNFAStates(nfaStates);
          setActiveDFAState(dfaState);
        }}
      />

      {/* Automata Stats & DFA Matrix Table */}
      <AutomataStats
        nfa={currentNFA}
        dfa={dfa}
        tableData={table}
        viewMode={statsViewMode}
        onToggleViewMode={setStatsViewMode}
      />

      {/* NFA Transition Editor */}
      <TransitionTableEditor
        nfa={currentNFA}
        onChangeNFA={(updated) => {
          setCurrentNFA(updated);
          setConversionStepIndex(1);
        }}
      />
    </div>
  );
};

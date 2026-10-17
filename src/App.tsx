import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { TMSimulator } from './components/turing/TMSimulator';
import { NFADFASimulator } from './components/nfa-dfa/NFADFASimulator';
import { LearnAcademy } from './components/learn/LearnAcademy';
import { ExampleLibrary } from './components/examples/ExampleLibrary';
import { ImportExportModal } from './components/io/ImportExportModal';
import { TM_EXAMPLES } from './simulators/turing-machine/examples';
import { NFA_EXAMPLES } from './simulators/nfa-dfa/examples';
import type { TMDefinition } from './types/turing';
import type { NFADefinition } from './types/automata';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'tm' | 'nfa-dfa' | 'learn' | 'examples'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toc-active-view');
      if (saved && ['home', 'tm', 'nfa-dfa', 'learn', 'examples'].includes(saved)) {
        return saved as any;
      }
    }
    return 'home';
  });

  const [isIOOpen, setIsIOOpen] = useState(false);
  const [activeTM, setActiveTM] = useState<TMDefinition>(TM_EXAMPLES[0]);
  const [activeNFA, setActiveNFA] = useState<NFADefinition>(NFA_EXAMPLES[0]);

  // Persist view
  useEffect(() => {
    localStorage.setItem('toc-active-view', currentView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Reset to original defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all machine models and settings to default?')) {
      localStorage.removeItem('toc-active-view');
      setActiveTM(TM_EXAMPLES[0]);
      setActiveNFA(NFA_EXAMPLES[0]);
      setCurrentView('home');
      window.location.reload();
    }
  };

  // Switch to TM simulator with loaded preset
  const handleLoadTM = (tmId: string) => {
    const tm = TM_EXAMPLES.find(t => t.id === tmId);
    if (tm) setActiveTM(tm);
    setCurrentView('tm');
  };

  // Switch to NFA simulator with loaded preset
  const handleLoadNFA = (nfaId: string) => {
    const nfa = NFA_EXAMPLES.find(n => n.id === nfaId);
    if (nfa) setActiveNFA(nfa);
    setCurrentView('nfa-dfa');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf7] text-stone-800 dark:bg-[#070a13] dark:text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-950 dark:selection:bg-violet-500/30 dark:selection:text-cyan-200 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenIO={() => setIsIOOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage onNavigate={setCurrentView} />
        )}

        {currentView === 'tm' && (
          <TMSimulator 
            key={activeTM.id} 
            initialMachine={activeTM} 
            onMachineChange={setActiveTM} 
          />
        )}

        {currentView === 'nfa-dfa' && (
          <NFADFASimulator 
            key={activeNFA.id} 
            initialNFA={activeNFA} 
            onNFAChange={setActiveNFA} 
          />
        )}

        {currentView === 'learn' && (
          <LearnAcademy />
        )}

        {currentView === 'examples' && (
          <ExampleLibrary
            onLoadTM={handleLoadTM}
            onLoadNFA={handleLoadNFA}
          />
        )}
      </main>

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={isIOOpen}
        onClose={() => setIsIOOpen(false)}
        currentTM={activeTM}
        currentNFA={activeNFA}
        onImportTM={(imported) => {
          setActiveTM(imported);
          setCurrentView('tm');
        }}
        onImportNFA={(imported) => {
          setActiveNFA(imported);
          setCurrentView('nfa-dfa');
        }}
      />

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}

export default App;

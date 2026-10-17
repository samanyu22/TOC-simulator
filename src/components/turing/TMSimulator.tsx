import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { TMDefinition, TMExecutionState, TMHistoryEntry, TMTransition } from '../../types/turing';
import { initializeTM, stepTM, DEFAULT_STEP_LIMIT } from '../../simulators/turing-machine/engine';
import { TM_EXAMPLES } from '../../simulators/turing-machine/examples';
import { TapeView } from './TapeView';
import { TMControls } from './TMControls';
import { TransitionTable } from './TransitionTable';
import { TMHistory } from './TMHistory';
import { TMConfigModal } from './TMConfigModal';
import { Cpu, Settings2, BookOpen, Download, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TMSimulatorProps {
  initialMachine?: TMDefinition;
  onMachineChange?: (machine: TMDefinition) => void;
}

export const TMSimulator: React.FC<TMSimulatorProps> = ({
  initialMachine = TM_EXAMPLES[0],
  onMachineChange,
}) => {
  const [currentMachine, setCurrentMachine] = useState<TMDefinition>(initialMachine);
  const [inputString, setInputString] = useState(initialMachine.defaultInput);
  const [simState, setSimState] = useState<TMExecutionState>(() => 
    initializeTM(initialMachine, initialMachine.defaultInput)
  );
  const [history, setHistory] = useState<TMHistoryEntry[]>([]);
  const [speed, setSpeed] = useState<number>(3); // 1 to 10
  const [stepLimit, setStepLimit] = useState<number>(DEFAULT_STEP_LIMIT);
  const [inspectingStep, setInspectingStep] = useState<number | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Playback timer ref
  const timerRef = useRef<any>(null);

  // Synchronize when initialMachine prop changes from Library or Import
  useEffect(() => {
    if (initialMachine) {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentMachine(initialMachine);
      setInputString(initialMachine.defaultInput);
      setSimState(initializeTM(initialMachine, initialMachine.defaultInput));
      setHistory([]);
      setInspectingStep(null);
    }
  }, [initialMachine]);

  // Handle machine selection
  const handleSelectExample = (exampleId: string) => {
    const selected = TM_EXAMPLES.find(e => e.id === exampleId) || TM_EXAMPLES[0];
    setCurrentMachine(selected);
    setInputString(selected.defaultInput);
    const initial = initializeTM(selected, selected.defaultInput);
    setSimState(initial);
    setHistory([]);
    setInspectingStep(null);
    if (onMachineChange) onMachineChange(selected);
  };

  // Reset live state
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const resetState = initializeTM(currentMachine, inputString);
    setSimState(resetState);
    setHistory([]);
    setInspectingStep(null);
  }, [currentMachine, inputString]);

  // Execute one step
  const executeStep = useCallback(() => {
    setSimState(prev => {
      if (['accepted', 'rejected', 'halted_undefined', 'step_limit_reached'].includes(prev.status)) {
        if (timerRef.current) clearInterval(timerRef.current);
        return prev;
      }

      const result = stepTM(currentMachine, prev, stepLimit);
      setHistory(h => [result.historyEntry, ...h]);

      // Trigger confetti on accept!
      if (result.nextState.status === 'accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (['accepted', 'rejected', 'halted_undefined', 'step_limit_reached'].includes(result.nextState.status)) {
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return result.nextState;
    });
  }, [currentMachine, stepLimit]);

  // Continuous run execution
  const handleRun = () => {
    if (simState.status === 'running') return;
    setSimState(prev => ({ ...prev, status: 'running' }));
    
    // Interval based on speed: 1x = 800ms, 10x = 60ms
    const intervalMs = Math.max(50, Math.round(900 / speed));
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      executeStep();
    }, intervalMs);
  };

  // Pause
  const handlePause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimState(prev => ({ ...prev, status: 'paused' }));
  };

  // Adjust interval if speed changes while running
  useEffect(() => {
    if (simState.status === 'running') {
      const intervalMs = Math.max(50, Math.round(900 / speed));
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        executeStep();
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speed, simState.status, executeStep]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Add transition
  const handleAddTransition = (newT: Omit<TMTransition, 'id'>) => {
    const id = `t_${Date.now()}`;
    const updated = {
      ...currentMachine,
      transitions: [...currentMachine.transitions, { ...newT, id }],
    };
    setCurrentMachine(updated);
  };

  // Delete transition
  const handleDeleteTransition = (id: string) => {
    const updated = {
      ...currentMachine,
      transitions: currentMachine.transitions.filter(t => t.id !== id),
    };
    setCurrentMachine(updated);
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(currentMachine, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMachine.id}-tm.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Historical snapshot state if user is inspecting
  const displayState: TMExecutionState = inspectingStep !== null
    ? (() => {
        const entry = history.find(h => h.step === inspectingStep);
        if (entry) {
          return {
            ...simState,
            tape: entry.tapeSnapshot,
            headPosition: entry.headPosition,
            currentState: entry.state,
            stepCount: entry.step,
            status: entry.status,
            statusMessage: `Viewing step #${entry.step} in history`,
            lastTransition: entry.appliedTransition,
          };
        }
        return simState;
      })()
    : simState;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner & Example Picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/[0.08] shadow-xl bg-white/95 dark:bg-slate-950/70 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30">
              <Cpu className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <span>{currentMachine.name}</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 border border-violet-300 dark:border-violet-500/40 text-violet-800 dark:text-violet-300">
                  Turing Machine
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-sans leading-relaxed">{currentMachine.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Example Picker */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
            <select
              value={currentMachine.id}
              onChange={(e) => handleSelectExample(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-xs"
            >
              {TM_EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Machine Formal Config Button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-white/10 text-xs font-semibold transition active:scale-95 shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Edit Model</span>
          </button>

          {/* Export Machine JSON */}
          <button
            onClick={handleExportJSON}
            title="Export Turing Machine configuration as JSON"
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 transition active:scale-95 shadow-xs"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset to initial state"
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 transition active:scale-95 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tape Visualization */}
      <TapeView
        state={displayState}
        blankSymbol={currentMachine.blankSymbol}
      />

      {/* Execution Controls */}
      <TMControls
        status={simState.status}
        statusMessage={simState.statusMessage}
        stepCount={simState.stepCount}
        inputString={inputString}
        onInputChange={setInputString}
        onApplyInput={handleReset}
        onRun={handleRun}
        onPause={handlePause}
        onStepForward={executeStep}
        onReset={handleReset}
        speed={speed}
        onSpeedChange={setSpeed}
        stepLimit={stepLimit}
        onStepLimitChange={setStepLimit}
      />

      {/* Transition Table & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransitionTable
            transitions={currentMachine.transitions}
            states={currentMachine.states}
            activeTransition={simState.lastTransition}
            onAddTransition={handleAddTransition}
            onDeleteTransition={handleDeleteTransition}
          />
        </div>

        <div className="lg:col-span-1">
          <TMHistory
            history={history}
            inspectingStep={inspectingStep}
            onInspectStep={setInspectingStep}
            blankSymbol={currentMachine.blankSymbol}
          />
        </div>
      </div>

      {/* Config Modal */}
      <TMConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        definition={currentMachine}
        onSave={(updated) => {
          setCurrentMachine(updated);
          handleReset();
        }}
      />
    </div>
  );
};

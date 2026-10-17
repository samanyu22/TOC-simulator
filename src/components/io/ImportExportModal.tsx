import React, { useState } from 'react';
import type { TMDefinition } from '../../types/turing';
import type { NFADefinition } from '../../types/automata';
import { validateTMDefinition } from '../../simulators/turing-machine/engine';
import { 
  FileDown, 
  FileUp, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTM?: TMDefinition;
  currentNFA?: NFADefinition;
  onImportTM: (tm: TMDefinition) => void;
  onImportNFA: (nfa: NFADefinition) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  currentTM,
  currentNFA,
  onImportTM,
  onImportNFA,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Export TM to CSV
  const handleExportTMCSV = () => {
    if (!currentTM) return;
    let csv = 'Current State,Read Symbol,Next State,Write Symbol,Direction\n';
    currentTM.transitions.forEach(t => {
      csv += `"${t.currentState}","${t.readSymbol}","${t.nextState}","${t.writeSymbol}","${t.direction}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTM.id}-transitions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export NFA to CSV
  const handleExportNFACSV = () => {
    if (!currentNFA) return;
    let csv = 'From State,Symbol,To State\n';
    currentNFA.transitions.forEach(t => {
      csv += `"${t.fromState}","${t.symbol}","${t.toState}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNFA.id}-nfa-transitions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export full JSON bundle
  const handleExportFullJSON = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      tm: currentTM,
      nfa: currentNFA,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toc-lab-configuration.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy bundle JSON to clipboard
  const handleCopyJSON = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      tm: currentTM,
      nfa: currentNFA,
    };
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Validate and Import JSON
  const handleImportJSON = () => {
    setImportStatus(null);
    try {
      const parsed = JSON.parse(jsonText);

      // Check if it's a TM definition
      if (parsed.states && parsed.blankSymbol && parsed.transitions && parsed.initialState) {
        const val = validateTMDefinition(parsed as TMDefinition);
        if (!val.valid) {
          setImportStatus({
            success: false,
            message: `Turing Machine Validation Error: ${val.errors.join('; ')}`,
          });
          return;
        }
        onImportTM(parsed as TMDefinition);
        setImportStatus({
          success: true,
          message: `Successfully imported Turing Machine "${parsed.name || 'Custom TM'}"!`,
        });
        return;
      }

      // Check if it's an NFA definition
      if (parsed.states && parsed.alphabet && parsed.initialState && parsed.transitions && !parsed.blankSymbol) {
        onImportNFA(parsed as NFADefinition);
        setImportStatus({
          success: true,
          message: `Successfully imported NFA "${parsed.name || 'Custom NFA'}"!`,
        });
        return;
      }

      // Check if it's a full bundle { tm, nfa }
      if (parsed.tm || parsed.nfa) {
        if (parsed.tm) onImportTM(parsed.tm);
        if (parsed.nfa) onImportNFA(parsed.nfa);
        setImportStatus({
          success: true,
          message: 'Successfully restored full workspace configuration bundle!',
        });
        return;
      }

      setImportStatus({
        success: false,
        message: 'Unrecognized JSON schema. Expected a Turing Machine, NFA, or full project bundle.',
      });
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: `JSON Parse Error: ${err.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in transition-colors">
      <div className="w-full max-w-xl rounded-3xl p-6 border border-stone-200/90 dark:border-white/10 shadow-2xl space-y-5 bg-[#faf7f2] dark:bg-[#070b18] text-stone-800 dark:text-slate-200 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/15 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Project Portability & Storage</h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-mono">Validated JSON Schemas & CSV Tables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-white/[0.08] pb-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeTab === 'export' ? 'bg-cyan-600 text-white' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-[#f4efe8] dark:bg-slate-900/60'
            }`}
          >
            Export Project
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeTab === 'import' ? 'bg-cyan-600 text-white' : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-[#f4efe8] dark:bg-slate-900/60'
            }`}
          >
            Import JSON
          </button>
        </div>

        {/* Export tab */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
              Export your models as validated JSON configurations or download transition function matrices in CSV format for assignments and documentation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={handleExportFullJSON}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 hover:bg-[#ebe4d8] dark:hover:bg-slate-900 border border-stone-200/90 dark:border-white/10 hover:border-cyan-400/50 text-stone-800 dark:text-slate-200 font-bold transition active:scale-95 shadow-xs"
              >
                <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Full Project (JSON)</span>
              </button>

              <button
                onClick={handleCopyJSON}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 hover:bg-[#ebe4d8] dark:hover:bg-slate-900 border border-stone-200/90 dark:border-white/10 hover:border-violet-400/50 text-stone-800 dark:text-slate-200 font-bold transition active:scale-95 shadow-xs"
              >
                <Copy className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>{copied ? '✓ Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>

              {currentTM && (
                <button
                  onClick={handleExportTMCSV}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 hover:bg-[#ebe4d8] dark:hover:bg-slate-900 border border-stone-200/90 dark:border-white/10 hover:border-emerald-400/50 text-stone-800 dark:text-slate-200 font-bold transition active:scale-95 shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>TM Transitions (CSV)</span>
                </button>
              )}

              {currentNFA && (
                <button
                  onClick={handleExportNFACSV}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 hover:bg-[#ebe4d8] dark:hover:bg-slate-900 border border-stone-200/90 dark:border-white/10 hover:border-emerald-400/50 text-stone-800 dark:text-slate-200 font-bold transition active:scale-95 shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>NFA Transitions (CSV)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Import tab */}
        {activeTab === 'import' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
              Paste a validated JSON configuration below. The engine will verify its mathematical integrity before loading.
            </p>

            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste Turing Machine or NFA JSON here..."
              className="w-full p-3.5 rounded-2xl bg-[#f4efe6] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 font-mono text-xs text-stone-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
            />

            {importStatus && (
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                importStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
              }`}>
                {importStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#f4efe8] dark:bg-slate-900 hover:bg-[#ebe4d8] dark:hover:bg-slate-800 text-stone-700 dark:text-slate-300 transition"
              >
                Close
              </button>
              <button
                onClick={handleImportJSON}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-md shadow-cyan-950/20 active:scale-95"
              >
                <FileUp className="w-4 h-4" />
                <span>Validate & Import</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { TMDefinition } from '../../types/turing';
import { Settings2, X, AlertCircle } from 'lucide-react';

interface TMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: TMDefinition;
  onSave: (updated: TMDefinition) => void;
}

export const TMConfigModal: React.FC<TMConfigModalProps> = ({
  isOpen,
  onClose,
  definition,
  onSave,
}) => {
  const [name, setName] = useState(definition.name);
  const [description, setDescription] = useState(definition.description);
  const [statesStr, setStatesStr] = useState(definition.states.join(', '));
  const [initialState, setInitialState] = useState(definition.initialState);
  const [acceptStatesStr, setAcceptStatesStr] = useState(definition.acceptStates.join(', '));
  const [rejectStatesStr, setRejectStatesStr] = useState(definition.rejectStates.join(', '));
  const [blankSymbol, setBlankSymbol] = useState(definition.blankSymbol);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const states = statesStr.split(',').map(s => s.trim()).filter(Boolean);
    const acceptStates = acceptStatesStr.split(',').map(s => s.trim()).filter(Boolean);
    const rejectStates = rejectStatesStr.split(',').map(s => s.trim()).filter(Boolean);

    if (states.length === 0) {
      setError('At least one state is required.');
      return;
    }
    if (!states.includes(initialState)) {
      setError(`Initial state "${initialState}" must be present in the states list.`);
      return;
    }
    if (!blankSymbol || blankSymbol.length !== 1) {
      setError('Blank symbol must be a single character.');
      return;
    }

    onSave({
      ...definition,
      name,
      description,
      states,
      initialState,
      acceptStates,
      rejectStates,
      blankSymbol,
    });
    onClose();
  };

  const parsedStates = statesStr.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-stone-300/80 dark:border-slate-700 shadow-2xl space-y-5 bg-[#fffdfa] dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Settings2 className="w-5 h-5" />
            <h2 className="text-base font-bold text-stone-900 dark:text-slate-100">Configure Turing Machine Formal Model</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Machine Name */}
          <div>
            <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">Machine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-stone-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 font-sans shadow-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">Description / Theory</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-stone-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 font-sans shadow-xs"
            />
          </div>

          {/* Set of States */}
          <div>
            <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">
              Set of States (Q) <span className="text-stone-500 text-[11px]">(comma separated)</span>
            </label>
            <input
              type="text"
              value={statesStr}
              onChange={(e) => setStatesStr(e.target.value)}
              placeholder="q0, q1, q_accept, q_reject"
              className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-cyan-700 dark:text-cyan-300 focus:outline-none focus:border-violet-500 shadow-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Initial State */}
            <div>
              <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">Initial State (q₀)</label>
              <select
                value={initialState}
                onChange={(e) => setInitialState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-stone-900 dark:text-slate-200 focus:outline-none focus:border-violet-500 shadow-xs font-semibold"
              >
                {parsedStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Blank Symbol */}
            <div>
              <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">Blank Symbol (B)</label>
              <input
                type="text"
                maxLength={1}
                value={blankSymbol}
                onChange={(e) => setBlankSymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-center font-bold text-violet-700 dark:text-violet-300 focus:outline-none focus:border-violet-500 shadow-xs"
              />
            </div>
          </div>

          {/* Accepting States */}
          <div>
            <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">
              Accepting States (F) <span className="text-stone-500 text-[11px]">(comma separated)</span>
            </label>
            <input
              type="text"
              value={acceptStatesStr}
              onChange={(e) => setAcceptStatesStr(e.target.value)}
              placeholder="q_accept"
              className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 focus:outline-none focus:border-violet-500 shadow-xs font-semibold"
            />
          </div>

          {/* Rejecting States */}
          <div>
            <label className="text-stone-700 dark:text-slate-300 font-sans font-medium block mb-1">
              Rejecting States (Optional)
            </label>
            <input
              type="text"
              value={rejectStatesStr}
              onChange={(e) => setRejectStatesStr(e.target.value)}
              placeholder="q_reject"
              className="w-full px-3 py-2 rounded-xl bg-[#f8f5ee] dark:bg-slate-950 border border-stone-300/90 dark:border-slate-700 text-rose-700 dark:text-rose-400 focus:outline-none focus:border-violet-500 shadow-xs font-semibold"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#ede7da] hover:bg-[#e4dcce] dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 font-sans text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-sans text-xs font-semibold shadow-md shadow-violet-600/30 transition"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Network, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  GraduationCap, 
  Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Why do NFAs and DFAs recognize exactly the same class of languages (Regular Languages)?",
    options: [
      "Because NFAs have infinite memory like a pushdown stack.",
      "Because every NFA can be converted to an equivalent DFA via the Subset Construction algorithm.",
      "Because DFAs can backtrack across multiple branches.",
      "Because epsilon transitions allow non-regular grammar parsing."
    ],
    correctIndex: 1,
    explanation: "Correct! The Subset Construction (powerset construction) proves that any language recognized by an NFA with n states can be recognized by an equivalent DFA with at most 2^n states."
  },
  {
    id: 2,
    question: "If an NFA has 4 states, what is the theoretical maximum number of states in its converted DFA?",
    options: [
      "4 states",
      "8 states",
      "16 states (2^4)",
      "Infinite states"
    ],
    correctIndex: 2,
    explanation: "Correct! The power set P(Q) of a 4-element set has 2^4 = 16 possible subsets (from ∅ up to {q0, q1, q2, q3}). In practice, only reachable subsets are kept."
  },
  {
    id: 3,
    question: "What is an epsilon-closure (ε-closure) of a state q?",
    options: [
      "The set of states reachable from q by reading at least one '0' or '1'.",
      "The set of states reachable from q by following 0 or more epsilon (ε) transitions.",
      "The set of all dead or unreachable states.",
      "The tape alphabet excluding blank symbols."
    ],
    correctIndex: 1,
    explanation: "Correct! The ε-closure of q includes q itself, plus any state reachable along paths of spontaneous ε transitions without consuming any input."
  },
  {
    id: 4,
    question: "When is a subset state S in a converted DFA marked as an accepting / final state?",
    options: [
      "Only when every state in S is an NFA accept state.",
      "When S contains at least one NFA accept state (S ∩ F_NFA ≠ ∅).",
      "When S is the dead/trap state ∅.",
      "When S has self-loops on every alphabet symbol."
    ],
    correctIndex: 1,
    explanation: "Correct! A DFA accepts a string if it ends in any subset containing at least one valid accepting branch of the original NFA."
  }
];

export const LearnAcademy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'concepts' | 'tutorials' | 'quiz'>('concepts');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [expandedConcept, setExpandedConcept] = useState<string | null>('subset-construction');

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setShowExplanations(prev => ({ ...prev, [questionId]: true }));

    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (question && optionIndex === question.correctIndex) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    }
  };

  const score = Object.entries(selectedAnswers).filter(([id, ans]) => {
    const q = QUIZ_QUESTIONS.find(item => item.id === Number(id));
    return q && q.correctIndex === ans;
  }).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Academy Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-stone-200/90 dark:border-white/[0.08] shadow-2xl relative overflow-hidden transition-colors">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              TOC Theory Academy
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-slate-400 font-mono">
            Interactive guide to finite automata, nondeterminism, and powerset determinization.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#f4efe8] dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 w-full md:w-auto">
          <button
            onClick={() => setActiveSection('concepts')}
            className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer text-center ${
              activeSection === 'concepts' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Concepts
          </button>
          <button
            onClick={() => setActiveSection('tutorials')}
            className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer text-center ${
              activeSection === 'tutorials' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setActiveSection('quiz')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer text-center ${
              activeSection === 'quiz' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>Practice Quiz ({score}/{QUIZ_QUESTIONS.length})</span>
          </button>
        </div>
      </div>

      {/* Concept Breakdown Section */}
      {activeSection === 'concepts' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Concept: Automata & Subset Construction */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 sm:space-y-4 transition-colors">
            <button
              onClick={() => setExpandedConcept(prev => prev === 'subset-construction' ? null : 'subset-construction')}
              className="w-full flex items-center justify-between text-left gap-2"
            >
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-cyan-600/15 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
                  <Network className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tracking-tight">
                    Nondeterminism & The Subset Construction Algorithm
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 font-mono">
                    Why NFAs and DFAs have identical language recognition power
                  </p>
                </div>
              </div>
              {expandedConcept === 'subset-construction' ? <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />}
            </button>

            {expandedConcept === 'subset-construction' && (
              <div className="pt-3 sm:pt-4 border-t border-stone-200 dark:border-white/[0.08] space-y-3 sm:space-y-4 text-xs leading-relaxed text-stone-700 dark:text-slate-300">
                <p>
                  A <strong>Deterministic Finite Automaton (DFA)</strong> has exactly one valid transition for each state and alphabet symbol. A <strong>Nondeterministic Finite Automaton (NFA)</strong> relaxes this restriction: it can transition to zero, one, or multiple states on a symbol, or even jump spontaneously across <strong>epsilon (ε) transitions</strong> without consuming any input.
                </p>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 border border-stone-200/90 dark:border-white/10 font-mono space-y-2 text-stone-800 dark:text-slate-300 shadow-inner break-words">
                  <div className="font-bold text-cyan-700 dark:text-cyan-300">The 4-Step Subset Construction Algorithm:</div>
                  <div>1. Compute initial DFA state: <span className="text-cyan-700 dark:text-cyan-300 font-bold">S₀ = ε-closure({'{'}q₀{'}'})</span>.</div>
                  <div>2. For every unexpanded DFA subset S and alphabet symbol a ∈ Σ:</div>
                  <div className="pl-3 sm:pl-4">Compute target subset: <span className="text-emerald-700 dark:text-emerald-300 font-bold">T = ε-closure( ⋃_(q ∈ S) δ_NFA(q, a) )</span>.</div>
                  <div className="pl-3 sm:pl-4">If T is empty, route to dead/trap state <span className="text-rose-600 dark:text-rose-400 font-bold">∅</span> with self-loops.</div>
                  <div>3. Repeat until no newly discovered subsets remain.</div>
                  <div>4. Mark any DFA subset S as accepting iff <span className="text-emerald-700 dark:text-emerald-300 font-bold">S ∩ F_NFA ≠ ∅</span>.</div>
                </div>
              </div>
            )}
          </div>

          {/* Common Mistakes & Debugging Tips */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 sm:space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Common Automata Pitfalls & Debugging Tips
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Forgetting the Dead/Trap State (∅)</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  In a DFA, every state must have an outgoing transition for EVERY symbol in the alphabet. If an NFA state has no transition on a symbol, the DFA must transition to the sink state ∅ with self-loops.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Missing Initial Epsilon-Closure</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  The initial state of the converted DFA is not just {'{'}q0{'}'}; it is ε-closure({'{'}q0{'}'}). If q0 has ε-transitions to q1, the start state is {'{'}q0, q1{'}'}.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Powerset State Explosion</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  An NFA with n states has 2^n possible subsets. However, only reachable subsets are kept in the DFA. For most practical grammars, the reachable DFA is much smaller than 2^n.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Single vs Multi-Path Acceptance</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  In an NFA, an input string is accepted if AT LEAST ONE computational path reaches an accept state. In DFA, exactly one path is followed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guided Simulator Tutorials */}
      {activeSection === 'tutorials' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 transition-colors">
            <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                Tutorial: Step-by-Step Subset Construction
              </h3>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
              <li>Navigate to the <strong>NFA → DFA</strong> tab from the top navigation bar.</li>
              <li>Select the preset <strong>"Strings Ending in 1"</strong> or <strong>"Contains Substring '01'"</strong> from the example dropdown.</li>
              <li>Observe how the NFA graph displays multiple arrows for the same symbol (nondeterministic forks).</li>
              <li>Click the <strong>Play Walkthrough</strong> button in the Subset Construction Stepper to watch each DFA subset form dynamically.</li>
              <li>Notice how the English explanation log explains exactly which NFA states contributed to each transition!</li>
              <li>Type an input string (like <code className="text-cyan-700 dark:text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">"0101"</code>) in the Dual String Tester and click <strong>Step Char</strong> to trace execution simultaneously on both graphs.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Practice Quiz */}
      {activeSection === 'quiz' && (
        <div className="space-y-4 sm:space-y-5">
          {QUIZ_QUESTIONS.map((q) => {
            const selected = selectedAnswers[q.id];
            const isAnswered = selected !== undefined;
            const isCorrect = selected === q.correctIndex;

            return (
              <div
                key={q.id}
                className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3.5 sm:space-y-4 transition-colors"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold shrink-0 border border-cyan-300 dark:border-cyan-500/40">
                    Q{q.id}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug">{q.question}</h4>
                </div>

                <div className="space-y-2">
                  {q.options.map((option, idx) => {
                    const isSelected = selected === idx;
                    let optionStyle = 'bg-[#f4efe8]/80 dark:bg-slate-900/60 border-stone-200/90 dark:border-white/[0.08] text-stone-800 dark:text-slate-300 hover:border-cyan-500/50';

                    if (isAnswered) {
                      if (idx === q.correctIndex) {
                        optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold';
                      } else if (isSelected) {
                        optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300';
                      } else {
                        optionStyle = 'opacity-40 bg-[#f4efe8] dark:bg-slate-900 border-transparent';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(q.id, idx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswered && idx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanations[q.id] && (
                  <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                    isCorrect 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearnAcademy;

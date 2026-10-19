import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Network, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
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
      "Because NFAs have infinite memory like a Turing machine.",
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
    question: "What happens when a deterministic Turing machine encounters an undefined transition in a non-accepting state?",
    options: [
      "It loops forever without halting.",
      "It halts immediately and rejects the input string.",
      "It automatically reverts the tape to blank.",
      "It branches into nondeterministic parallel threads."
    ],
    correctIndex: 1,
    explanation: "Correct! By standard mathematical definition, if δ(q, a) is undefined and q ∉ F, the computation immediately halts and rejects."
  },
  {
    id: 4,
    question: "What is an epsilon-closure (ε-closure) of a state q?",
    options: [
      "The set of states reachable from q by reading at least one '0' or '1'.",
      "The set of states reachable from q by following 0 or more epsilon (ε) transitions.",
      "The set of all dead or unreachable states.",
      "The tape alphabet excluding blank symbols."
    ],
    correctIndex: 1,
    explanation: "Correct! The ε-closure of q includes q itself, plus any state reachable along paths of spontaneous ε transitions without consuming any input."
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
      <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3.5 sm:space-y-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-500/35 via-purple-500/20 to-transparent dark:from-violet-600/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute top-0 right-0 w-44 h-44 bg-violet-400/25 dark:bg-transparent rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Theory of Computation Academy
            </h1>
            <p className="text-xs text-stone-500 dark:text-slate-400 font-mono mt-0.5">
              Interactive guides, formal definitions, and challenge exercises
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
          Master formal languages, finite automata, subset construction, and Turing machine mechanics through interactive explanations, visual guides, and practice challenges.
        </p>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-stone-200 dark:border-white/[0.08]">
          <button
            onClick={() => setActiveSection('concepts')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeSection === 'concepts'
                ? 'bg-violet-600 text-white shadow-violet-900/20'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-[#faf7f2] dark:bg-slate-900/80 border border-stone-200/90 dark:border-white/5'
            }`}
          >
            Core Concepts & Theory
          </button>
          <button
            onClick={() => setActiveSection('tutorials')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeSection === 'tutorials'
                ? 'bg-cyan-600 text-white shadow-cyan-900/20'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-[#faf7f2] dark:bg-slate-900/80 border border-stone-200/90 dark:border-white/5'
            }`}
          >
            Guided Simulator Tutorials
          </button>
          <button
            onClick={() => setActiveSection('quiz')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeSection === 'quiz'
                ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white bg-[#faf7f2] dark:bg-slate-900/80 border border-stone-200/90 dark:border-white/5'
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
          {/* Concept 1: Automata & Subset Construction */}
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
                  <div>1. Compute initial DFA state: <span className="text-violet-700 dark:text-violet-300 font-bold">S₀ = ε-closure({'{'}q₀{'}'})</span>.</div>
                  <div>2. For every unexpanded DFA subset S and alphabet symbol a ∈ Σ:</div>
                  <div className="pl-3 sm:pl-4">Compute target subset: <span className="text-emerald-700 dark:text-emerald-300 font-bold">T = ε-closure( ⋃_(q ∈ S) δ_NFA(q, a) )</span>.</div>
                  <div className="pl-3 sm:pl-4">If T is empty, route to dead/trap state <span className="text-rose-600 dark:text-rose-400 font-bold">∅</span> with self-loops.</div>
                  <div>3. Repeat until no newly discovered subsets remain.</div>
                  <div>4. Mark any DFA subset S as accepting iff <span className="text-emerald-700 dark:text-emerald-300 font-bold">S ∩ F_NFA ≠ ∅</span>.</div>
                </div>
              </div>
            )}
          </div>

          {/* Concept 2: Turing Machines & Computation */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 sm:space-y-4 transition-colors">
            <button
              onClick={() => setExpandedConcept(prev => prev === 'turing-machines' ? null : 'turing-machines')}
              className="w-full flex items-center justify-between text-left gap-2"
            >
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-violet-600/15 dark:bg-violet-600/20 text-violet-700 dark:text-violet-400 border border-violet-500/30 shrink-0">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tracking-tight">
                    Turing Machines & The Church-Turing Thesis
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 font-mono">
                    The mathematical foundation of general-purpose algorithmic computers
                  </p>
                </div>
              </div>
              {expandedConcept === 'turing-machines' ? <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />}
            </button>

            {expandedConcept === 'turing-machines' && (
              <div className="pt-3 sm:pt-4 border-t border-stone-200 dark:border-white/[0.08] space-y-3 sm:space-y-4 text-xs leading-relaxed text-stone-700 dark:text-slate-300">
                <p>
                  Formulated by Alan Turing in 1936, a Turing machine extends a finite control with an <strong>infinite memory tape</strong> and a movable read/write head. The formal transition function is:
                </p>
                <div className="p-3 rounded-xl sm:rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950 font-mono text-cyan-800 dark:text-cyan-300 border border-stone-200/90 dark:border-white/10 text-center font-bold text-sm shadow-inner break-words">
                  δ : Q × Γ → Q × Γ × {'{'}L, R, S{'}'}
                </div>
                <p>
                  Three distinct outcomes can occur on any input string w:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-700 dark:text-slate-300">
                  <li><strong>Accept:</strong> The machine enters an accepting state <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">q_accept</span> and halts.</li>
                  <li><strong>Reject:</strong> The machine enters an explicit reject state or halts on an undefined transition outside <span className="font-mono text-stone-600 dark:text-slate-400 font-bold">F</span>.</li>
                  <li><strong>Loop:</strong> The machine runs indefinitely without halting (undecidability / Halting Problem).</li>
                </ul>
              </div>
            )}
          </div>

          {/* Common Mistakes & Debugging Tips */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 sm:space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Common TOC Pitfalls & Debugging Tips
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
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Assuming Halting Equals Acceptance in TM</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  A Turing machine can halt on an undefined transition while in a non-accepting state. That constitutes rejection or an abnormal crash, NOT acceptance!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4efe8]/80 dark:bg-slate-950/70 border border-stone-200/90 dark:border-white/[0.06] space-y-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-300 block">Pitfall: Head Movement vs. Tape Write</span>
                <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                  Remember that head movement (L, R, S) changes the index of the active scanner, while the write symbol replaces the character at the current cell.
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
                Tutorial 1: Step-by-Step Subset Construction
              </h3>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
              <li>Navigate to the <strong>NFA to DFA</strong> tab from the top navigation bar.</li>
              <li>Select the preset <strong>"Strings Ending in 1"</strong> or <strong>"Contains Substring '01'"</strong> from the example dropdown.</li>
              <li>Observe how the NFA graph displays multiple arrows for the same symbol (nondeterministic forks).</li>
              <li>Click the <strong>Play Walkthrough</strong> button in the Subset Construction Stepper to watch each DFA subset form dynamically.</li>
              <li>Notice how the English explanation log explains exactly which NFA states contributed to each transition!</li>
              <li>Type an input string (like <code className="text-cyan-700 dark:text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">"0101"</code>) in the Dual String Tester and click <strong>Step Char</strong> to trace execution simultaneously on both graphs.</li>
            </ol>
          </div>

          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] shadow-2xl space-y-3 transition-colors">
            <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-400">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                Tutorial 2: Simulating Unary Increment on a Turing Machine
              </h3>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
              <li>Navigate to the <strong>Turing Machine</strong> tab.</li>
              <li>Select the <strong>"Unary Increment (n + 1)"</strong> example. Notice the input tape has <code className="text-cyan-700 dark:text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">111</code> (representing number 3 in unary).</li>
              <li>Click <strong>Step</strong> to execute one step at a time. Watch the tape head move right across the 1s until it finds the blank symbol <code className="text-violet-700 dark:text-violet-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">_</code>.</li>
              <li>On the blank symbol, watch transition rule <code className="text-emerald-700 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">δ(q0, _) → (q_accept, 1, S)</code> fire, writing an extra 1 and halting in <code className="text-emerald-700 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">q_accept</code>.</li>
              <li>The tape now contains <code className="text-cyan-700 dark:text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800">1111</code> (representing number 4). Enjoy the celebratory acceptance banner and confetti!</li>
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
                  <span className="px-2.5 py-1 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono text-xs font-bold shrink-0 border border-violet-300 dark:border-violet-500/40">
                    Q{q.id}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-snug">{q.question}</h4>
                </div>

                <div className="space-y-2 sm:space-y-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    let btnStyle = 'bg-[#faf7f2] dark:bg-slate-900/80 border-stone-200/90 dark:border-white/[0.08] text-stone-700 dark:text-slate-300 hover:border-stone-400 dark:hover:border-white/20 hover:bg-[#f4efe8] dark:hover:bg-slate-900';
                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs dark:shadow-glow-emerald';
                      } else if (optIdx === selected) {
                        btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200';
                      } else {
                        btnStyle = 'bg-[#f4efe8] dark:bg-slate-950/40 border-stone-200/60 dark:border-white/[0.04] text-stone-400 dark:text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-xs transition-all duration-150 flex items-center justify-between ${btnStyle}`}
                      >
                        <span className="pr-2">{opt}</span>
                        {isAnswered && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isAnswered && optIdx === selected && optIdx !== q.correctIndex && (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showExplanations[q.id] && (
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-xs flex items-start gap-2.5 sm:gap-3 ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300'
                  }`}>
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-sans">{q.explanation}</p>
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

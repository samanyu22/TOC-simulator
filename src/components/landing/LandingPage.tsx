import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Network, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  CheckCircle, 
  Code2, 
  Play, 
  Compass, 
  Workflow,
  Terminal,
  Zap,
  RotateCcw
} from 'lucide-react';
import { FeatureCards } from './FeatureCards';

interface LandingPageProps {
  onNavigate: (view: 'tm' | 'nfa-dfa' | 'learn' | 'examples') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Live animated preview state machine in the hero
  const [activeNode, setActiveNode] = useState<number>(0);
  const [previewInput, setPreviewInput] = useState<string>('0101');
  const [previewCharIdx, setPreviewCharIdx] = useState<number>(0);
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(true);

  const heroNodes = [
    { id: 'q0', label: 'q0', sublabel: 'Initial State', x: 70, y: 100, isAccept: false },
    { id: 'q1', label: 'q1', sublabel: 'Seen "1"', x: 220, y: 100, isAccept: true },
  ];

  // Auto-play the preview string in the hero
  useEffect(() => {
    if (!previewPlaying) return;
    const interval = setInterval(() => {
      setPreviewCharIdx((idx) => {
        const nextIdx = (idx + 1) % (previewInput.length + 1);
        if (nextIdx === 0) {
          setActiveNode(0);
        } else {
          const char = previewInput[nextIdx - 1];
          // Rule for ends-in-1:
          // q0 on 0 -> q0, on 1 -> q1
          // q1 on 0 -> q0, on 1 -> q1
          if (char === '1') {
            setActiveNode(1);
          } else {
            setActiveNode(0);
          }
        }
        return nextIdx;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [previewPlaying, previewInput]);

  return (
    <div className="space-y-28 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Ambient Mathematics & Lights */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-violet-600/8 via-cyan-500/8 dark:from-violet-600/15 dark:via-cyan-500/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Floating mathematical glyphs */}
      <div className="absolute top-36 left-12 text-stone-400 dark:text-slate-700 font-mono text-3xl font-extrabold select-none pointer-events-none opacity-25 dark:opacity-30 animate-float hidden lg:block">
        δ(q, a)
      </div>
      <div className="absolute top-48 right-16 text-stone-400 dark:text-slate-700 font-mono text-3xl font-extrabold select-none pointer-events-none opacity-25 dark:opacity-30 animate-float delay-1000 hidden lg:block">
        Σ* ⟷ Γ
      </div>
      <div className="absolute top-96 left-28 text-stone-400 dark:text-slate-700 font-mono text-2xl font-extrabold select-none pointer-events-none opacity-20 dark:opacity-30 animate-float delay-700 hidden lg:block">
        ε-closure(S)
      </div>

      {/* Hero Section */}
      <section className="relative text-center space-y-8 pt-6">
        {/* Futuristic Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-stone-300/80 dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 dark:bg-cyan-400"></span>
          </span>
          <span className="text-xs font-mono font-medium text-stone-700 dark:text-slate-300">
            Interactive Theoretical Computer Science Lab
          </span>
          <span className="text-stone-400 dark:text-slate-600">•</span>
          <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">100% Client-Side Engine</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.1]">
            Explore the Mathematics <br className="hidden sm:inline" />
            <span className="gradient-text-brand">
              Behind Computation.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-stone-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Build machines, visualize automata, and understand computation one transition at a time with mathematically rigorous, 60fps interactive simulations.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('tm')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-violet-900/20 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 border border-violet-500/30"
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            <span>Launch Turing Machine</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => onNavigate('nfa-dfa')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#fffdf9] hover:bg-[#f6f2e8] dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-stone-800 dark:text-white font-semibold text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 border border-stone-300 dark:border-white/[0.12]"
          >
            <Network className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
            <span>Launch NFA → DFA Converter</span>
          </button>
        </div>

        {/* Interactive Live Automata Preview Terminal */}
        <div className="pt-6 max-w-2xl mx-auto">
          <div className="glass-panel rounded-3xl p-6 border border-stone-300/80 dark:border-white/[0.09] shadow-xl relative overflow-hidden bg-[#fffdfa]/95 dark:bg-slate-950/80">
            {/* Header Terminal Bar */}
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-stone-200 dark:border-white/[0.07] text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-stone-600 dark:text-slate-400 ml-2 font-semibold">automata-runtime.wasm</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Live State Machine</span>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="h-44 w-full flex items-center justify-center relative bg-grid-pattern rounded-2xl border border-stone-200 dark:border-white/[0.04]">
              <svg className="w-full h-full" viewBox="0 0 320 180">
                <defs>
                  <marker
                    id="hero-arrow-norm"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                  </marker>
                  <marker
                    id="hero-arrow-pulse"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
                  </marker>
                </defs>

                {/* Transition q0 -> q1 on 1 */}
                <path
                  d="M 100 85 Q 145 55 190 85"
                  fill="none"
                  stroke={activeNode === 1 ? '#06b6d4' : '#64748b'}
                  strokeWidth="2.5"
                  strokeDasharray={activeNode === 1 ? '5 3' : 'none'}
                  markerEnd={activeNode === 1 ? 'url(#hero-arrow-pulse)' : 'url(#hero-arrow-norm)'}
                />
                <rect x="135" y="55" width="20" height="16" rx="4" fill="#0284c7" className="dark:fill-slate-900" stroke="#38bdf8" />
                <text x="145" y="67" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">1</text>

                {/* Transition q1 -> q0 on 0 */}
                <path
                  d="M 190 115 Q 145 145 100 115"
                  fill="none"
                  stroke={activeNode === 0 && previewCharIdx > 0 ? '#06b6d4' : '#64748b'}
                  strokeWidth="2.5"
                  strokeDasharray={activeNode === 0 && previewCharIdx > 0 ? '5 3' : 'none'}
                  markerEnd={activeNode === 0 && previewCharIdx > 0 ? 'url(#hero-arrow-pulse)' : 'url(#hero-arrow-norm)'}
                />
                <rect x="135" y="125" width="20" height="16" rx="4" fill="#0284c7" className="dark:fill-slate-900" stroke="#38bdf8" />
                <text x="145" y="137" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0</text>

                {/* Self loops */}
                {/* q0 on 0 */}
                <path d="M 50 85 C 25 50, 65 35, 75 75" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#hero-arrow-norm)" />
                <rect x="35" y="45" width="16" height="14" rx="3" fill="#475569" className="dark:fill-slate-900" stroke="#94a3b8" />
                <text x="43" y="55" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">0</text>

                {/* q1 on 1 */}
                <path d="M 235 75 C 245 35, 285 50, 260 85" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#hero-arrow-norm)" />
                <rect x="255" y="45" width="16" height="14" rx="3" fill="#475569" className="dark:fill-slate-900" stroke="#94a3b8" />
                <text x="263" y="55" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>

                {/* Nodes */}
                {heroNodes.map((node, i) => {
                  const isActive = activeNode === i;

                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                      {/* Active glowing ring */}
                      {isActive && (
                        <circle r="34" fill="none" stroke="#06b6d4" strokeWidth="2" className="animate-ping opacity-50" />
                      )}
                      
                      {/* Main node circle */}
                      <circle
                        r="26"
                        fill={isActive ? '#0891b2' : '#0f172a'}
                        stroke={isActive ? '#22d3ee' : node.isAccept ? '#10b981' : '#64748b'}
                        strokeWidth={isActive ? '3' : '2'}
                        className="transition-colors duration-200"
                      />

                      {/* Double circle for accept */}
                      {node.isAccept && (
                        <circle r="21" fill="none" stroke={isActive ? '#cffafe' : '#10b981'} strokeWidth="1.75" />
                      )}

                      {/* Label */}
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize="13"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Input Tape & Execution Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-white/[0.07] text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-stone-600 dark:text-slate-400 font-semibold">Tape Input:</span>
                <div className="flex items-center gap-1">
                  {previewInput.split('').map((char, idx) => {
                    const isPassed = idx < previewCharIdx;
                    const isCurrent = idx === previewCharIdx - 1;

                    return (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold border ${
                          isCurrent
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-glow-cyan'
                            : isPassed
                            ? 'bg-[#ede7da] dark:bg-slate-900 border-stone-300 dark:border-slate-700 text-stone-700 dark:text-slate-400'
                            : 'bg-[#faf8f4] dark:bg-slate-950 border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-600'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                  activeNode === 1
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 shadow-sm'
                    : 'bg-stone-200 dark:bg-slate-900 text-stone-700 dark:text-slate-400 border-stone-300 dark:border-slate-700'
                }`}>
                  {activeNode === 1 ? 'ACCEPTED (Ends with 1)' : 'EVALUATING'}
                </span>
                <button
                  onClick={() => setPreviewPlaying(p => !p)}
                  className="p-1 rounded-lg bg-[#ede7da] dark:bg-slate-800 hover:bg-[#e2dacb] dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 transition"
                  title={previewPlaying ? 'Pause live preview' : 'Resume live preview'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Large Interactive Feature Cards */}
      <FeatureCards onNavigate={onNavigate} />

      {/* What is Theory of Computation? */}
      <section className="glass-panel rounded-3xl p-8 sm:p-10 border border-stone-300/80 dark:border-white/[0.08] shadow-2xl space-y-8 bg-[#fffdf9]/95 dark:bg-slate-950/70">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-wider text-violet-700 dark:text-violet-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Theoretical Foundations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            What is Theory of Computation?
          </h2>
          <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed">
            Theory of Computation is the mathematical foundation of computer science. It investigates what problems can be solved algorithmically, how efficiently they can be computed, and the fundamental theoretical limits of all computing machines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#f8f5ee] dark:bg-slate-950/60 border border-stone-200 dark:border-white/[0.06] hover:border-violet-500/40 transition duration-200 space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-700 dark:bg-violet-600/20 dark:text-violet-400 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">Automata Theory</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Mathematical models of abstract computing devices, from simple finite state automata to pushdown automata and universal Turing machines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#f8f5ee] dark:bg-slate-950/60 border border-stone-200 dark:border-white/[0.06] hover:border-cyan-500/40 transition duration-200 space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-700 dark:bg-cyan-600/20 dark:text-cyan-400 w-fit">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">Formal Languages</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              The Chomsky hierarchy: regular languages (DFA/NFA), context-free languages, and recursively enumerable languages recognized by Turing machines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#f8f5ee] dark:bg-slate-950/60 border border-stone-200 dark:border-white/[0.06] hover:border-emerald-500/40 transition duration-200 space-y-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 w-fit">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">Computability & Limits</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Decidability, the Church-Turing thesis, and the famous Halting Problem proving that certain mathematical questions can never be resolved by any algorithm.
            </p>
          </div>
        </div>
      </section>

      {/* How the Simulators Work Walkthrough */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">How the Simulators Work</h2>
          <p className="text-sm text-stone-600 dark:text-slate-400">Engineered for pedagogical transparency and academic rigor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-stone-300/80 dark:border-white/[0.08] shadow-sm space-y-3 relative overflow-hidden bg-[#fffdf9]/95 dark:bg-slate-950/60">
            <div className="text-3xl font-black font-mono text-violet-400/30 absolute top-4 right-4">01</div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">Configure or Load Model</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Choose from pre-tested academic presets or specify your own alphabet, states, transitions, and acceptance criteria in the visual editor.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-stone-300/80 dark:border-white/[0.08] shadow-sm space-y-3 relative overflow-hidden bg-[#fffdf9]/95 dark:bg-slate-950/60">
            <div className="text-3xl font-black font-mono text-cyan-400/30 absolute top-4 right-4">02</div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">Inspect Every Single Step</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Step forward one symbol at a time. Watch the tape head shift, observe subset creation, and read human-friendly transition explanations.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-stone-300/80 dark:border-white/[0.08] shadow-sm space-y-3 relative overflow-hidden bg-[#fffdf9]/95 dark:bg-slate-950/60">
            <div className="text-3xl font-black font-mono text-emerald-400/30 absolute top-4 right-4">03</div>
            <h4 className="text-base font-bold text-stone-900 dark:text-white">Verify Equivalence & Export</h4>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
              Test strings synchronously across machines. Review complete transition matrices and save your work as standard JSON or CSV files.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

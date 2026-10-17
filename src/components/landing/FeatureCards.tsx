import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Network, 
  ArrowRight
} from 'lucide-react';
import { GlowCard } from '../common/GlowCard';

interface FeatureCardsProps {
  onNavigate: (view: 'tm' | 'nfa-dfa') => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onNavigate }) => {
  // --- Turing Machine Interactive Preview State ---
  const [tmTape, setTmTape] = useState(['1', '0', '1', '1', '0', '_']);
  const [tmHead, setTmHead] = useState(2);
  const [isTmAuto, setIsTmAuto] = useState(true);

  // Gentle, calm simulation step
  useEffect(() => {
    if (!isTmAuto) return;
    const timer = setInterval(() => {
      setTmHead(prev => (prev + 1) % tmTape.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [isTmAuto, tmTape.length]);

  // Derived TM state details based on head
  const tmActiveState = tmHead === 5 ? 'q_accept' : tmHead === 0 ? 'q0' : `q${tmHead}`;
  const tmActiveSymbol = tmTape[tmHead];
  const tmNextSymbol = tmActiveSymbol === '1' ? '0' : '1';
  const tmNextState = tmHead === 5 ? 'q_accept' : `q${(tmHead + 1) % 6}`;

  // --- Automata Interactive Preview State ---
  const [activeNfaIndex, setActiveNfaIndex] = useState(1);
  const [isNfaAuto, setIsNfaAuto] = useState(true);

  useEffect(() => {
    if (!isNfaAuto) return;
    const timer = setInterval(() => {
      setActiveNfaIndex(prev => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, [isNfaAuto]);

  const nfaStates = [
    { id: 'q0', label: 'q0', isStart: true, isAccept: false, subset: '{q0}' },
    { id: 'q1', label: 'q1', isStart: false, isAccept: false, subset: '{q1}' },
    { id: 'q01', label: 'q0, q1', isStart: false, isAccept: true, subset: '{q0, q1}' },
  ];

  const currentSubset = nfaStates[activeNfaIndex];

  return (
    <section className="space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4efe8] dark:bg-slate-900 border border-stone-200/90 dark:border-white/10 text-xs font-mono text-cyan-800 dark:text-cyan-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span>Interactive Virtual Workbenches</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Choose Your Computation Engine
        </h2>
        <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed font-sans">
          Engineered for computer science students and educators. Explore real theoretical algorithms through interactive visualizations, step controls, and formal mathematical telemetry.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative">
        {/* Ambient Backlight Radiance behind cards in light mode */}
        <div className="absolute -top-12 left-1/4 -translate-x-1/2 w-[480px] h-[320px] bg-violet-400/25 dark:bg-transparent rounded-full blur-[90px] pointer-events-none -z-10" />
        <div className="absolute -top-12 right-1/4 translate-x-1/2 w-[480px] h-[320px] bg-cyan-400/25 dark:bg-transparent rounded-full blur-[90px] pointer-events-none -z-10" />

        {/* =========================================================
            CARD 1: TURING MACHINE SIMULATOR
            ========================================================= */}
        <GlowCard 
          glowColor="purple"
          customSize={true}
          borderRadius={24}
          spotlightSize={380}
          className="group transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 dark:hover:shadow-violet-900/20 p-7 sm:p-8 bg-[#faf7f2]/95 dark:bg-[#080d1e]/95 backdrop-blur-2xl flex-1 flex flex-col justify-between space-y-6 overflow-hidden border border-[#ded5c5] hover:border-violet-400/50 dark:hover:border-transparent dark:border-transparent"
          onMouseEnter={() => setIsTmAuto(false)}
          onMouseLeave={() => setIsTmAuto(true)}
        >
          {/* Ambient Lighting Glow - Rich vibrant aurora in light mode */}
          <div className="absolute top-0 right-0 w-84 h-84 bg-gradient-to-bl from-violet-500/35 via-purple-500/22 to-transparent dark:from-violet-600/10 dark:via-transparent dark:to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:from-violet-500/50 group-hover:via-purple-500/32 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-400/30 dark:bg-transparent rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-0 right-0 w-44 h-[2px] bg-gradient-to-l from-violet-500/70 via-purple-400/40 to-transparent dark:from-violet-400/20 dark:to-transparent pointer-events-none" />

            {/* Header */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-500/40 text-violet-800 dark:text-violet-300 flex items-center justify-center shadow-xs">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 tracking-wider uppercase">
                        Formal 7-Tuple
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Deterministic
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
                      Turing Machine Simulator
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
                Full deterministic Turing machine execution with an interactive infinite memory tape, bidirectional head kinematics, customizable delta transition matrix, and reversible time-travel debugging.
              </p>
            </div>

            {/* Interactive Showcase: Virtual Tape Chassis */}
            <div className="relative z-10 rounded-2xl p-4 bg-[#f4efe8]/90 dark:bg-[#040713] border border-stone-200/90 dark:border-white/[0.07] space-y-3.5 transition-colors shadow-inner">
              {/* Telemetry Bar */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-slate-400 text-[11px]">Head State:</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950 text-violet-900 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                    {tmActiveState}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-slate-400">
                  <span>Head: <strong className="text-violet-700 dark:text-violet-300">#{tmHead}</strong></span>
                  <span>Scanned: <strong className="text-teal-700 dark:text-cyan-300">'{tmActiveSymbol}'</strong></span>
                </div>
              </div>

              {/* Tape Cells Ribbon with Optical Laser Head */}
              <div className="relative py-2 px-1 flex items-center justify-between gap-1.5 overflow-x-auto">
                {tmTape.map((symbol, idx) => {
                  const isCurrent = idx === tmHead;

                  return (
                    <div
                      key={idx}
                      onClick={() => setTmHead(idx)}
                      onMouseEnter={() => setTmHead(idx)}
                      className={`relative flex-1 min-w-[42px] h-14 rounded-xl flex flex-col items-center justify-center font-mono select-none cursor-pointer transition-[transform,border-color,background-color] duration-150 transform-gpu ${
                        isCurrent
                          ? 'bg-gradient-to-b from-violet-600 to-indigo-700 text-white border-violet-400 shadow-md shadow-violet-500/30 z-10 scale-105 will-change-transform'
                          : 'bg-[#faf7f2] dark:bg-slate-900/70 border-stone-200/90 dark:border-white/[0.06] text-stone-800 dark:text-slate-300 hover:border-violet-400/50 hover:bg-[#f4efe8] dark:hover:bg-slate-900 shadow-xs'
                      }`}
                    >
                      {/* Active Optical Marker */}
                      {isCurrent && (
                        <div className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs" />
                      )}

                      <span className={`text-[8px] font-mono leading-none ${isCurrent ? 'text-violet-200' : 'text-stone-400 dark:text-slate-500'}`}>
                        #{idx}
                      </span>
                      <span className="text-sm font-black mt-1">
                        {symbol === '_' ? '␣' : symbol}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Transition Rule Preview Banner */}
              <div className="text-[11px] font-mono text-center text-stone-600 dark:text-slate-400 bg-[#faf7f2] dark:bg-slate-950/80 py-2 px-3 rounded-xl border border-stone-200/90 dark:border-white/[0.05] shadow-xs">
                Active Rule: <span className="text-violet-700 dark:text-violet-300 font-bold">δ({tmActiveState}, '{tmActiveSymbol}')</span> → <span className="text-emerald-700 dark:text-emerald-400 font-bold">('{tmNextSymbol}', R, {tmNextState})</span>
              </div>
            </div>


            {/* Launch Button */}
            <button
              onClick={() => onNavigate('tm')}
              className="relative w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-md shadow-violet-900/20 active:scale-[0.99] transition-all group/btn"
            >
              <span>Launch Turing Machine Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </GlowCard>

        {/* =========================================================
            CARD 2: NFA TO DFA CONVERTER
            ========================================================= */}
        <GlowCard 
          glowColor="blue"
          customSize={true}
          borderRadius={24}
          spotlightSize={380}
          className="group transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 dark:hover:shadow-cyan-900/20 p-7 sm:p-8 bg-[#faf7f2]/95 dark:bg-[#080d1e]/95 backdrop-blur-2xl flex-1 flex flex-col justify-between space-y-6 overflow-hidden border border-[#ded5c5] hover:border-cyan-400/50 dark:hover:border-transparent dark:border-transparent"
          onMouseEnter={() => setIsNfaAuto(false)}
          onMouseLeave={() => setIsNfaAuto(true)}
        >
          {/* Ambient Lighting Glow - Rich vibrant aurora in light mode */}
          <div className="absolute top-0 right-0 w-84 h-84 bg-gradient-to-bl from-cyan-500/35 via-teal-500/22 to-transparent dark:from-cyan-600/10 dark:via-transparent dark:to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:from-cyan-500/50 group-hover:via-teal-500/32 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/30 dark:bg-transparent rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute top-0 right-0 w-44 h-[2px] bg-gradient-to-l from-cyan-500/70 via-teal-400/40 to-transparent dark:from-cyan-400/20 dark:to-transparent pointer-events-none" />

            {/* Header */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-cyan-950/80 border border-teal-200 dark:border-cyan-500/40 text-teal-800 dark:text-cyan-300 flex items-center justify-center shadow-xs">
                    <Network className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-cyan-500/20 text-teal-800 dark:text-cyan-300 border border-teal-200 dark:border-cyan-500/30 tracking-wider uppercase">
                        Powerset Construction
                      </span>
                      <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        ε-Closure Engine
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
                      NFA → DFA Converter
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-sans">
                Convert nondeterministic automata with spontaneous epsilon transitions into complete deterministic state machines with animated subset construction and synchronized dual execution.
              </p>
            </div>

            {/* Interactive Showcase: Mini Automata Network */}
            <div className="relative z-10 rounded-2xl p-4 bg-[#f4efe8]/90 dark:bg-[#040713] border border-stone-200/90 dark:border-white/[0.07] space-y-3.5 transition-colors shadow-inner">
              {/* Telemetry Bar */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-slate-400 text-[11px]">Subset Trace:</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-cyan-950 text-teal-900 dark:text-cyan-300 border border-teal-200 dark:border-cyan-500/30">
                    {currentSubset.subset}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentSubset.isAccept ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40">
                      ★ ACCEPTING SUBSET
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-500 dark:text-slate-400">
                      Evaluating δ moves
                    </span>
                  )}
                </div>
              </div>

              {/* Mini SVG State Graph with Calm Flow */}
              <div className="h-20 w-full flex items-center justify-center relative select-none">
                <svg className="w-full h-full" viewBox="0 0 320 80">
                  <defs>
                    <marker
                      id="card-arrow-flow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2 L 8 5 L 0 8 z" fill="#06b6d4" />
                    </marker>
                  </defs>

                  {/* Transition curve q0 -> q1 */}
                  <path
                    d="M 68 40 Q 115 14 158 38"
                    fill="none"
                    stroke={activeNfaIndex >= 1 ? '#06b6d4' : '#ded5c5'}
                    strokeWidth="2"
                    className={activeNfaIndex >= 1 ? 'animate-dash-flow' : ''}
                    markerEnd="url(#card-arrow-flow)"
                  />
                  <text x="115" y="20" fill="#0284c7" className="dark:fill-[#38bdf8]" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">0, 1</text>

                  {/* Transition curve q1 -> {q0, q1} */}
                  <path
                    d="M 182 40 Q 224 14 256 38"
                    fill="none"
                    stroke={activeNfaIndex === 2 ? '#10b981' : '#ded5c5'}
                    strokeWidth="2"
                    className={activeNfaIndex === 2 ? 'animate-dash-flow' : ''}
                    markerEnd="url(#card-arrow-flow)"
                  />
                  <text x="220" y="20" fill="#059669" className="dark:fill-[#34d399]" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">1</text>

                  {/* Node 0: q0 */}
                  <g 
                    transform="translate(50, 40)" 
                    className="cursor-pointer"
                    onClick={() => setActiveNfaIndex(0)}
                    onMouseEnter={() => setActiveNfaIndex(0)}
                  >
                    <circle 
                      r="18" 
                      fill={activeNfaIndex === 0 ? '#0891b2' : '#faf7f2'} 
                      stroke={activeNfaIndex === 0 ? '#22d3ee' : '#ded5c5'} 
                      strokeWidth="2" 
                      className="dark:fill-[#0d1424] dark:stroke-slate-600 transition-colors"
                    />
                    <text textAnchor="middle" dominantBaseline="central" fill={activeNfaIndex === 0 ? '#ffffff' : '#1c1917'} className="dark:fill-slate-100" fontSize="10" fontFamily="monospace" fontWeight="bold">q0</text>
                  </g>

                  {/* Node 1: q1 */}
                  <g 
                    transform="translate(170, 40)" 
                    className="cursor-pointer"
                    onClick={() => setActiveNfaIndex(1)}
                    onMouseEnter={() => setActiveNfaIndex(1)}
                  >
                    <circle 
                      r="18" 
                      fill={activeNfaIndex === 1 ? '#0891b2' : '#faf7f2'} 
                      stroke={activeNfaIndex === 1 ? '#22d3ee' : '#ded5c5'} 
                      strokeWidth="2" 
                      className="dark:fill-[#0d1424] dark:stroke-slate-600 transition-colors"
                    />
                    <text textAnchor="middle" dominantBaseline="central" fill={activeNfaIndex === 1 ? '#ffffff' : '#1c1917'} className="dark:fill-slate-100" fontSize="10" fontFamily="monospace" fontWeight="bold">q1</text>
                  </g>

                  {/* Node 2: {q0, q1} (Accepting) */}
                  <g 
                    transform="translate(275, 40)" 
                    className="cursor-pointer"
                    onClick={() => setActiveNfaIndex(2)}
                    onMouseEnter={() => setActiveNfaIndex(2)}
                  >
                    <circle 
                      r="20" 
                      fill={activeNfaIndex === 2 ? '#047857' : '#faf7f2'} 
                      stroke={activeNfaIndex === 2 ? '#34d399' : '#059669'} 
                      strokeWidth="2" 
                      className="dark:fill-[#0d1424] dark:stroke-emerald-500 transition-colors"
                    />
                    <circle 
                      r="16" 
                      fill="none" 
                      stroke={activeNfaIndex === 2 ? '#a7f3d0' : '#059669'} 
                      strokeWidth="1.5" 
                      className="dark:stroke-emerald-400"
                    />
                    <text textAnchor="middle" dominantBaseline="central" fill={activeNfaIndex === 2 ? '#ffffff' : '#1c1917'} className="dark:fill-slate-100" fontSize="9" fontFamily="monospace" fontWeight="bold">q0,q1</text>
                  </g>
                </svg>
              </div>

              {/* Subset conversion equation badge */}
              <div className="text-[11px] font-mono text-center text-stone-600 dark:text-slate-400 bg-[#faf7f2] dark:bg-slate-950/80 py-2 px-3 rounded-xl border border-stone-200/90 dark:border-white/[0.05] shadow-xs">
                Subset: <span className="text-teal-700 dark:text-cyan-300 font-bold">δ({'{'}q0{'}'}, '1')</span> → <span className="text-emerald-700 dark:text-emerald-400 font-bold">{'{'}q0, q1{'}'} (Accepting)</span>
              </div>
            </div>


            {/* Launch Button */}
            <button
              onClick={() => onNavigate('nfa-dfa')}
              className="relative w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-cyan-900/20 active:scale-[0.99] transition-all group/btn"
            >
              <span>Launch NFA → DFA Converter</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </GlowCard>
      </div>
    </section>
  );
};

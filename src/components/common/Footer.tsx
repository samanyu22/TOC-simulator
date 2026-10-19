import React from 'react';
import { Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-stone-200/90 dark:border-slate-800/80 bg-[#f4efe8]/90 dark:bg-[#040711] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-20 text-xs text-stone-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-stone-900 dark:text-white tracking-tight">
              TOC <span className="text-cyan-600 dark:text-cyan-400">LAB</span>
            </span>
          </div>
          <p className="leading-relaxed text-stone-600 dark:text-slate-400">
            Interactive educational playground for Theory of Computation, Automata Theory, and Formal Languages.
          </p>
        </div>

        {/* Academic References */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="font-semibold text-stone-900 dark:text-slate-200 uppercase text-[11px] tracking-wider">
            Academic Foundations
          </h4>
          <ul className="space-y-1.5 text-stone-600 dark:text-slate-400">
            <li>Michael Sipser — <em>Introduction to the Theory of Computation</em></li>
            <li>Hopcroft, Motwani, Ullman — <em>Automata Theory, Languages, and Computation</em></li>
            <li>Alan M. Turing (1936) — <em>On Computable Numbers</em></li>
          </ul>
        </div>

        {/* Simulators */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="font-semibold text-stone-900 dark:text-slate-200 uppercase text-[11px] tracking-wider">
            Simulators
          </h4>
          <ul className="space-y-1.5 text-stone-600 dark:text-slate-400">
            <li>Deterministic Turing Machine Engine</li>
            <li>Interactive Horizontal Infinite Tape</li>
            <li>NFA to DFA Subset Construction</li>
            <li>Dual Synchronous String Simulator</li>
          </ul>
        </div>

        {/* Project Credits */}
        <div className="space-y-2 md:col-span-1">
          <h4 className="font-semibold text-stone-900 dark:text-slate-200 uppercase text-[11px] tracking-wider">
            Credits & Build
          </h4>
          <p className="leading-relaxed text-stone-600 dark:text-slate-400">
            Engineered with React 19, TypeScript, Tailwind CSS, and Vitest.
          </p>
          <div className="pt-2 flex items-center gap-1 text-stone-500 font-mono text-[11px]">
            <span>Crafted for Computer Science Students</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-stone-200/90 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-stone-500 text-[11px] text-center sm:text-left">
        <div>© 2026 TOC LAB. Built for CS 301 / Theory of Computation.</div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span>Deterministic Execution</span>
          <span>•</span>
          <span>Pure In-Browser Computing</span>
        </div>
      </div>
    </footer>
  );
};

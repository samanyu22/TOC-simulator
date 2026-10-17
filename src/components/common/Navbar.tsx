import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Cpu, 
  Network, 
  BookOpen, 
  Layers, 
  Home, 
  Menu, 
  X, 
  FileDown, 
  RotateCcw,
  Sparkles,
  Command
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'tm' | 'nfa-dfa' | 'learn' | 'examples';
  onNavigate: (view: 'home' | 'tm' | 'nfa-dfa' | 'learn' | 'examples') => void;
  onOpenIO: () => void;
  onResetDefaults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenIO,
  onResetDefaults,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      badge: undefined,
      activeClass: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 border border-violet-400/40',
      activeBadge: undefined,
    },
    { 
      id: 'tm', 
      label: 'Turing Machine', 
      icon: Cpu, 
      badge: 'Simulator',
      activeClass: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40',
      activeBadge: 'bg-white/20 text-white border border-white/30',
    },
    { 
      id: 'nfa-dfa', 
      label: 'NFA → DFA', 
      icon: Network, 
      badge: 'Converter',
      activeClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400/40',
      activeBadge: 'bg-white/20 text-white border border-white/30',
    },
    { 
      id: 'learn', 
      label: 'Academy', 
      icon: BookOpen, 
      badge: undefined,
      activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40',
      activeBadge: undefined,
    },
    { 
      id: 'examples', 
      label: 'Library', 
      icon: Layers, 
      badge: '11 Presets',
      activeClass: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/40',
      activeBadge: 'bg-white/20 text-white border border-white/30',
    },
  ] as const;

  const handleNavClick = (view: typeof navItems[number]['id']) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
              <div className="relative p-2 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 group-hover:scale-105 transition duration-200 shadow-xs">
                <Cpu className="w-5 h-5 text-violet-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                  TOC <span className="gradient-text-cyan">LAB</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/30 font-semibold">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block -mt-0.5 tracking-wider uppercase font-semibold">
                Theory Playground
              </span>
            </div>
          </div>

          {/* Center: Segmented Navigation Bar */}
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/[0.08] shadow-inner transition-colors">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? `${item.activeClass} font-bold`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive 
                        ? item.activeBadge
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Tools (Import/Export, Reset, Theme) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenIO}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 transition shadow-xs active:scale-95"
              title="Import or Export Machine Configurations"
            >
              <FileDown className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
              <span>Import / Export</span>
              <kbd className="hidden lg:inline-flex text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold">
                JSON
              </kbd>
            </button>

            <button
              onClick={onResetDefaults}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 transition active:scale-95 shadow-xs"
              title="Reset All Configurations to Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] shadow-xs"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/[0.08] p-4 space-y-2 bg-white/95 dark:bg-[#050813] backdrop-blur-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? `${item.activeClass} font-bold`
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? item.activeBadge
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenIO();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]"
            >
              <FileDown className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400" />
              <span>Import / Export</span>
            </button>
            <button
              onClick={() => {
                onResetDefaults();
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]"
              title="Reset Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

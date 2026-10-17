import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Cpu, 
  Network, 
  BookOpen, 
  Layers, 
  Home, 
  FileDown, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  ExternalLink
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
  const [isResetting, setIsResetting] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Active sliding indicator coordinates
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Hover sliding indicator coordinates
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      badge: undefined,
      activeGradient: 'from-violet-600 to-indigo-600',
      activeShadow: 'shadow-violet-600/30 border-violet-400/40',
      ambientGlow: 'bg-violet-500/20 dark:bg-violet-500/25',
      badgeClass: undefined,
      shortcut: '1',
    },
    { 
      id: 'tm', 
      label: 'Turing Machine', 
      icon: Cpu, 
      badge: undefined,
      activeGradient: 'from-indigo-600 to-blue-600',
      activeShadow: 'shadow-indigo-600/30 border-indigo-400/40',
      ambientGlow: 'bg-indigo-500/20 dark:bg-indigo-500/25',
      badgeClass: undefined,
      shortcut: '2',
    },
    { 
      id: 'nfa-dfa', 
      label: 'NFA → DFA', 
      icon: Network, 
      badge: undefined,
      activeGradient: 'from-cyan-600 to-blue-600',
      activeShadow: 'shadow-cyan-600/30 border-cyan-400/40',
      ambientGlow: 'bg-cyan-500/20 dark:bg-cyan-500/25',
      badgeClass: undefined,
      shortcut: '3',
    },
    { 
      id: 'learn', 
      label: 'Academy', 
      icon: BookOpen, 
      badge: undefined,
      activeGradient: 'from-emerald-600 to-teal-600',
      activeShadow: 'shadow-emerald-600/30 border-emerald-400/40',
      ambientGlow: 'bg-emerald-500/20 dark:bg-emerald-500/25',
      badgeClass: undefined,
      shortcut: '4',
    },
    { 
      id: 'examples', 
      label: 'Library', 
      icon: Layers, 
      badge: undefined,
      activeGradient: 'from-amber-600 to-orange-600',
      activeShadow: 'shadow-amber-600/30 border-amber-400/40',
      ambientGlow: 'bg-amber-500/20 dark:bg-amber-500/25',
      badgeClass: undefined,
      shortcut: '5',
    },
  ] as const;

  const activeItem = navItems.find(item => item.id === currentView) || navItems[0];

  // Update sliding indicator position
  const updateActiveIndicator = useCallback(() => {
    if (!navContainerRef.current) return;
    const activeButton = navContainerRef.current.querySelector<HTMLButtonElement>(`[data-nav-id="${currentView}"]`);
    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
        opacity: 1,
      });
    }
  }, [currentView]);

  useEffect(() => {
    updateActiveIndicator();
    const timer = setTimeout(updateActiveIndicator, 50);
    window.addEventListener('resize', updateActiveIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateActiveIndicator);
    };
  }, [updateActiveIndicator]);

  // Handle navigation click
  const handleNavClick = (view: typeof navItems[number]['id']) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        onOpenIO();
        return;
      }

      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        return;
      }

      // Quick numbers 1-5 for views
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        if (e.key === '1') onNavigate('home');
        if (e.key === '2') onNavigate('tm');
        if (e.key === '3') onNavigate('nfa-dfa');
        if (e.key === '4') onNavigate('learn');
        if (e.key === '5') onNavigate('examples');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, onNavigate, onOpenIO]);

  // Handle animated reset button
  const handleResetClick = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      onResetDefaults();
    }, 300);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300">
      {/* Dynamic Ambient Background Glow that morphs hue with active tab */}
      <div 
        className={`absolute -top-14 left-1/2 -translate-x-1/2 w-4/5 max-w-3xl h-24 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out ${activeItem.ambientGlow}`} 
      />

      {/* Main Glass Navbar Bar */}
      <nav className="relative w-full glass-panel border-b border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Interactive Glow */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group select-none transition-transform duration-300 active:scale-95"
              title="TOC LAB — Back to Home"
            >
              <div className="relative">
                {/* Multi-layered animated aura with smooth 500ms ease-out */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 via-cyan-500 to-indigo-600 rounded-2xl blur-md opacity-55 group-hover:opacity-95 group-hover:blur-xl transition-all duration-500 ease-out group-hover:scale-115"></div>
                
                <div className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/10 group-hover:border-violet-500/50 shadow-xs transition-all duration-400 ease-out group-hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]">
                  <Cpu className="w-5 h-5 text-violet-600 dark:text-cyan-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 ease-out" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight font-sans flex items-center gap-1.5 select-none">
                    <span className="brand-toc">TOC</span>
                    <span className="brand-lab">LAB</span>
                  </span>
                  
                  {/* High-tech pulsing status badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/30 font-semibold shadow-2xs group-hover:border-cyan-500/50 transition-colors duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    v1.0
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block -mt-0.5 tracking-wider uppercase font-semibold group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                  Theory Playground
                </span>
              </div>
            </div>

            {/* Center: Segmented Navigation Bar with Animated Sliding Pill */}
            <div 
              ref={navContainerRef}
              onMouseLeave={() => {
                setHoveredTab(null);
                setHoverIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
              }}
              className="hidden md:flex relative items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-white/[0.08] shadow-inner transition-colors backdrop-blur-md"
            >
              {/* Soft Translucent Hover Backdrop */}
              <div
                className="absolute top-1 bottom-1 rounded-xl bg-slate-200/60 dark:bg-white/[0.06] transition-[left,width,opacity,transform] duration-180 ease-out pointer-events-none transform-gpu will-change-[left,width,opacity]"
                style={{
                  left: `${hoverIndicatorStyle.left}px`,
                  width: `${hoverIndicatorStyle.width}px`,
                  opacity: hoverIndicatorStyle.opacity,
                  transform: hoverIndicatorStyle.opacity ? 'scale(1)' : 'scale(0.95)',
                }}
              />

              {/* Active Morphing Gradient Pill with 120fps Spring Physics */}
              <div
                className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r ${activeItem.activeGradient} shadow-md ${activeItem.activeShadow} border transition-[left,width,opacity] duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none transform-gpu will-change-[left,width,opacity]`}
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
              />

              {/* Navigation Tab Buttons */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isHovered = hoveredTab === item.id;

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => handleNavClick(item.id)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        setHoveredTab(item.id);
                        setHoverIndicatorStyle({
                          left: e.currentTarget.offsetLeft,
                          width: e.currentTarget.offsetWidth,
                          opacity: 1,
                        });
                      } else {
                        setHoveredTab(null);
                        setHoverIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
                      }
                    }}
                    className={`relative z-10 flex items-center gap-2 px-3 lg:px-3.5 py-1.5 rounded-xl text-xs transition-colors duration-200 select-none group/tab ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 font-semibold'
                    }`}
                  >
                    <Icon 
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive 
                          ? 'text-white scale-110' 
                          : isHovered 
                          ? 'text-slate-800 dark:text-slate-200 -translate-y-0.5' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`} 
                    />
                    
                    <span className="tracking-tight whitespace-nowrap">{item.label}</span>

                    {/* Adaptive Badge (Collapses gracefully on mid screens) */}
                    {item.badge && (
                      <span className={`hidden xl:inline-flex text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-all duration-200 ${
                        isActive 
                          ? item.badgeClass
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Quick Tools (Import/Export, Reset Defaults, Theme Toggle) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Import/Export Modal Button */}
              <button
                onClick={onOpenIO}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.08] hover:border-violet-500/30 dark:hover:border-cyan-500/30 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-95"
                title="Import or Export Machine Configurations (Ctrl+I)"
              >
                <FileDown className="w-3.5 h-3.5 text-violet-600 dark:text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
                <span className="hidden lg:inline">Import / Export</span>
                
                <kbd className="inline-flex items-center text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold shadow-2xs">
                  JSON
                </kbd>
              </button>

              {/* Reset to Factory Defaults with Spin Animation */}
              <button
                onClick={handleResetClick}
                disabled={isResetting}
                className="p-2 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 active:scale-95 shadow-xs"
                title="Reset All Configurations to Defaults"
              >
                <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-300 ${isResetting ? 'rotate-180 text-violet-600 dark:text-cyan-400' : ''}`} />
              </button>

              {/* Dual-Theme Light/Dark Switcher */}
              <ThemeToggle />
            </div>

            {/* Mobile Header Controls */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />

              {/* Animated Morphing Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 active:scale-90 shadow-xs"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="w-5 h-4 relative flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? 'rotate-45 translate-x-0.5 -translate-y-0.5' : ''}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${mobileMenuOpen ? '-rotate-45 translate-x-0.5 translate-y-0.5' : ''}`} />
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Fancy Mobile Drawer with Staggered Entrance & Frosted Glass */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-200/80 dark:border-white/[0.08] ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="p-4 space-y-2 bg-white/95 dark:bg-[#070b18]/95 backdrop-blur-2xl shadow-2xl">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{ transitionDelay: `${index * 30}ms` }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 transform ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-md ${item.activeShadow} border scale-[1.01]`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? item.badgeClass
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}

            {/* Mobile Quick Action Footer */}
            <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onOpenIO();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-slate-800 transition active:scale-95 shadow-2xs"
              >
                <FileDown className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
                <span>Import / Export</span>
              </button>

              <button
                onClick={() => {
                  handleResetClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08] hover:text-slate-900 dark:hover:text-white transition active:scale-95 shadow-2xs"
                title="Reset Defaults"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

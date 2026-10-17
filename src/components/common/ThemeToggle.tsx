import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('toc-theme');
      if (stored) return stored === 'dark';
      return true; // default dark-first
    }
    return true;
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('toc-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('toc-theme', 'light');
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsDark(prev => !prev);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative p-2.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.08] hover:border-amber-400/40 dark:hover:border-violet-500/40 transition-all duration-300 shadow-xs hover:shadow-sm active:scale-90 select-none overflow-hidden"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle visual theme"
    >
      <div className={`transition-all duration-400 transform ${isAnimating ? 'scale-125 rotate-180' : 'scale-100 rotate-0'}`}>
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-violet-600 drop-shadow-[0_0_8px_rgba(124,58,237,0.4)] group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
    </button>
  );
};

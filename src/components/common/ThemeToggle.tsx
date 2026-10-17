"use client"

import { useState, useEffect, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("toc-theme")
      if (stored) return stored === "dark"
      return true // default dark-first for TOC LAB
    }
    return true
  })

  // Synchronize with documentElement and localStorage
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.classList.remove("light")
      localStorage.setItem("toc-theme", "dark")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
      localStorage.setItem("toc-theme", "light")
    }
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleTheme()
    }
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 select-none shadow-xs group",
        isDark 
          ? "bg-slate-950 border border-slate-800 hover:border-slate-700 shadow-inner" 
          : "bg-slate-200/90 border border-slate-300/80 hover:border-slate-400 shadow-inner",
        className
      )}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="flex justify-between items-center w-full relative">
        {/* Active sliding thumb / primary slot */}
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-xs",
            isDark 
              ? "transform translate-x-0 bg-slate-800 border border-slate-700/80 text-cyan-300 shadow-slate-950/50" 
              : "transform translate-x-8 bg-white border border-slate-300/80 text-amber-500 shadow-slate-400/40"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] group-hover:-rotate-12 transition-transform duration-300" 
              strokeWidth={2}
            />
          ) : (
            <Sun 
              className="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)] group-hover:rotate-45 transition-transform duration-300" 
              strokeWidth={2}
            />
          )}
        </div>

        {/* Counterpart inactive icon */}
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            isDark 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400/80 transition-colors duration-300" 
              strokeWidth={1.75}
            />
          ) : (
            <Moon 
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" 
              strokeWidth={1.75}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ThemeToggle

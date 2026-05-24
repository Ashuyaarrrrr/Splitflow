import React from "react";
import { ArrowLeft, Moon, Sun, Laptop } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PageLayout = ({ 
  children, 
  title, 
  showBackButton = false, 
  onBack, 
  actions,
  activeTab,
  setActiveTab 
}) => {
  const { darkMode, toggleDarkMode } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/70 to-emerald-100 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950 flex items-center justify-center p-0 md:p-6 font-sans overflow-x-hidden transition-all duration-300">
      
      {/* Decorative desktop elements */}
      <div className="hidden lg:flex flex-col justify-center text-slate-800 dark:text-white max-w-sm mr-16 shrink-0 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-extrabold text-xl">F</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
            SplitFlow
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
          A premium mobile-first fintech app to split bills, track balances, and settle manual payments with friends instantly.
        </p>
        
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-sm dark:shadow-none">
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">✓</div>
            <span>Complete Offline-First PWA Support</span>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">✓</div>
            <span>Auto-Debt Simplification Engine</span>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">✓</div>
            <span>Dual authentication (Email/Google Auth)</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-2">
          <Laptop className="w-4 h-4 text-emerald-500" />
          <span>Interactive mobile simulator view for desktop</span>
        </div>
      </div>

      {/* Main Container - Responsive Mock Smartphone */}
      <div className="relative w-full md:w-[412px] h-screen md:h-[840px] md:max-h-[90vh] md:rounded-[40px] md:shadow-2xl border-0 md:border-[10px] border-slate-950 dark:border-slate-900 bg-white dark:bg-dark-bg flex flex-col overflow-hidden transition-all duration-300 md:ring-1 md:ring-slate-800/10">
        
        {/* iOS style notch/speaker bar on desktop mock */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 dark:bg-slate-900 rounded-b-2xl z-50">
          <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mt-1" />
        </div>

        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border/40 px-4 pt-4 md:pt-8 pb-3.5 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button 
                onClick={onBack} 
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            {actions}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* App Contents */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-slate-50/50 dark:bg-dark-bg">
          {children}
        </main>
      </div>
    </div>
  );
};

import React from "react";
import { ArrowRight, Wallet, Users, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

export const Landing = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-bg justify-between p-6">
      
      {/* Top Banner Details */}
      <div className="flex flex-col gap-8 mt-4">
        {/* App Branding */}
        <div className="flex items-center gap-2.5 justify-center">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-405 to-teal-500 flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg">F</span>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
            SplitFlow
          </span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Bill Sharing</span>
          </div>
          
          <h1 className="text-2xl font-black text-slate-850 dark:text-slate-50 tracking-tight leading-tight max-w-[280px]">
            Split Expenses. <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Share Flows.
            </span>
          </h1>
          
          <p className="text-xs text-slate-550 dark:text-slate-400 max-w-[250px] leading-relaxed">
            The easiest way to track house bills, share trip tabs, and simplify debts with friends completely offline.
          </p>
        </div>

        {/* Feature Cards Loop */}
        <div className="flex flex-col gap-3.5 mt-2">
          
          {/* Card 1 */}
          <div className="flex gap-3.5 items-center p-3.5 bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205">Share with Groups</h3>
              <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">Create custom groups for flats, dinners, or outings.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex gap-3.5 items-center p-3.5 bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205">Simplified Debt</h3>
              <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">Greedy calculations shrink balances to minimal transactions.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex gap-3.5 items-center p-3.5 bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-205">Offline Caching</h3>
              <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-0.5">Access listings, standing structures and entries offline.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col gap-2 mb-4 mt-6">
        <button
          onClick={onGetStarted}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 font-bold text-sm shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

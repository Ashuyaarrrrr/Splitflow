import React from "react";
import { Home, ListOrdered, User } from "lucide-react";

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "dashboard",
      label: "Home",
      icon: <Home className="w-5 h-5" />
    },
    {
      id: "activity",
      label: "Activity",
      icon: <ListOrdered className="w-5 h-5" />
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#111622]/90 backdrop-blur-lg border-t border-slate-100 dark:border-dark-border/40 py-2.5 px-6 shadow-glass dark:shadow-glass-dark flex justify-around items-center safe-bottom">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 ${
              isActive 
                ? "text-emerald-500 font-bold scale-105" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-emerald-500/10" : ""}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] tracking-wide font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

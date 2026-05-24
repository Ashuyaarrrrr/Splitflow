import React from "react";
import { Plus } from "lucide-react";

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 my-6">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-dark-card flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

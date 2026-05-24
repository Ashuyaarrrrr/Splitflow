import React, { useEffect } from "react";
import { Bell, Clock, RefreshCw } from "lucide-react";
import { useGroups } from "../context/GroupContext";
import { EmptyState } from "../components/EmptyState";
import { ActivitySkeleton } from "../components/Skeletons";

export const Activity = () => {
  const { activities, loadingActivities, loadActivities } = useGroups();

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingActivities) {
    return <ActivitySkeleton />;
  }

  // Format date relative to current time
  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-12">
      
      {/* Header with quick refresh button */}
      <div className="flex justify-between items-center px-1 mt-1">
        <div className="flex flex-col">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-emerald-500" />
            <span>Activity Feed</span>
          </h3>
          <span className="text-[9px] text-slate-400 font-semibold tracking-wide">
            Track recent split logs across your groups
          </span>
        </div>
        
        <button
          onClick={loadActivities}
          className="p-2 rounded-xl bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition-colors"
          title="Refresh activities"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activity Timeline List */}
      {activities.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No Recent Activity"
          description="Your split actions, expense logs, and manual settlements will appear in this feed."
        />
      ) : (
        <div className="flex flex-col bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl p-4 divide-y divide-slate-100 dark:divide-dark-border/20 shadow-sm">
          {activities.map((activity) => {
            const timeAgo = formatRelativeDate(activity.date);
            return (
              <div key={activity.id} className="py-3.5 first:pt-1 last:pb-1 flex gap-3.5 items-start group">
                {/* Timeline node dot */}
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-150/80 dark:border-dark-border/40 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0 mt-0.5 shadow-inner group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all duration-300">
                  <Clock className="w-4 h-4 shrink-0" />
                </div>
                
                <div className="flex-1 flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                    {activity.text}
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-505 font-bold">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

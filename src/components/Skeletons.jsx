import React from "react";

export const SkeletonBase = ({ className = "" }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-skeleton rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/40 shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <SkeletonBase className="w-1/3 h-5" />
      <SkeletonBase className="w-12 h-4" />
    </div>
    <SkeletonBase className="w-2/3 h-4" />
    <div className="flex justify-between items-center mt-2">
      <div className="flex -space-x-2">
        <SkeletonBase className="w-7 h-7 rounded-full" />
        <SkeletonBase className="w-7 h-7 rounded-full" />
        <SkeletonBase className="w-7 h-7 rounded-full" />
      </div>
      <SkeletonBase className="w-16 h-6 rounded-full" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="flex flex-col gap-5 p-4">
    {/* Global Balance Card */}
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
      <SkeletonBase className="w-24 h-4 bg-slate-700" />
      <SkeletonBase className="w-48 h-9 bg-slate-700" />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <SkeletonBase className="w-16 h-3 bg-slate-700" />
          <SkeletonBase className="w-24 h-5 bg-slate-700" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBase className="w-16 h-3 bg-slate-700" />
          <SkeletonBase className="w-24 h-5 bg-slate-700" />
        </div>
      </div>
    </div>

    {/* Section Header */}
    <div className="flex justify-between items-center">
      <SkeletonBase className="w-28 h-6" />
      <SkeletonBase className="w-16 h-4" />
    </div>

    {/* Groups List */}
    <div className="flex flex-col gap-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

export const GroupSkeleton = () => (
  <div className="flex flex-col gap-5">
    {/* Header */}
    <div className="p-5 flex flex-col gap-3 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border/40">
      <div className="flex justify-between items-center">
        <SkeletonBase className="w-8 h-8 rounded-full" />
        <SkeletonBase className="w-16 h-5" />
      </div>
      <SkeletonBase className="w-1/2 h-8" />
      <SkeletonBase className="w-3/4 h-4" />
    </div>

    {/* Balances summary */}
    <div className="mx-4 p-4 rounded-2xl bg-slate-100 dark:bg-dark-card/50 flex justify-between">
      <div className="flex flex-col gap-2">
        <SkeletonBase className="w-20 h-3" />
        <SkeletonBase className="w-14 h-5" />
      </div>
      <div className="flex gap-2">
        <SkeletonBase className="w-20 h-10 rounded-full" />
        <SkeletonBase className="w-20 h-10 rounded-full" />
      </div>
    </div>

    {/* Expenses */}
    <div className="mx-4 flex flex-col gap-3">
      <div className="flex gap-3 items-center p-3">
        <SkeletonBase className="w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBase className="w-1/3 h-4" />
          <SkeletonBase className="w-1/4 h-3" />
        </div>
        <SkeletonBase className="w-16 h-5" />
      </div>
      <hr className="border-slate-100 dark:border-dark-border/30" />
      <div className="flex gap-3 items-center p-3">
        <SkeletonBase className="w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBase className="w-1/2 h-4" />
          <SkeletonBase className="w-1/3 h-3" />
        </div>
        <SkeletonBase className="w-12 h-5" />
      </div>
    </div>
  </div>
);

export const ActivitySkeleton = () => (
  <div className="flex flex-col gap-4 p-4">
    <SkeletonBase className="w-36 h-7 mb-2" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-3 items-start p-3">
        <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2 mt-1">
          <SkeletonBase className="w-3/4 h-4" />
          <SkeletonBase className="w-20 h-3" />
        </div>
      </div>
    ))}
  </div>
);

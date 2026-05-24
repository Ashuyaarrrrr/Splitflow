import React, { useState, useEffect } from "react";
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Wallet, AlertCircle, Trash2 } from "lucide-react";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";
import { CreateGroupModal } from "../components/CreateGroupModal";
import { EmptyState } from "../components/EmptyState";
import { DashboardSkeleton } from "../components/Skeletons";
import { calculateBalances } from "../utils/balanceCalculator";
import { isFirebaseConfigured } from "../services/firebase";

export const Dashboard = ({ onNavigateToGroup }) => {
  const { currentUser } = useAuth();
  const { 
    groups, 
    allExpenses, 
    globalBalance, 
    loadingGroups, 
    refreshGlobalBalances,
    deleteGroup
  } = useGroups();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDeleteGroupClick = async (e, groupId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this group? All expenses and activities will be permanently removed.")) {
      try {
        await deleteGroup(groupId);
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  if (loadingGroups) {
    return <DashboardSkeleton />;
  }

  // Helper to calculate the user's balance in a specific group
  const getGroupBalanceText = (group) => {
    const groupExpenses = allExpenses.filter(e => e.groupId === group.id);
    const { netBalances } = calculateBalances(group.members, groupExpenses);
    const myEmailKey = currentUser?.email?.toLowerCase();
    const myBalance = netBalances[myEmailKey] || 0;

    if (myBalance > 0.01) {
      return { 
        text: `You are owed ₹${Math.round(myBalance)}`, 
        style: "text-emerald-500 font-bold text-xs" 
      };
    } else if (myBalance < -0.01) {
      return { 
        text: `You owe ₹${Math.round(Math.abs(myBalance))}`, 
        style: "text-rose-500 font-bold text-xs" 
      };
    } else {
      return { 
        text: "Settled Up", 
        style: "text-slate-400 dark:text-slate-500 font-semibold text-xs" 
      };
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-12">
      
      {/* Welcome Message */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500">
              Total Net Balance
            </span>
            {isFirebaseConfigured ? (
              <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Cloud
              </span>
            ) : (
              <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Sandbox
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
            Hey, {currentUser?.displayName || "Friend"}! 👋
          </h2>
        </div>
        <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} size="md" />
      </div>

      {/* Global Balance Card (Fintech Glassmorphic Card) */}
      <div className="p-6 rounded-3xl bg-slate-900 dark:bg-[#131926] text-white border border-slate-850 dark:border-dark-border/40 shadow-premium-dark flex flex-col gap-4 relative overflow-hidden">
        
        {/* Decorative subtle gradient background blob */}
        <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-400/85 font-extrabold tracking-widest uppercase">
            Net Overview
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black tracking-tight">
              {globalBalance.net >= 0 ? "₹" : "-₹"}
              {Math.abs(globalBalance.net).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1">INR</span>
          </div>
        </div>

        {/* You Owe / Owed Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <div className="w-5 h-5 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">You Owe</span>
            </div>
            <span className="text-base font-extrabold text-rose-455 mt-1">
              ₹{globalBalance.youOwe.toLocaleString("en-IN")}
            </span>
          </div>
          
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Owed to You</span>
            </div>
            <span className="text-base font-extrabold text-emerald-400 mt-1">
              ₹{globalBalance.youAreOwed.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Groups List Header */}
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="flex flex-col">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Active Groups</span>
          </h3>
          <span className="text-[9px] text-slate-400 font-semibold tracking-wide">
            Track expenses inside specific groups
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Group</span>
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Groups Found"
          description="Create a group to start splitting bills and tracking expenses with friends."
          actionLabel="Create First Group"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const balanceInfo = getGroupBalanceText(group);
            const creatorMember = group.members.find(m => m.uid === group.createdBy);
            const creatorName = group.createdBy === currentUser?.uid
              ? "You"
              : (group.createdByName || creatorMember?.name || "Unknown");

            return (
              <div
                key={group.id}
                onClick={() => onNavigateToGroup(group.id)}
                className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 hover:border-emerald-500/30 hover:scale-[1.01] shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col gap-2.5 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-150 group-hover:text-emerald-500 transition-colors">
                      {group.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 max-w-[200px]">
                      {group.description || "No description provided"}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <span>Created by:</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{creatorName}</span>
                    </p>
                  </div>
                  <span className={`${balanceInfo.style} px-2.5 py-1 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border/30 rounded-xl`}>
                    {balanceInfo.text}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1 border-t border-slate-100/60 dark:border-dark-border/20 pt-3">
                  {/* Member avatars */}
                  <div className="flex items-center">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {group.members.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.email}
                          src={member.uid ? groups.find(g=>g.id === group.id)?.members.find(m=>m.email === member.email)?.photoURL : null}
                          name={member.name}
                          size="xs"
                          className="ring-2 ring-white dark:ring-dark-card shadow-sm"
                        />
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 flex items-center justify-center border-2 border-white dark:border-dark-card ring-1 ring-slate-200 dark:ring-slate-700">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-405 dark:text-slate-500 font-semibold ml-2">
                      {group.members.length} members
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {group.createdBy === currentUser?.uid && (
                      <button
                        onClick={(e) => handleDeleteGroupClick(e, group.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[9px] uppercase font-extrabold text-emerald-500 tracking-wider group-hover:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating create group modal */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};

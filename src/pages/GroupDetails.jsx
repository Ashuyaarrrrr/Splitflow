import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, DollarSign, HandCoins, ListFilter, TrendingUp, Info, User, Check, Pizza, Car, Lightbulb, Home, Clapperboard, ShoppingBag, CreditCard, Calendar, Trash2 } from "lucide-react";
import { useGroups } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { SettleUpModal } from "../components/SettleUpModal";
import { EmptyState } from "../components/EmptyState";
import { GroupSkeleton } from "../components/Skeletons";

const CATEGORY_ICONS = {
  Food: <Pizza className="w-5 h-5 text-orange-500" />,
  Travel: <Car className="w-5 h-5 text-blue-500" />,
  Utilities: <Lightbulb className="w-5 h-5 text-amber-500" />,
  Lodging: <Home className="w-5 h-5 text-purple-500" />,
  Entertainment: <Clapperboard className="w-5 h-5 text-pink-500" />,
  Shopping: <ShoppingBag className="w-5 h-5 text-teal-500" />,
  Other: <CreditCard className="w-5 h-5 text-slate-500" />
};

export const GroupDetails = ({ groupId, onBack }) => {
  const { currentUser } = useAuth();
  const { 
    currentGroup, 
    expenses, 
    balances, 
    loadingDetails, 
    loadGroupDetails,
    deleteGroup
  } = useGroups();

  const [activeTab, setActiveTab] = useState("expenses"); // expenses | balances
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  
  // States for prefilled settlement details
  const [settleDebtor, setSettleDebtor] = useState("");
  const [settleCreditor, setSettleCreditor] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

  useEffect(() => {
    if (groupId) {
      loadGroupDetails(groupId);
    }
  }, [groupId, loadGroupDetails]);

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? All expenses and activities will be permanently removed.")) {
      try {
        const success = await deleteGroup(currentGroup.id);
        if (success) {
          onBack();
        }
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  if (loadingDetails || !currentGroup) {
    return <GroupSkeleton />;
  }

  // Calculate category spending percentages
  const getCategorySpending = () => {
    const totals = {};
    let totalSpent = 0;

    expenses.forEach(e => {
      if (!e.isSettlement) {
        const amt = parseFloat(e.amount) || 0;
        totals[e.category] = (totals[e.category] || 0) + amt;
        totalSpent += amt;
      }
    });

    return {
      totals: Object.entries(totals).map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
      })).sort((a, b) => b.amount - a.amount),
      totalSpent
    };
  };

  const { totals: categoryAnalytics, totalSpent } = getCategorySpending();

  // Helper to format date
  const formatDateString = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleOpenSettleWithDefaults = (debt) => {
    setSettleDebtor(debt.from);
    setSettleCreditor(debt.to);
    setSettleAmount(debt.amount);
    setIsSettleOpen(true);
  };

  const handleOpenGeneralSettle = () => {
    setSettleDebtor("");
    setSettleCreditor("");
    setSettleAmount("");
    setIsSettleOpen(true);
  };

  const myEmailKey = currentUser?.email?.toLowerCase();
  const myNetBalance = balances.netBalances[myEmailKey] || 0;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-dark-bg relative">
      
      {/* Group Info Header card */}
      <div className="bg-white dark:bg-[#111622] px-4 py-5 border-b border-slate-100 dark:border-dark-border/40 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {currentGroup.name}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[280px]">
              {currentGroup.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border/40 rounded-lg px-2 py-1">
              {currentGroup.members.length} members
            </span>
            {currentGroup.createdBy === currentUser?.uid && (
              <button
                onClick={handleDeleteGroup}
                className="p-1.5 text-slate-450 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Delete Group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Group balance banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-bg/60 border border-slate-150/60 dark:border-dark-border/30 flex justify-between items-center mt-1">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-extrabold text-slate-450 tracking-wider">Your Stand</span>
            <span className={`text-sm font-black mt-0.5 ${
              myNetBalance > 0.01 ? "text-emerald-500" : myNetBalance < -0.01 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"
            }`}>
              {myNetBalance > 0.01 
                ? `You are owed ₹${Math.round(myNetBalance)}` 
                : myNetBalance < -0.01 
                  ? `You owe ₹${Math.round(Math.abs(myNetBalance))}` 
                  : "You are settled up"
              }
            </span>
          </div>
          
          <button
            onClick={handleOpenGeneralSettle}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-dark-border/40 hover:border-emerald-500/30 text-slate-600 dark:text-slate-300 hover:text-emerald-500 text-[11px] font-extrabold rounded-xl transition-all"
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Settle Up</span>
          </button>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex border-b border-slate-150 dark:border-dark-border/35 bg-white dark:bg-[#111622] sticky top-0 z-10">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === "expenses"
              ? "border-emerald-500 text-emerald-500 font-extrabold"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
          }`}
        >
          Expenses ({expenses.filter(e => !e.isSettlement).length})
        </button>
        <button
          onClick={() => setActiveTab("balances")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === "balances"
              ? "border-emerald-500 text-emerald-500 font-extrabold"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
          }`}
        >
          Balances & Analytics
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {activeTab === "expenses" ? (
          /* EXPENSES TAB */
          expenses.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="w-8 h-8" />}
              title="No Expenses Found"
              description="Click 'Add Expense' below to log transactions for this group."
              actionLabel="Add Expense"
              onAction={() => setIsAddExpenseOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-150/65 dark:divide-dark-border/20 bg-white dark:bg-dark-card/20 px-3.5">
              {expenses.map((expense) => {
                const dateStr = formatDateString(expense.date);
                const isSettlement = expense.isSettlement;
                const cost = parseFloat(expense.amount) || 0;

                if (isSettlement) {
                  // Settlement Row Render
                  return (
                    <div key={expense.id} className="py-3.5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-xs font-bold text-slate-750 dark:text-slate-200">
                          {expense.title}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {dateStr}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-500 whitespace-nowrap">
                        ₹{Math.round(cost)}
                      </span>
                    </div>
                  );
                }

                // Normal Expense Row Render
                const categoryIcon = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Other;
                
                // Details of who paid
                const paidByMember = currentGroup.members.find(m => m.email.toLowerCase() === expense.paidBy.toLowerCase());
                const payerName = paidByMember ? (paidByMember.email.toLowerCase() === currentUser?.email?.toLowerCase() ? "You" : paidByMember.name) : expense.paidBy.split("@")[0];

                return (
                  <div key={expense.id} className="py-4 flex items-center gap-3.5 group">
                    <div className="w-9.5 h-9.5 rounded-2xl bg-slate-50 dark:bg-dark-card flex items-center justify-center shrink-0 border border-slate-150/80 dark:border-dark-border/30 shadow-inner group-hover:scale-105 transition-transform">
                      {categoryIcon}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-150 line-clamp-1">
                        {expense.title}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>Paid by {payerName}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs font-black text-slate-850 dark:text-white">
                        ₹{Math.round(cost)}
                      </span>
                      {expense.splitAmong && (
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          split among {expense.splitAmong.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* BALANCES & ANALYTICS TAB */
          <div className="flex flex-col gap-6 p-4">
            
            {/* Simplified Debts Box */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1 px-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Simplified Debts</h4>
              </div>

              {balances.simplifiedDebts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 shadow-sm text-center">
                  <span className="text-xs font-bold text-emerald-500">🎉 Everyone is settled up!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {balances.simplifiedDebts.map((debt, index) => {
                    const isFromMe = debt.from.toLowerCase() === currentUser?.email?.toLowerCase();
                    const isToMe = debt.to.toLowerCase() === currentUser?.email?.toLowerCase();

                    return (
                      <div 
                        key={index} 
                        className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={debt.fromName} size="sm" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              <span className={isFromMe ? "font-bold text-rose-500" : ""}>{isFromMe ? "You" : debt.fromName}</span>
                              <span className="text-slate-450 dark:text-slate-500 px-1 font-normal">owes</span>
                              <span className={isToMe ? "font-bold text-emerald-500" : ""}>{isToMe ? "You" : debt.toName}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">₹{Math.round(debt.amount)}</p>
                          </div>
                        </div>

                        {/* Settle shortcut button */}
                        {isFromMe && (
                          <button
                            onClick={() => handleOpenSettleWithDefaults(debt)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-dark-border/30" />

            {/* Spending Analytics Progress Bars */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1 px-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Group Spending Breakdown</h4>
              </div>

              {totalSpent === 0 ? (
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 shadow-sm text-center">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">No expenses recorded for charts</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-405">Total Spending</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">₹{Math.round(totalSpent)}</span>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {categoryAnalytics.map((cat) => (
                      <div key={cat.name} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{cat.name}</span>
                          <span>₹{Math.round(cat.amount)} ({cat.percentage}%)</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-dark-border/30" />

            {/* Individual member standing details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1 px-1">
                <User className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Member Standings</h4>
              </div>

              <div className="bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl divide-y divide-slate-150 dark:divide-dark-border/20 overflow-hidden shadow-sm">
                {currentGroup.members.map((m) => {
                  const bal = balances.netBalances[m.email.toLowerCase()] || 0;
                  return (
                    <div key={m.email} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} size="sm" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {m.name} {m.email.toLowerCase() === currentUser?.email?.toLowerCase() && "(You)"}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">{m.email}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-extrabold ${
                        bal > 0.01 ? "text-emerald-500" : bal < -0.01 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {bal > 0.01 
                          ? `+₹${Math.round(bal)}` 
                          : bal < -0.01 
                            ? `-₹${Math.round(Math.abs(bal))}` 
                            : "Settled"
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Floating Add Expense Footer Button (Sticky at the bottom right of phone mockup screen) */}
      <div className="absolute bottom-4 right-4 z-30">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="flex items-center gap-1.5 px-4.5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Page modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        group={currentGroup}
      />

      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        group={currentGroup}
        defaultDebtor={settleDebtor}
        defaultCreditor={settleCreditor}
        defaultAmount={settleAmount}
      />
    </div>
  );
};

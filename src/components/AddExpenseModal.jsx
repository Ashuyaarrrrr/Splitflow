import React, { useState, useEffect } from "react";
import { X, Calendar, FileText, Check, DollarSign, Tag, Pizza, Car, Lightbulb, Home, Clapperboard, ShoppingBag, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupContext";
import { useToast } from "./Toast";

const CATEGORIES = [
  { id: "Food", label: "Food", icon: <Pizza className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "Travel", label: "Travel", icon: <Car className="w-4 h-4" />, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "Utilities", label: "Bills", icon: <Lightbulb className="w-4 h-4" />, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "Lodging", label: "Hotel", icon: <Home className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "Entertainment", label: "Fun", icon: <Clapperboard className="w-4 h-4" />, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "Shopping", label: "Shop", icon: <ShoppingBag className="w-4 h-4" />, color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  { id: "Other", label: "Other", icon: <CreditCard className="w-4 h-4" />, color: "bg-slate-500/10 text-slate-550 border-slate-500/20" }
];

export const AddExpenseModal = ({ isOpen, onClose, group }) => {
  const { currentUser } = useAuth();
  const { addExpense } = useGroups();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitAmong, setSplitAmong] = useState([]);
  const [category, setCategory] = useState("Other");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  // Prepopulate values when modal opens
  useEffect(() => {
    if (group && isOpen) {
      // Default payer is current user (if in group)
      const isMeInGroup = group.members.some(m => m.email.toLowerCase() === currentUser?.email?.toLowerCase());
      setPaidBy(isMeInGroup ? currentUser.email : group.members[0]?.email);
      // Pre-check all members for equal split
      setSplitAmong(group.members.map(m => m.email));
      setTitle("");
      setAmount("");
      setCategory("Other");
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [group, isOpen, currentUser]);

  if (!isOpen || !group) return null;

  const handleToggleSplitMember = (email) => {
    setSplitAmong(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email) 
        : [...prev, email]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please enter an expense title", "warning");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "warning");
      return;
    }
    if (!paidBy) {
      showToast("Please select who paid", "warning");
      return;
    }
    if (splitAmong.length === 0) {
      showToast("Select at least one member to split with", "warning");
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        groupId: group.id,
        title: title.trim(),
        amount: parseFloat(amount),
        paidBy: paidBy.toLowerCase(),
        splitAmong: splitAmong.map(e => e.toLowerCase()),
        category,
        note: note.trim(),
        date: new Date(date).toISOString(),
        isSettlement: false
      });

      showToast("Expense added successfully!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to add expense", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all duration-300">
      <div className="bg-white dark:bg-[#111622] rounded-t-[32px] max-h-[92%] flex flex-col shadow-2xl border-t border-slate-100 dark:border-dark-border/40 animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-dark-border/45">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Add Expense</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{group.name}</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar flex flex-col gap-5">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            
            {/* Amount and Title Inputs */}
            <div className="flex flex-col gap-4 bg-slate-50 dark:bg-dark-card p-5 rounded-2xl border border-slate-150/60 dark:border-dark-border/30">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">What is this for?</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Groceries, Fuel, Movie tickets"
                  className="w-full bg-transparent text-sm outline-none font-bold text-slate-850 dark:text-white"
                />
              </div>
              <div className="h-[1px] bg-slate-200 dark:bg-dark-border/30" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">How much?</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-emerald-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-xl outline-none font-black text-slate-850 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Category Selector (Horizontal Scrolling List) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Category</span>
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold shrink-0 transition-all ${
                        isSelected 
                          ? `${cat.color} border-emerald-500 scale-105 shadow-sm` 
                          : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border/40 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paid By Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-3.5 text-sm outline-none text-slate-800 dark:text-slate-100"
              >
                {group.members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.name} ({member.email === currentUser?.email ? "You" : member.email.split("@")[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Split With Checklist */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Split Equally Among</label>
                <button
                  type="button"
                  onClick={() => {
                    const allEmails = group.members.map(m => m.email);
                    if (splitAmong.length === allEmails.length) {
                      setSplitAmong([]);
                    } else {
                      setSplitAmong(allEmails);
                    }
                  }}
                  className="text-[10px] text-emerald-500 font-extrabold hover:underline"
                >
                  {splitAmong.length === group.members.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="bg-slate-50 dark:bg-dark-card/50 border border-slate-150/60 dark:border-dark-border/30 rounded-2xl divide-y divide-slate-150 dark:divide-dark-border/20 max-h-[160px] overflow-y-auto no-scrollbar">
                {group.members.map((member) => {
                  const isChecked = splitAmong.includes(member.email);
                  return (
                    <div 
                      key={member.email}
                      onClick={() => handleToggleSplitMember(member.email)}
                      className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{member.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">{member.email}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isChecked 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-slate-300 dark:border-dark-border/80"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note & Date Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs outline-none text-slate-850 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Add Note</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Memo"
                  className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs outline-none text-slate-850 dark:text-white"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-dark-card/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Add Expense</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

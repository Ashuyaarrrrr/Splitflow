import React, { useState, useEffect } from "react";
import { X, Calendar, HandCoins, ArrowRight, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupContext";
import { useToast } from "./Toast";

export const SettleUpModal = ({ isOpen, onClose, group, defaultDebtor, defaultCreditor, defaultAmount }) => {
  const { currentUser } = useAuth();
  const { addExpense } = useGroups();
  const { showToast } = useToast();

  const [payer, setPayer] = useState(""); // Who is sending money (debtor)
  const [receiver, setReceiver] = useState(""); // Who is receiving money (creditor)
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  // Prepopulate when modal opens
  useEffect(() => {
    if (group && isOpen) {
      setPayer(defaultDebtor || currentUser?.email || group.members[0]?.email);
      setReceiver(defaultCreditor || (group.members.find(m => m.email !== (defaultDebtor || currentUser?.email))?.email || group.members[0]?.email));
      setAmount(defaultAmount || "");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [group, isOpen, defaultDebtor, defaultCreditor, defaultAmount, currentUser]);

  if (!isOpen || !group) return null;

  // Filter receiver list to exclude selected payer
  const availableReceivers = group.members.filter(m => m.email.toLowerCase() !== payer.toLowerCase());

  const handleSave = async (e) => {
    e.preventDefault();
    if (!payer || !receiver) {
      showToast("Please select both payer and receiver", "warning");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "warning");
      return;
    }

    setLoading(true);
    try {
      const payerName = group.members.find(m => m.email.toLowerCase() === payer.toLowerCase())?.name || payer;
      const receiverName = group.members.find(m => m.email.toLowerCase() === receiver.toLowerCase())?.name || receiver;

      await addExpense({
        groupId: group.id,
        title: `${payerName} settled with ${receiverName}`,
        amount: parseFloat(amount),
        paidBy: payer.toLowerCase(),
        splitAmong: [payer.toLowerCase()], // Self split for settlements
        category: "Settlement",
        note: `Manual cash settlement from ${payerName} to ${receiverName}`,
        date: new Date(date).toISOString(),
        isSettlement: true,
        settlementReceiver: receiver.toLowerCase()
      });

      showToast("Settlement recorded successfully!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to record settlement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all duration-300">
      <div className="bg-white dark:bg-[#111622] rounded-t-[32px] max-h-[90%] flex flex-col shadow-2xl border-t border-slate-100 dark:border-dark-border/40 animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-dark-border/45">
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Record a Settlement</h3>
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
            
            {/* Visual Flow diagram: Payer -> Receiver */}
            <div className="flex justify-center items-center gap-4 bg-slate-50 dark:bg-dark-card p-5 rounded-2xl border border-slate-150/60 dark:border-dark-border/30">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold uppercase text-slate-405 tracking-wider">Sender</span>
                <select
                  value={payer}
                  onChange={(e) => {
                    setPayer(e.target.value);
                    // Reset receiver if it matches new payer
                    if (e.target.value.toLowerCase() === receiver.toLowerCase()) {
                      setReceiver(group.members.find(m => m.email.toLowerCase() !== e.target.value.toLowerCase())?.email || "");
                    }
                  }}
                  className="w-full text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-dark-border/40 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {group.members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold uppercase text-slate-405 tracking-wider">Recipient</span>
                <select
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  className="w-full text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-dark-border/40 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {availableReceivers.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount Input */}
            <div className="flex flex-col gap-1 bg-slate-50 dark:bg-dark-card px-4 py-3.5 rounded-xl border border-slate-200 dark:border-dark-border/40">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Amount Settled</label>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-emerald-500">₹</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-lg outline-none font-black text-slate-850 dark:text-white"
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Date of Settlement</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs outline-none text-slate-850 dark:text-white"
              />
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
              <span>Confirm Settlement</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

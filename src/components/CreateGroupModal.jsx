import React, { useState } from "react";
import { X, Plus, UserPlus, UserCheck, FolderPlus } from "lucide-react";
import { useGroups } from "../context/GroupContext";
import { useToast } from "./Toast";

export const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useGroups();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      showToast("Please fill in both name and email for the member", "warning");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail.trim())) {
      showToast("Please enter a valid email address", "warning");
      return;
    }

    if (membersList.some(m => m.email.toLowerCase() === memberEmail.toLowerCase())) {
      showToast("This email has already been added", "warning");
      return;
    }

    setMembersList(prev => [
      ...prev,
      { 
        name: memberName.trim(), 
        email: memberEmail.trim().toLowerCase() 
      }
    ]);
    
    // Clear inputs
    setMemberName("");
    setMemberEmail("");
    showToast("Member added to list", "success");
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembersList(prev => prev.filter(m => m.email !== emailToRemove));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a group name", "warning");
      return;
    }

    setLoading(true);
    try {
      await createGroup(name.trim(), description.trim(), membersList);
      showToast("Group created successfully!", "success");
      
      // Reset state and close
      setName("");
      setDescription("");
      setMembersList([]);
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to create group", "error");
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
            <FolderPlus className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Group</h3>
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
          {/* Details Form */}
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Flatmates, Road Trip 🚘"
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100 transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm outline-none text-slate-800 dark:text-slate-100 transition-colors"
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-dark-border/30" />

          {/* Add Members Form */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Add Group Members</label>
            <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Member Name"
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 dark:text-slate-100"
              />
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-card dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 border border-dashed border-slate-300 dark:border-dark-border/50 text-xs font-bold rounded-xl transition-all"
              >
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>Add Member to List</span>
              </button>
            </form>
          </div>

          {/* Added Members List */}
          {membersList.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">Added ({membersList.length})</label>
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto no-scrollbar">
                {membersList.map((m) => (
                  <div 
                    key={m.email} 
                    className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 text-xs rounded-full"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">{m.name}</span>
                    <button 
                      onClick={() => handleRemoveMember(m.email)}
                      className="p-0.5 hover:bg-emerald-500/20 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Create Group</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

// Add CSS keyframe for slide-up animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;
document.head.appendChild(styleSheet);

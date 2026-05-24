import React, { useState, useEffect } from "react";
import { User, Shield, Moon, Sun, LogOut, Check, Sparkles, Smartphone, Download, UserPen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Avatar } from "../components/Avatar";

export const Profile = () => {
  const { currentUser, logout, darkMode, toggleDarkMode, updateUserProfileInfo } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState(currentUser?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Monitor deferred install prompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if app is run in standalone mode (installed PWA)
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    const promptEvent = installPrompt || window.deferredPrompt;
    if (!promptEvent) {
      showToast("PWA install prompt is not ready yet. Make sure you are using Chrome/Edge on Desktop, or Safari Share on iOS.", "info");
      return;
    }
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === "accepted") {
      setInstallPrompt(null);
      window.deferredPrompt = null;
      setIsInstalled(true);
      showToast("Thank you for installing SplitFlow!", "success");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      // Randomize Dicebear avatar seed on name change for mock fun
      const newPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=d1f4c9`;
      await updateUserProfileInfo(name.trim(), newPhoto);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5 pb-12">
      
      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-dark-card border border-slate-150/65 dark:border-dark-border/40 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center">
        
        <div className="relative group">
          <Avatar 
            src={currentUser?.photoURL} 
            name={currentUser?.displayName || currentUser?.email} 
            size="xxl" 
            className="ring-4 ring-emerald-500/20 shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full shadow-md border border-white dark:border-dark-card">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 w-full max-w-[240px]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full text-center bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border/60 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setName(currentUser?.displayName || "");
                  setIsEditing(false);
                }}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-base font-black text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
              <span>{currentUser?.displayName || "Anonymous User"}</span>
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
                title="Edit name"
              >
                <UserPen className="w-3.5 h-3.5" />
              </button>
            </h3>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium mt-0.5">
              {currentUser?.email}
            </span>
          </div>
        )}
      </div>

      {/* Settings Options Group */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400 px-1">Settings</label>
        
        <div className="bg-white dark:bg-dark-card border border-slate-150/60 dark:border-dark-border/40 rounded-2xl divide-y divide-slate-100 dark:divide-dark-border/20 shadow-sm overflow-hidden">
          
          {/* Dark Mode toggle row */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-550 flex items-center justify-center">
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Dark Interface</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">Enable high-contrast night theme</span>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-6.5 rounded-full p-1 transition-all ${
                darkMode ? "bg-emerald-500" : "bg-slate-200"
              }`}
            >
              <div 
                className={`w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${
                  darkMode ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* PWA Installer Action */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Install SplitFlow</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-505">Add app to device home screen</span>
              </div>
            </div>
            {isInstalled ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 px-2.5 py-1 bg-emerald-500/10 rounded-full">
                <Check className="w-3 h-3" />
                <span>Installed</span>
              </span>
            ) : (
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>

          {/* Dummy Status row */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-555 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Offline Caching</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">Service Worker static caching active</span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
              Active
            </span>
          </div>

        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          logout();
          showToast("Logged out successfully!", "info");
        }}
        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-dark-border/40 text-rose-500 rounded-2xl py-3.5 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Session</span>
      </button>

    </div>
  );
};

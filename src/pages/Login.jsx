import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { LogIn, Mail, Lock, ShieldAlert } from "lucide-react";
import { isFirebaseConfigured } from "../services/firebase";

export const Login = ({ onNavigateToSignup }) => {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields", "warning");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showToast("Logged in successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to log in", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Logged in with Google!", "success");
    } catch (error) {
      console.error(error);
      showToast("Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login("ashu@splitflow.com", "password");
      showToast("Logged in to Demo Account!", "success");
    } catch (error) {
      console.error(error);
      showToast("Demo login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8 h-full justify-center">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-white font-extrabold text-2xl">F</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Welcome to SplitFlow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-455 max-w-[250px]">
          Split expenses, manage cash flows, and simplify debts with flatmates & friends.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="text-[10px] font-semibold leading-relaxed">
            Running in sandbox mock database mode. All actions are simulated locally.
          </span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ashu@example.com"
              className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 dark:focus:border-emerald-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 dark:focus:border-emerald-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 font-bold text-sm shadow-md hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </>
          )}
        </button>
      </form>

      {/* Alternative Logins */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 my-1">
          <hr className="flex-1 border-slate-200 dark:border-dark-border/40" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">
            Or Connect With
          </span>
          <hr className="flex-1 border-slate-200 dark:border-dark-border/40" />
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 hover:bg-slate-50 dark:hover:bg-slate-800 py-3.5 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8.05 12.6a5.94 5.94 0 0 1 5.94-5.918c1.62 0 3.098.65 4.195 1.705l3.14-3.14C19.336 3.32 16.853 2 13.99 2 8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.448 0 9.692-3.85 9.692-9.715 0-.585-.052-1.154-.15-1.705H12.24Z"
            />
          </svg>
          <span>Google Authentication</span>
        </button>

        <button
          onClick={handleDemoLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
        >
          <span>✨ Explore Instant Demo Account</span>
        </button>
      </div>

      {/* Navigation to Signup */}
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
        Don't have an account?{" "}
        <button
          onClick={onNavigateToSignup}
          className="text-emerald-500 font-bold hover:underline"
        >
          Sign Up Free
        </button>
      </p>
    </div>
  );
};

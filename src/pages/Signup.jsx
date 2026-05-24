import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { UserPlus, User, Mail, Lock } from "lucide-react";

export const Signup = ({ onNavigateToLogin }) => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Please fill in all fields", "warning");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      showToast("Account created successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to sign up", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6 py-8 h-full justify-center">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2 mb-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-white font-extrabold text-2xl">F</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          Create an Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px]">
          Join SplitFlow today to share expenses seamlessly with friends.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ashu Kumar"
              className="w-full bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 focus:border-emerald-500 dark:focus:border-emerald-500/60 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

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
              placeholder="Min. 6 characters"
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
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Navigation to Login */}
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
        Already have an account?{" "}
        <button
          onClick={onNavigateToLogin}
          className="text-emerald-500 font-bold hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
};

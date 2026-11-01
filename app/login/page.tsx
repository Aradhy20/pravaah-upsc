"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Key,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const selectedPlanCode = searchParams.get("plan");
  const selectedInterval = searchParams.get("interval") || "ANNUAL";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data.authenticated) {
          setCurrentUser(json.data.user);
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.role === "ADMIN") {
          window.location.href = "/admin";
        } else if (selectedPlanCode && selectedPlanCode !== "FREE") {
          window.location.href = `/pricing?autoCheckout=${selectedPlanCode}&interval=${selectedInterval}`;
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error?.message || "Invalid credentials. Please verify your email and password.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "ASPIRANT" | "ADMIN") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        if (role === "ADMIN") {
          window.location.href = "/admin";
        } else if (selectedPlanCode && selectedPlanCode !== "FREE") {
          window.location.href = `/pricing?autoCheckout=${selectedPlanCode}&interval=${selectedInterval}`;
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error?.message || "Demo login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {selectedPlanCode && selectedPlanCode !== "FREE" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-center gap-2 text-xs">
            <Sparkles className="h-4 w-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-bold text-blue-950">
                Selected Plan: {selectedPlanCode} ({selectedInterval.toLowerCase()})
              </span>
              <p className="text-[11px] text-blue-800">
                Sign in to your account to complete subscription upgrade.
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white mb-3 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Pravaah UPSC
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Access your private notes, bookmarks, mock scores, and revision queue.
          </p>
        </div>

        {currentUser && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 flex items-center justify-between">
            <div>
              <p className="font-semibold">Currently signed in as:</p>
              <p className="text-slate-900 font-bold">{currentUser.fullName} ({currentUser.email})</p>
            </div>
            <a
              href={currentUser.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="rounded-lg bg-blue-700 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-blue-800"
            >
              Go to {currentUser.role === "ADMIN" ? "Admin" : "Dashboard"}
            </a>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aspirant@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-semibold">Or Instant Evaluator Access</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleQuickDemo("ASPIRANT")}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Demo Aspirant</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("ADMIN")}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Demo Admin</span>
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          New UPSC Aspirant?{" "}
          <a
            href={selectedPlanCode ? `/register?plan=${selectedPlanCode}&interval=${selectedInterval}` : "/register"}
            className="font-bold text-blue-700 hover:underline"
          >
            Create Free Account
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

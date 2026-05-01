import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";

import { localAccountShortcuts } from "@/features/auth/data/localAccountShortcuts";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { AccountType } from "@/shared/types";
import { cn } from "@/shared/utils";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loading, error } = useCurrentUser();
  const isLoginPage = location.pathname === "/login";

  const [mode, setMode] = useState<"signup" | "login">(
    isLoginPage ? "login" : "signup",
  );
  const [accountType, setAccountType] = useState<AccountType>("Individual");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("FlowX User");
  const [email, setEmail] = useState("user@flowx.demo");
  const [password, setPassword] = useState("user123");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const nextMode = location.pathname === "/login" ? "login" : "signup";
    setMode(nextMode);
    setFormError(null);
  }, [location.pathname]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    try {
      if (mode === "login") {
        const authenticatedUser = await login({ email, password });
        if (!authenticatedUser) {
          setFormError(
            "Invalid credentials or the authentication service is unavailable.",
          );
          return;
        }
      } else {
        const createdUser = await signup({
          fullName,
          email,
          password,
          role: "user",
          accountType,
        });
        if (!createdUser) {
          setFormError(
            "Signup failed. Please check your details and try again.",
          );
          return;
        }
      }

      navigate("/dashboard", { replace: true });
    } catch {
      setFormError("Authentication failed. Please try again.");
    }
  };

  const fillLocalCredentials = (role: "admin" | "user") => {
    const credentials = localAccountShortcuts.find(
      (item) => item.role === role,
    );
    if (!credentials) return;

    setEmail(credentials.email);
    setPassword(credentials.password);
    setFullName(credentials.name);
    setAccountType(role === "admin" ? "Business" : "Individual");
  };

  return (
    <div className="min-h-screen flex items-stretch bg-surface-bg overflow-hidden text-navy-900">
      <div className="hidden lg:flex w-5/12 bg-navy-900 p-16 flex-col justify-between text-white relative">
        <div className="relative z-10">
          <Link
            to="/"
            className="text-3xl font-bold tracking-tighter text-teal-500 mb-12 flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-navy-900 text-xs">
              FX
            </div>
            FlowX
          </Link>
          <h1 className="text-5xl font-bold leading-tight mb-6 mt-12 tracking-tight">
            The institutional standard for global transfers.
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-sm">
            Experience uncompromising speed, security, and precision on a global
            scale.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2rem] shadow-elevated">
          <div className="flex gap-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Shield className="text-teal-400 w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">Invisible Security</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Your identity helps us protect the FlowX community. Bank-grade
                controls keep transfer flows safe and easy to review.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 sm:px-12 lg:px-24 bg-white flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-12 text-center">
            <div className="text-3xl font-bold tracking-tighter text-navy-900 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-[10px]">
                FX
              </div>
              FlowX
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-[320px] shadow-inner">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                  mode === "signup"
                    ? "bg-white text-navy-900 shadow-elevated"
                    : "text-slate-400 hover:text-navy-900",
                )}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                  mode === "login"
                    ? "bg-white text-navy-900 shadow-elevated"
                    : "text-slate-400 hover:text-navy-900",
                )}
              >
                Log In
              </button>
            </div>
          </div>

          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl font-bold text-navy-900 mb-2 tracking-tight">
              {mode === "signup" ? "Join FlowX" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              {mode === "signup"
                ? "Create an account to access secure transfer workflows."
                : "Log in to manage transfers and account activity."}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => fillLocalCredentials("user")}
                className="rounded-2xl border border-slate-200 p-3 text-left hover:border-teal-500/40 transition-colors"
              >
                <span className="block text-xs font-black text-navy-900">
                  User Account
                </span>
                <span className="block text-[10px] text-slate-400 font-bold mt-1">
                  user@flowx.demo
                </span>
              </button>
              <button
                type="button"
                onClick={() => fillLocalCredentials("admin")}
                className="rounded-2xl border border-slate-200 p-3 text-left hover:border-teal-500/40 transition-colors"
              >
                <span className="block text-xs font-black text-navy-900">
                  Admin Account
                </span>
                <span className="block text-[10px] text-slate-400 font-bold mt-1">
                  admin@flowx.demo
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div className="space-y-3 pb-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        type: "Individual" as AccountType,
                        icon: User,
                        desc: "Personal use",
                      },
                      {
                        type: "Business" as AccountType,
                        icon: Building2,
                        desc: "Business user",
                      },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setAccountType(item.type)}
                        className={cn(
                          "p-4 border rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 text-left relative",
                          accountType === item.type
                            ? "border-navy-900 bg-navy-900 text-white shadow-elevated"
                            : "border-slate-200 hover:border-slate-300 text-slate-500 bg-white",
                        )}
                      >
                        <item.icon
                          size={22}
                          className={
                            accountType === item.type
                              ? "text-teal-400"
                              : "text-slate-400"
                          }
                        />
                        <div>
                          <span className="text-sm font-bold block leading-none mb-1">
                            {item.type}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder={
                          accountType === "Business"
                            ? "Company Representative"
                            : "John Doe"
                        }
                        required
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 pl-12 focus:bg-white focus:border-navy-900 outline-none transition-all text-sm font-bold placeholder:text-slate-300 shadow-sm"
                      />
                      <User
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy-900 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 pl-12 focus:bg-white focus:border-navy-900 outline-none transition-all text-sm font-bold placeholder:text-slate-300 shadow-sm"
                    />
                    <Mail
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Password
                    </label>
                    {mode === "login" && (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
                        Secure Login
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 pl-12 focus:bg-white focus:border-navy-900 outline-none transition-all text-sm font-bold placeholder:text-slate-300 shadow-sm"
                    />
                    <Lock
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-navy-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-navy-900 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight ml-1">
                      Signup creates your FlowX account session.
                    </p>
                  )}
                </div>
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-4 py-2">
                  <input
                    type="checkbox"
                    required
                    className="mt-1.5 w-4 h-4 rounded-lg border-2 border-slate-200 text-navy-900 focus:ring-navy-900 transition-all cursor-pointer"
                  />
                  <label className="text-xs text-slate-500 leading-relaxed font-bold">
                    I agree to the{" "}
                    <span className="text-navy-900 underline underline-offset-2">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-navy-900 underline underline-offset-2">
                      Privacy Policy
                    </span>
                    .
                  </label>
                </div>
              )}

              {(formError || error) && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                  {formError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-navy-900 text-white rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-xs hover:bg-navy-800 transition-all shadow-elevated active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Create Secure Account"
                    : "Authenticate Access"}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <div className="text-center pt-4">
                <p className="text-xs font-bold text-slate-400">
                  {mode === "signup" ? "Already using FlowX?" : "New to FlowX?"}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(mode === "signup" ? "/login" : "/signup")
                    }
                    className="text-teal-600 font-bold ml-2 hover:underline underline-offset-4"
                  >
                    {mode === "signup" ? "Login here" : "Register now"}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

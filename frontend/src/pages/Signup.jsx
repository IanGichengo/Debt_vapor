// src/pages/Signup.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from '../context/ThemeContext';
import { handleGoogleAuth, resendVerificationEmail } from "../services/authService";
import { GoogleLogin } from '@react-oauth/google';
import { isDisposableEmail } from "../utils/disposableEmailDomains";
import {
  User, Mail, Eye, EyeOff, AlertCircle, Shield,
  Brain, MessageSquare, CreditCard, BarChart3, Loader2, MailCheck
} from "lucide-react";

// ── Post-signup inbox confirmation screen ─────────────────────────────────────
function CheckInboxScreen({ email, dark }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError,   setResendError]   = useState(null);

  const handleResend = async () => {
    if (resendLoading || resendSuccess) return;
    setResendLoading(true);
    setResendError(null);
    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (err) {
      setResendError(err.message || "Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-10 flex flex-col items-center text-center gap-6">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${dark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
        <MailCheck className={`w-10 h-10 ${dark ? "text-cyan-400" : "text-cyan-600"}`} />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold">Check your inbox</h2>
        <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
          We sent a verification link to
        </p>
        <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{email}</p>
      </div>

      <p className={`text-xs max-w-xs leading-relaxed ${dark ? "text-slate-500" : "text-slate-400"}`}>
        Click the link in that email to activate your account. Check your spam folder if you don't see it within a minute.
      </p>

      <div className="flex flex-col items-center gap-2">
        {resendSuccess ? (
          <p className="text-xs text-emerald-400 font-semibold">New verification link sent!</p>
        ) : (
          <>
            <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>Didn't receive it?</p>
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className={`text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50
                ${dark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-500"}`}
            >
              {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Resend verification email
            </button>
          </>
        )}
        {resendError && <p className="text-xs text-rose-500">{resendError}</p>}
      </div>

      <Link
        to="/login"
        className={`text-sm font-semibold transition-colors mt-2
          ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
      >
        ← Back to login
      </Link>
    </div>
  );
}

// ── Main Signup page ──────────────────────────────────────────────────────────
export default function Signup() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const { signup, setIsAuthenticated, setUser } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors,          setErrors]          = useState({});
  const [generalError,    setGeneralError]    = useState(null);
  const [agreeTerms,      setAgreeTerms]      = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signupSuccess,   setSignupSuccess]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const validateAll = () => {
    const e = {};
    if (!name.trim()) {
      e.name = "Full name is required";
    }
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Invalid email address";
    } else if (isDisposableEmail(email)) {
      e.email = "Disposable email addresses are not allowed. Please use a work or personal email.";
    }
    if (password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    if (!agreeTerms) return setGeneralError("Please agree to the Terms and Privacy Policy first.");
    if (!validateAll()) return;

    setLoading(true);
    try {
      await signup({ name, email, password });
      setSignupSuccess(true);
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const platformFeatures = [
    { icon: Brain,         title: "AI Analysis",  desc: "Gemini AI intent classification.",   accent: dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600" },
    { icon: MessageSquare, title: "Automation",   desc: "Automated WhatsApp loop.",           accent: dark ? "bg-green-500/10 text-green-400"  : "bg-green-50 text-green-600" },
    { icon: CreditCard,    title: "M-Pesa STK",   desc: "Instant phone prompts.",             accent: dark ? "bg-cyan-500/10 text-cyan-400"    : "bg-cyan-50 text-cyan-600" },
    { icon: BarChart3,     title: "Real-Time",    desc: "Live debt tracking dashboard.",      accent: dark ? "bg-blue-500/10 text-blue-400"    : "bg-blue-50 text-blue-600" }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .text-gradient { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
      `}</style>

      <div className={`font-body min-h-screen relative flex items-center justify-center pt-24 pb-12 px-6 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left panel */}
          <div className="hidden lg:block">
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease-out" }}
              className="space-y-8"
            >
              <h1 className="font-display text-5xl font-extrabold leading-[1.05]">
                Automate your<br /><span className="text-gradient">collection workflow</span>
              </h1>
              <div className="space-y-4">
                {platformFeatures.map((feature, i) => (
                  <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${dark ? "bg-[#0f1929]/50 border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${feature.accent}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{feature.title}</h3>
                      <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease-out 0.2s" }}
            className={`backdrop-blur-xl rounded-3xl border overflow-hidden ${dark ? "bg-[#0f1929]/80 border-white/[0.06] shadow-2xl" : "bg-white/80 border-gray-100 shadow-xl"}`}
          >
            {signupSuccess ? (
              <CheckInboxScreen email={email} dark={dark} />
            ) : (
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 border ${dark ? "bg-[#0a1120] border-white/10" : "bg-slate-50 border-gray-200"}`}>
                    <Shield className={`w-6 h-6 ${dark ? "text-cyan-400" : "text-cyan-600"}`} />
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-2">Create Account</h2>
                </div>

                {generalError && (
                  <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><p>{generalError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text" placeholder="Full Name" value={name}
                        onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500
                          ${errors.name ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                          ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-rose-500 pl-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email" placeholder="Work Email" value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500
                          ${errors.email ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                          ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 pl-1">{errors.email}</p>}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                          onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                          className={`w-full pl-4 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500
                            ${errors.password ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                            ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-rose-500 pl-1">{errors.password}</p>}
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"} placeholder="Confirm" value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                          className={`w-full pl-4 pr-10 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-1 focus:ring-cyan-500
                            ${errors.confirmPassword ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                            ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-rose-500 pl-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer mt-2">
                    <input
                      type="checkbox" checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-cyan-500"
                    />
                    <span className="text-xs text-slate-500 leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms"   className={`underline underline-offset-2 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>Terms</Link>
                      {" "}and{" "}
                      <Link to="/privacy" className={`underline underline-offset-2 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>Privacy Policy</Link>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || isGoogleLoading || !agreeTerms}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  </button>
                </form>

                <div className="relative flex py-8 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Or Continue With</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={async (res) => {
                      setIsGoogleLoading(true);
                      try {
                        const data = await handleGoogleAuth({ token: res.credential });
                        if (setUser) setUser(data.user);
                        if (setIsAuthenticated) setIsAuthenticated(true);
                        navigate("/dashboard");
                      } catch (err) {
                        setGeneralError(err.message);
                      } finally {
                        setIsGoogleLoading(false);
                      }
                    }}
                    onError={() => setGeneralError("Google Registration Failed")}
                    theme={dark ? "filled_black" : "outline"}
                    width="100%"
                  />
                </div>

                <p className={`text-center text-xs mt-6 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  Already have an account?{" "}
                  <Link to="/login" className={`font-semibold ${dark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-500"} transition-colors`}>
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

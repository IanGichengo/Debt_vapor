// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from '../context/ThemeContext';
import { handleGoogleAuth } from "../services/authService";
import { resendVerificationEmail } from "../services/authService";
import { GoogleLogin } from '@react-oauth/google';
import {
  Lock, Mail, Eye, EyeOff, AlertCircle, MailCheck,
  Brain, MessageSquare, CreditCard, BarChart3, Loader2
} from "lucide-react";

export default function Login() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, setIsAuthenticated, setUser } = useAuthContext();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Set when the backend returns EMAIL_NOT_VERIFIED
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading]     = useState(false);
  const [resendSuccess, setResendSuccess]     = useState(false);

  // ?verified=true → came back from the email link
  const justVerified = searchParams.get("verified") === "true";

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    if (fieldName === "email") {
      if (!value.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Invalid email address";
      else delete newErrors.email;
    }
    if (fieldName === "password") {
      if (!value) newErrors.password = "Password is required";
      else delete newErrors.password;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setUnverifiedEmail(null);
    setResendSuccess(false);
    if (!validateField("email", email) || !validateField("password", password)) return;

    setLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      // Backend returns code: "EMAIL_NOT_VERIFIED" for unverified accounts
      if (err.code === "EMAIL_NOT_VERIFIED" || err.message?.includes("verify your email")) {
        setUnverifiedEmail(email);
      } else {
        setGeneralError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendSuccess(true);
    } catch {
      setGeneralError("Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const platformFeatures = [
    { icon: Brain,        title: "AI Analysis",  desc: "Gemini AI intent classification.",    accent: dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600" },
    { icon: MessageSquare,title: "Automation",   desc: "WhatsApp outbound reminders.",        accent: dark ? "bg-green-500/10 text-green-400"  : "bg-green-50 text-green-600" },
    { icon: CreditCard,   title: "M-Pesa STK",   desc: "Instant phone payment prompts.",      accent: dark ? "bg-cyan-500/10 text-cyan-400"    : "bg-cyan-50 text-cyan-600" },
    { icon: BarChart3,    title: "Live Insights", desc: "Real-time debt tracking.",            accent: dark ? "bg-blue-500/10 text-blue-400"    : "bg-blue-50 text-blue-600" }
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
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease-out" }} className="space-y-8">
              <h1 className="font-display text-5xl font-extrabold leading-[1.05]">
                Welcome back to your<br /><span className="text-gradient">automated workflow</span>
              </h1>
              <div className="space-y-4">
                {platformFeatures.map((feature, i) => (
                  <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${dark ? "bg-[#0f1929]/50 border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${feature.accent}`}><feature.icon className="w-6 h-6" /></div>
                    <div><h3 className="font-display font-bold text-lg">{feature.title}</h3><p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{feature.desc}</p></div>
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
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 border ${dark ? "bg-[#0a1120] border-white/10" : "bg-slate-50 border-gray-200"}`}>
                  <Lock className={`w-6 h-6 ${dark ? "text-cyan-400" : "text-cyan-600"}`} />
                </div>
                <h2 className="font-display text-3xl font-bold mb-2">Secure Login</h2>
              </div>

              {/* ── Email verified success banner ── */}
              {justVerified && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
                  <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium">Email verified! You can now sign in to your account.</p>
                </div>
              )}

              {/* ── General error ── */}
              {generalError && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" /><p className="font-medium">{generalError}</p>
                </div>
              )}

              {/* ── Unverified email nudge ── */}
              {unverifiedEmail && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm space-y-2">
                  <div className="flex items-start gap-3">
                    <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>Your email <span className="font-semibold">{unverifiedEmail}</span> hasn't been verified yet. Check your inbox or</p>
                  </div>
                  {resendSuccess ? (
                    <p className="pl-8 text-emerald-400 font-medium">New verification link sent!</p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="pl-8 text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      resend the verification email
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email" placeholder="you@company.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); validateField("email", e.target.value); }}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all
                        ${errors.email ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                        ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 pl-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Password</label>
                    <Link to="/forgot-password" className={`text-xs ${dark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-500"} transition-colors`}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                      onChange={(e) => { setPassword(e.target.value); validateField("password", e.target.value); }}
                      className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all
                        ${errors.password ? "border-rose-500/60" : dark ? "border-white/10" : "border-gray-200"}
                        ${dark ? "bg-[#0a1120]/50 text-white" : "bg-slate-50"}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-500 pl-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Dashboard"}
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
                    } catch (err) { setGeneralError(err.message); }
                    finally { setIsGoogleLoading(false); }
                  }}
                  onError={() => setGeneralError("Google Auth Failed")}
                  theme={dark ? "filled_black" : "outline"}
                  width="100%"
                />
              </div>

              <p className={`mt-8 text-center text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Don't have an account?{" "}
                <Link to="/signup" className={`font-bold hover:underline ${dark ? "text-cyan-400" : "text-cyan-600"}`}>Create account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

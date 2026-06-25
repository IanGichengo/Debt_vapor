import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, MessageSquare, CreditCard, BarChart3,
  RefreshCw, Shield, Users, FileText, Zap,
  CheckCircle, ArrowRight, ChevronRight, Lock,
  Bell, Database, Smartphone
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

// ── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.65s cubic-bezier(.22,1,.36,1), opacity 0.65s ease",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, benefits, accent, delay, dark, tag }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.6s ease",
      }}
      className={`group relative rounded-2xl p-8 border overflow-hidden transition-all duration-500 ${
        dark
          ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/30 hover:shadow-[0_0_48px_rgba(6,182,212,0.07)]"
          : "bg-white border-gray-100 hover:border-cyan-200 hover:shadow-[0_8px_48px_rgba(6,182,212,0.1)] shadow-sm"
      }`}
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Tag */}
      {tag && (
        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-4 border ${
          dark ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-cyan-50 border-cyan-100 text-cyan-600"
        }`}>{tag}</span>
      )}

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${accent}`}>
        <Icon className="w-7 h-7" />
      </div>

      <h3 className={`font-display font-bold text-xl mb-3 ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
      <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>

      <ul className="space-y-2.5">
        {benefits.map((b, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
            <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Features() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Conversation Analysis",
      tag: "Core AI",
      description: "Gemini AI reads every debtor reply in real-time, classifying payment intent, emotional tone, urgency, and dispute signals before responding automatically.",
      benefits: [
        "Payment intent detection (full, partial, plan)",
        "Emotional tone analysis (cooperative, hostile, distressed)",
        "Dispute & hardship identification",
        "Confidence scoring on every interaction",
      ],
      accent: dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Automation",
      tag: "Communication",
      description: "Two-way WhatsApp messaging that handles the full debtor conversation loop from outbound reminders to inbound replies without any manual intervention.",
      benefits: [
        "Automated outbound reminder messages",
        "Inbound reply processing & AI response",
        "Context-aware message threading",
        "Fallback to manual escalation when needed",
      ],
      accent: dark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600",
    },
    {
      icon: CreditCard,
      title: "M-Pesa STK Push",
      tag: "Payments",
      description: "When a debtor signals readiness to pay, an M-Pesa STK push fires automatically to their phone. No redirects, no links just a PIN prompt.",
      benefits: [
        "Automatic STK push on payment intent",
        "Paybill & till number support",
        "Transaction logging & reconciliation",
        "Fallback manual payment instructions",
      ],
      accent: dark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600",
    },
    {
      icon: RefreshCw,
      title: "Automated Reminders",
      tag: "Automation",
      description: "A configurable reminder scheduler runs per debtor: set the frequency, maximum attempts, and channel. The system handles execution and tracks every outcome.",
      benefits: [
        "Per-debtor interval configuration (3, 7, 14, 30 days)",
        "Maximum reminder limits to prevent harassment",
        "Duplicate send protection built-in",
        "Hourly scheduler with timezone support",
      ],
      accent: dark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600",
    },
    {
      icon: BarChart3,
      title: "Real-Time Dashboard",
      tag: "Analytics",
      description: "A live overview of collection performance, debt totals, payment progress, debtor statuses, and AI interaction outcomes all in one place.",
      benefits: [
        "Live debt & payment tracking",
        "Debtor status overview (active, settled, overdue)",
        "AI interaction logs per debtor",
        "Bulk summary and trend views",
      ],
      accent: dark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600",
    },
    {
      icon: Users,
      title: "Debtor Management",
      tag: "CRM",
      description: "Rich debtor profiles with full debt history, payment plans, WhatsApp chat logs, and reminder settings all linked and accessible from one view.",
      benefits: [
        "Unified debtor profile with full history",
        "Debt assignment and status tracking",
        "WhatsApp chat log per debtor",
        "Creditor details (person or company)",
      ],
      accent: dark ? "bg-pink-500/10 text-pink-400" : "bg-pink-50 text-pink-600",
    },
    {
      icon: FileText,
      title: "Payment Plans",
      tag: "Payments",
      description: "AI generates custom payment plans based on the debtor's proposed amount, frequency, and financial signals then schedules automated reminders for each installment.",
      benefits: [
        "AI-generated installment plans",
        "Configurable frequency (weekly, monthly)",
        "Automated installment reminders",
        "Plan status tracking (active, completed, cancelled)",
      ],
      accent: dark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-600",
    },
    {
      icon: Shield,
      title: "Security & Access Control",
      tag: "Security",
      description: "JWT-based authentication with role-based access ensures that Admins and Collectors only see and do what they're permitted to.",
      benefits: [
        "JWT authentication with refresh",
        "Role-based access (Admin / Collector)",
        "Password reset with secure tokens",
        "Request validation on all endpoints",
      ],
      accent: dark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600",
    },
    {
      icon: Bell,
      title: "Notification System",
      tag: "Alerts",
      description: "In-app notifications keep your team informed of key events: payments received, AI interactions, reminder outcomes, and system alerts.",
      benefits: [
        "Payment confirmation notifications",
        "AI interaction summaries",
        "Reminder delivery status alerts",
        "Read / unread tracking per user",
      ],
      accent: dark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600",
    },
  ];

  const stats = [
    { value: "< 2s", label: "STK Push delivery" },
    { value: "24/7", label: "AI always on" },
    { value: "100%", label: "M-Pesa native" },
    { value: "0",    label: "Manual replies needed" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .text-gradient       { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .text-gradient-light { background: linear-gradient(135deg,#0891b2 0%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .glow-cyan { box-shadow: 0 0 40px rgba(6,182,212,0.2); }
        .glow-cyan:hover { box-shadow: 0 0 60px rgba(6,182,212,0.3); }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Ambient glows */}
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-32 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
          {!dark && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }}
            />
          )}

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            {/* Badge */}
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
                dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"
              }`}
            >
              <span className="pulse-dot relative flex h-2 w-2">
                <span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} />
              </span>
              Platform Capabilities
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Built to collect,{" "}
              <span className={`block ${dark ? "text-gradient" : "text-gradient-light"}`}>not just remind.</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Debt Vapor goes beyond sending reminders. Every feature is designed to complete the loop from first message to M-Pesa confirmation automatically.
            </p>

            {/* Stats row */}
            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.55s" }}
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto`}
            >
              {stats.map(({ value, label }) => (
                <div key={label} className={`rounded-2xl p-4 border text-center ${
                  dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"
                }`}>
                  <p className={`font-display font-extrabold text-2xl ${dark ? "text-gradient" : "text-gradient-light"}`}>{value}</p>
                  <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 60} dark={dark} />
            ))}
          </div>
        </section>

        {/* ── HOW IT ALL CONNECTS ── */}
        <section className={`py-24 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">The Full Loop</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                Every feature works{" "}
                <span className={dark ? "text-gradient" : "text-gradient-light"}>together</span>
              </h2>
              <p className={`mt-4 max-w-xl mx-auto text-base leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Debt Vapor isn't a set of disconnected tools. Each component feeds the next: AI reads the reply, triggers the STK push, logs the transaction, and updates the debtor profile automatically.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: MessageSquare, color: "text-green-400", bg: dark ? "bg-green-500/10" : "bg-green-50 text-green-600", title: "Message Received", body: "Debtor replies to your WhatsApp reminder. The webhook receives the message and passes it to the AI engine instantly." },
                { icon: Brain,         color: "text-violet-400", bg: dark ? "bg-violet-500/10" : "bg-violet-50 text-violet-600", title: "AI Analyses & Responds", body: "Gemini classifies intent, crafts an appropriate response, and decides the next action: payment push, plan creation, or escalation." },
                { icon: CreditCard,    color: "text-cyan-400",   bg: dark ? "bg-cyan-500/10" : "bg-cyan-50 text-cyan-600",   title: "Payment Triggered", body: "If the debtor is ready to pay, an M-Pesa STK push fires automatically. The transaction is logged and the debt balance updated." },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={i * 120}>
                  <div className={`relative rounded-2xl p-7 border h-full ${
                    dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-slate-50 border-gray-100"
                  }`}>
                    {i < 2 && (
                      <div className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center z-10 ${
                        dark ? "bg-[#0a1120] border border-white/10" : "bg-white border border-gray-200"
                      }`}>
                        <ArrowRight className="w-3 h-3 text-cyan-500" />
                      </div>
                    )}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${item.bg}`}>
                      <item.icon className={`w-5 h-5 ${dark ? item.color : ""}`} />
                    </div>
                    <h3 className={`font-display font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                    <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{item.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-4xl mx-auto px-6 py-28">
          <FadeUp>
            <div className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${
              dark
                ? "border border-transparent bg-[#0f1929]"
                : "bg-white shadow-xl border border-gray-100"
            }`}
              style={dark ? { background: "linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.25),rgba(167,139,250,0.25)) border-box", border: "1px solid transparent" } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />
              <div className="relative z-10">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 border ${
                  dark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
                }`}>
                  Early Access Open
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Ready to automate your<br />
                  <span className={dark ? "text-gradient" : "text-gradient-light"}>collection workflow?</span>
                </h2>
                <p className={`max-w-xl mx-auto mb-8 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Debt Vapor is in active development. Request early access and be among the first teams to run AI-powered, M-Pesa-native debt collection.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { navigate('/signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan"
                  >
                    Request Early Access <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium rounded-xl transition-all duration-300 ${
                      dark
                        ? "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Talk to the Team
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

        <Footer />
      </div>
    </>
  );
}

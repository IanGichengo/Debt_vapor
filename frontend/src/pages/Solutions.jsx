import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, ArrowRight, Building2, Landmark,
  Users, ShoppingBag, Home, Wallet,
  Brain, MessageSquare, CreditCard, RefreshCw,
  Shield, BarChart3, Zap
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

// ── Solution card ─────────────────────────────────────────────────────────────
function SolutionCard({ icon: Icon, title, description, features, accent, iconBg, tag, delay, dark }) {
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
      className={`group relative rounded-2xl p-8 border overflow-hidden transition-all duration-500 h-full ${
        dark
          ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/30 hover:shadow-[0_0_48px_rgba(6,182,212,0.07)]"
          : "bg-white border-gray-100 hover:border-cyan-200 hover:shadow-[0_8px_48px_rgba(6,182,212,0.1)] shadow-sm"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {tag && (
        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-5 border ${
          dark ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-cyan-50 border-cyan-100 text-cyan-600"
        }`}>{tag}</span>
      )}

      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconBg}`}>
        <Icon className={`w-7 h-7 ${accent}`} />
      </div>

      <h3 className={`font-display font-bold text-xl mb-3 ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
      <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>

      <ul className="space-y-2.5 mb-8">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
            <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />{f}
          </li>
        ))}
      </ul>

      <button
        className={`mt-auto inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group/btn ${
          dark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"
        }`}
        onClick={() => {}}
      >
        Learn more
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Solutions() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const solutions = [
    {
      icon: Landmark,
      title: "Microfinance & SACCOs",
      tag: "Most Common",
      description: "Kenya's MFIs and SACCOs deal with high volumes of small loans and frequent defaults. Debt Vapor automates the entire follow-up chain from first WhatsApp nudge to M-Pesa STK push.",
      features: [
        "Automated loan repayment reminders via WhatsApp",
        "M-Pesa STK push on confirmed payment intent",
        "AI detects hardship signals and proposes flexible plans",
        "Per-member debt profiles with full payment history",
        "Bulk reminders for end-of-cycle collections",
      ],
      accent: "text-cyan-400",
      iconBg: dark ? "bg-cyan-500/10" : "bg-cyan-50",
    },
    {
      icon: Building2,
      title: "Banks & Lenders",
      tag: "High Volume",
      description: "For banks and digital lenders managing hundreds of non-performing loans, Debt Vapor replaces manual call centres with an AI-powered WhatsApp agent that works 24/7.",
      features: [
        "AI-powered triage: dispute, hardship, or payment-ready",
        "Automatic STK push for ready borrowers",
        "Collector dashboard with AI interaction logs",
        "Role-based access for collectors and admins",
        "Audit trail on every debtor interaction",
      ],
      accent: "text-violet-400",
      iconBg: dark ? "bg-violet-500/10" : "bg-violet-50",
    },
    {
      icon: ShoppingBag,
      title: "SME Invoice Recovery",
      tag: "Growing Segment",
      description: "Small businesses in Kenya lose significant revenue to unpaid invoices. Debt Vapor gives them an automated collections assistant that follows up professionally without awkward phone calls.",
      features: [
        "WhatsApp invoice reminders with payment details",
        "M-Pesa Paybill & Till Number in every message",
        "Automatic escalation if no response after N days",
        "Payment plan negotiation handled by AI",
        "Simple debtor onboarding - name, phone, amount",
      ],
      accent: "text-green-400",
      iconBg: dark ? "bg-green-500/10" : "bg-green-50",
    },
    {
      icon: Home,
      title: "Landlords & Property Managers",
      tag: "Rent Recovery",
      description: "Chasing rent arrears is time-consuming and awkward. Debt Vapor handles the monthly reminder cycle automatically, escalates when tenants go silent, and accepts M-Pesa directly.",
      features: [
        "Monthly automated rent reminder on due date",
        "AI identifies and responds to tenant excuses intelligently",
        "STK push for tenants who agree to pay",
        "Track arrears per unit across multiple properties",
        "Configurable grace period before escalation",
      ],
      accent: "text-orange-400",
      iconBg: dark ? "bg-orange-500/10" : "bg-orange-50",
    },
    {
      icon: Wallet,
      title: "Hire Purchase & Asset Finance",
      tag: "Instalment Recovery",
      description: "Asset finance companies: electronics, vehicles, and appliances need consistent instalment follow-up. Debt Vapor tracks each payment plan and chases each instalment automatically.",
      features: [
        "Per-customer instalment schedule tracking",
        "Reminder fires on each due date automatically",
        "AI-generated payment plans for restructuring requests",
        "STK push on the exact instalment amount",
        "Repossession escalation flagging for admins",
      ],
      accent: "text-blue-400",
      iconBg: dark ? "bg-blue-500/10" : "bg-blue-50",
    },
    {
      icon: Users,
      title: "Chamas & Investment Groups",
      tag: "Community Finance",
      description: "Chamas and investment clubs need a discreet, professional way to follow up on member contributions. Debt Vapor keeps it automated and non-confrontational.",
      features: [
        "Monthly contribution reminders per member",
        "M-Pesa confirmation tracking per cycle",
        "AI handles member queries about balances",
        "Private — no group broadcast, one-on-one messages",
        "Simple setup with no technical expertise needed",
      ],
      accent: "text-pink-400",
      iconBg: dark ? "bg-pink-500/10" : "bg-pink-50",
    },
  ];

  const coreCapabilities = [
    { icon: MessageSquare, title: "WhatsApp-First",    body: "Every communication goes through WhatsApp where Kenyans already are. No apps to download, no portals to log into.",              accent: dark ? "text-green-400 bg-green-500/10" : "text-green-600 bg-green-50" },
    { icon: Brain,         title: "AI at the Core",    body: "Gemini AI reads every reply, classifies intent, and responds so your team isn't spending hours on manual follow-ups.",            accent: dark ? "text-violet-400 bg-violet-500/10" : "text-violet-600 bg-violet-50" },
    { icon: CreditCard,    title: "M-Pesa Native",     body: "STK push fires the moment a debtor signals they're ready to pay. No links, no redirects just a PIN prompt on their phone.",      accent: dark ? "text-cyan-400 bg-cyan-500/10" : "text-cyan-600 bg-cyan-50" },
    { icon: RefreshCw,     title: "Set & Forget",      body: "Configure reminder schedules once per debtor. The system handles timing, frequency, and follow-through without daily oversight.",    accent: dark ? "text-orange-400 bg-orange-500/10" : "text-orange-600 bg-orange-50" },
    { icon: Shield,        title: "Secure & Private",  body: "Role-based access, JWT auth, and encrypted pipelines. Debtor data is never shared or used outside your account.",                   accent: dark ? "text-rose-400 bg-rose-500/10" : "text-rose-600 bg-rose-50" },
    { icon: BarChart3,     title: "Full Visibility",   body: "See every debt, every payment, every AI interaction in real time. Know exactly where each debtor is in the collection process.",     accent: dark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-50" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .text-gradient       { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .text-gradient-light { background: linear-gradient(135deg,#0891b2 0%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .glow-cyan       { box-shadow: 0 0 40px rgba(6,182,212,0.2); }
        .glow-cyan:hover { box-shadow: 0 0 60px rgba(6,182,212,0.35); }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-32 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
          {!dark && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }}
            />
          )}

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
                dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"
              }`}
            >
              <span className="pulse-dot relative flex h-2 w-2">
                <span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} />
              </span>
              Built for Kenyan Use Cases
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              One platform,{" "}
              <span className={`block ${dark ? "text-gradient" : "text-gradient-light"}`}>every sector.</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Whether you're a SACCO, bank, landlord, or SME if you have outstanding debts and a WhatsApp number, Debt Vapor works for you.
            </p>
          </div>
        </section>

        {/* ── SOLUTIONS GRID ── */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <SolutionCard key={s.title} {...s} delay={i * 70} dark={dark} />
            ))}
          </div>
        </section>

        {/* ── CORE CAPABILITIES ── */}
        <section className={`py-24 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Under the Hood</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                The same powerful engine{" "}
                <span className={dark ? "text-gradient" : "text-gradient-light"}>across every solution</span>
              </h2>
              <p className={`mt-4 max-w-xl mx-auto text-base leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Regardless of your industry or use case, every Debt Vapor deployment runs on the same AI, WhatsApp, and M-Pesa core.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreCapabilities.map((cap, i) => (
                <FadeUp key={cap.title} delay={i * 80}>
                  <div className={`rounded-2xl p-6 border h-full transition-all duration-300 ${
                    dark
                      ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/20"
                      : "bg-slate-50 border-gray-100 hover:border-cyan-200 hover:bg-white hover:shadow-md"
                  }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${cap.accent.split(' ')[1]}`}>
                      <cap.icon className={`w-5 h-5 ${cap.accent.split(' ')[0]}`} />
                    </div>
                    <h3 className={`font-display font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>{cap.title}</h3>
                    <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{cap.body}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── USE CASE CALLOUT ── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <FadeUp>
            <div className={`rounded-3xl overflow-hidden border ${
              dark ? "border-white/[0.06] bg-[#0f1929]" : "border-gray-100 bg-white shadow-sm"
            }`}>
              <div className="grid lg:grid-cols-2">
                {/* Left */}
                <div className="p-10 md:p-14">
                  <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-4">Real Scenario</p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    How a SACCO uses DCS to{" "}
                    <span className={dark ? "text-gradient" : "text-gradient-light"}>recover loan arrears</span>
                  </h2>
                  <div className="space-y-5">
                    {[
                      { step: "01", text: "Member misses monthly repayment. Debt Vapor scheduler fires a WhatsApp reminder the same day." },
                      { step: "02", text: "Member replies \"nitakulipa kesho\" — AI detects payment intent, responds with STK push the next day." },
                      { step: "03", text: "Member ignores follow-ups for 7 days. AI detects silence and escalates to collector dashboard." },
                      { step: "04", text: "Member replies with hardship signal. AI proposes a restructured payment plan automatically." },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-4">
                        <span className={`font-display font-extrabold text-3xl leading-none shrink-0 ${dark ? "text-white/10" : "text-slate-100"}`}>{step}</span>
                        <p className={`text-sm leading-relaxed pt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — decorative panel */}
                <div className={`relative p-10 md:p-14 flex flex-col justify-center ${
                  dark ? "bg-[#0a1120] border-l border-white/[0.06]" : "bg-slate-50 border-l border-gray-100"
                }`}>
                  <div className="space-y-4">
                    {[
                      { label: "Messages handled by AI",  value: "100%",    sub: "zero manual replies needed"   },
                      { label: "STK push response rate",  value: "~68%",    sub: "based on pilot testing"       },
                      { label: "Time to first reminder",  value: "< 1 min", sub: "from due date to WhatsApp"   },
                      { label: "Collector time saved",    value: "~80%",    sub: "vs. manual phone follow-ups" },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className={`rounded-xl p-5 border ${
                        dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"
                      }`}>
                        <p className={`font-display font-extrabold text-2xl ${dark ? "text-gradient" : "text-gradient-light"}`}>{value}</p>
                        <p className={`text-sm font-medium mt-0.5 ${dark ? "text-white" : "text-slate-900"}`}>{label}</p>
                        <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* ── CTA ── */}
        <section className={`py-20 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FadeUp>
              <div
                className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
                style={dark
                  ? { background: "linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.25),rgba(167,139,250,0.25)) border-box", border: "1px solid transparent" }
                  : { background: "#f8faff", border: "1px solid transparent", backgroundClip: "padding-box", boxShadow: "0 8px 40px rgba(6,182,212,0.08)", borderImage: "linear-gradient(135deg,rgba(6,182,212,0.3),rgba(124,58,237,0.3)) 1" }
                }
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />
                <div className="relative z-10">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 border ${
                    dark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
                  }`}>
                    Don't see your use case?
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    We'll build it{" "}
                    <span className={dark ? "text-gradient" : "text-gradient-light"}>with you.</span>
                  </h2>
                  <p className={`max-w-lg mx-auto mb-8 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Debt Vapor is in active development. If you have a specific collection workflow in mind tell us. We're working closely with early users to shape the roadmap.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan"
                    >
                      Tell Us Your Use Case <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { navigate('/signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium rounded-xl transition-all duration-300 ${
                        dark
                          ? "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Request Early Access
                    </button>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

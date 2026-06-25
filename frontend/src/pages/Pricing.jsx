import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, ArrowRight, HelpCircle,
  Brain, MessageSquare, CreditCard, BarChart3,
  RefreshCw, Shield, Bell, Users, Zap
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

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ question, answer, dark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
      dark
        ? open ? "border-cyan-500/20 bg-[#0f1929]" : "border-white/[0.06] bg-[#0f1929]"
        : open ? "border-cyan-200 bg-white shadow-md" : "border-gray-100 bg-white shadow-sm"
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <span className={`font-display font-semibold text-sm md:text-base ${dark ? "text-white" : "text-slate-900"}`}>
          {question}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
          open
            ? dark ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-600"
            : dark ? "border-white/10 text-slate-500" : "border-gray-200 text-gray-400"
        }`}>
          <span className="text-lg leading-none font-light">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && (
        <div className={`px-6 pb-6 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Pricing() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const plans = [
    {
      name: "Starter",
      tagline: "For individual collectors",
      monthly: 1200,
      annual: 12000,
      annualMonthly: 1000,
      highlight: false,
      features: [
        { text: "Up to 25 debtors",             included: true  },
        { text: "WhatsApp reminders",           included: true  },
        { text: "M-Pesa STK Push",              included: true  },
        { text: "Basic dashboard",              included: true  },
        { text: "1 team member",                included: true  },
        { text: "Automated reminder scheduler", included: true  },
        { text: "AI conversation analysis",     included: false },
        { text: "Payment plan automation",      included: false },
        { text: "Advanced analytics",           included: false },
        { text: "Priority support",             included: false },
      ],
      cta: "Get Started",
      accent: dark ? "border-white/[0.08]" : "border-gray-200",
    },
    {
      name: "Growth",
      tagline: "For small teams",
      monthly: 3500,
      annual: 35000,
      annualMonthly: 2916,
      highlight: true,
      features: [
        { text: "Up to 100 debtors",            included: true },
        { text: "WhatsApp reminders",           included: true },
        { text: "M-Pesa STK Push",              included: true },
        { text: "Advanced dashboard",           included: true },
        { text: "3 team members",               included: true },
        { text: "Automated reminder scheduler", included: true },
        { text: "AI conversation analysis",     included: false },
        { text: "Payment plan automation",      included: false },
        { text: "Advanced analytics",           included: false },
        { text: "Standard support",             included: true },
      ],
      cta: "Start Free Trial",
      accent: "border-cyan-500/40",
    },
    {
      name: "Pro",
      tagline: "For growing agencies",
      monthly: 5500,
      annual: 55000,
      annualMonthly: 4583,
      highlight: false,
      features: [
        { text: "Up to 250 debtors",            included: true },
        { text: "WhatsApp reminders",           included: true },
        { text: "M-Pesa STK Push",              included: true },
        { text: "Advanced dashboard",           included: true },
        { text: "10 team members",              included: true },
        { text: "Automated reminder scheduler", included: true },
        { text: "AI conversation analysis",     included: true },
        { text: "Payment plan automation",      included: true },
        { text: "Advanced analytics",           included: true },
        { text: "Priority support",             included: true },
      ],
      cta: "Upgrade to Pro",
      accent: dark ? "border-white/[0.08]" : "border-gray-200",
    },
    {
      name: "Enterprise",
      tagline: "For large agencies & institutions",
      monthly: null,
      annual: null,
      highlight: false,
      features: [
        { text: "More than 250 debtors",        included: true },
        { text: "WhatsApp reminders",           included: true },
        { text: "M-Pesa STK Push",              included: true },
        { text: "Custom dashboard",             included: true },
        { text: "Unlimited team members",       included: true },
        { text: "Automated reminder scheduler", included: true },
        { text: "AI conversation analysis",     included: true },
        { text: "Payment plan automation",      included: true },
        { text: "Advanced analytics",           included: true },
        { text: "Dedicated account manager",    included: true },
      ],
      cta: "Talk to Us",
      accent: dark ? "border-violet-500/30" : "border-violet-200",
    },
  ];

  const comparison = [
    {
      category: "Communication",
      rows: [
        { feature: "WhatsApp outbound reminders",      starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "WhatsApp inbound reply processing",starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "AI-generated responses",           starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Bulk WhatsApp campaigns",          starter: false, growth: false, pro: false, enterprise: true  },
      ]
    },
    {
      category: "Payments",
      rows: [
        { feature: "M-Pesa STK Push",                  starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "Auto STK on payment intent",       starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Transaction reconciliation",       starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "Multiple Paybill accounts",        starter: false, growth: false, pro: false, enterprise: true  },
      ]
    },
    {
      category: "AI & Automation",
      rows: [
        { feature: "Automated reminder scheduler",     starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "Gemini AI analysis",               starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Payment intent classification",    starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "AI payment plan generation",       starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Custom AI tuning",                 starter: false, growth: false, pro: false, enterprise: true  },
      ]
    },
    {
      category: "Analytics & Support",
      rows: [
        { feature: "Real-time dashboard",              starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "Advanced analytics",               starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Email support",                    starter: true,  growth: true,  pro: true,  enterprise: true  },
        { feature: "Priority WhatsApp support",        starter: false, growth: false, pro: true,  enterprise: true  },
        { feature: "Dedicated account manager",        starter: false, growth: false, pro: false, enterprise: true  },
      ]
    },
  ];

  const faqs = [
    { question: "Is there a free trial?", answer: "Yes — the Growth and Pro plans come with a 14-day free trial, no credit card required. Starter is free to get started with limited debtors during the beta period." },
    { question: "How does M-Pesa billing work?", answer: "You can pay your subscription via M-Pesa Paybill or card. Monthly plans are charged at the start of each billing cycle. Annual plans get two months free." },
    { question: "What happens when I hit my debtor limit?", answer: "You'll get a notification when you're at 90% capacity. You can upgrade at any time and your data carries over instantly — no migration needed." },
    { question: "Can I add more team members?", answer: "Yes. Additional collector seats can be added to any plan at KES 500/month per extra user. Admins are counted separately." },
    { question: "Is my data stored securely in Kenya?", answer: "All data is encrypted in transit and at rest. We're working toward local data residency compliance. Sensitive debtor data is never shared with third parties." },
    { question: "Can I cancel anytime?", answer: "Absolutely. Cancel before your next billing cycle and you won't be charged. Annual plan refunds are prorated for unused months." },
  ];

  const fmt = (n) => `KES ${n?.toLocaleString()}`;

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
        .card-glow { box-shadow: 0 0 60px rgba(6,182,212,0.12), 0 0 0 1px rgba(6,182,212,0.2); }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className={`absolute top-20 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-40 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
          {!dark && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }}
            />
          )}

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
                dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"
              }`}
            >
              <span className="pulse-dot relative flex h-2 w-2">
                <span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} />
              </span>
              Simple, transparent pricing
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Pay for what<br />
              <span className={dark ? "text-gradient" : "text-gradient-light"}>you actually use.</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-lg max-w-xl mx-auto leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              All prices in Kenyan Shillings. No hidden fees, no foreign exchange risk. Pay via M-Pesa or card.
            </p>

            {/* Billing toggle */}
            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}
              className={`inline-flex items-center gap-1 p-1 rounded-xl border mb-4 ${
                dark ? "bg-white/[0.04] border-white/[0.08]" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              {["monthly", "annual"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    billing === b
                      ? dark
                        ? "bg-cyan-500 text-[#070d18]"
                        : "bg-cyan-500 text-white shadow"
                      : dark
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {b === "monthly" ? "Monthly" : "Annual"}
                  {b === "annual" && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      billing === "annual" ? "bg-white/20 text-white" : dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                    }`}>
                      −17%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mt-6">
            {plans.map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 100} className="h-full">
                <div className={`relative rounded-2xl border transition-all duration-500 h-full flex flex-col ${
                  plan.highlight
                    ? dark
                      ? "bg-[#0a1929] card-glow"
                      : "bg-white shadow-2xl shadow-cyan-500/10 border-cyan-300"
                    : dark
                      ? `bg-[#0f1929] ${plan.accent}`
                      : `bg-white shadow-sm ${plan.accent}`
                }`}>
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-violet-500 text-[#070d18] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-md whitespace-nowrap z-10">
                      Most Popular
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    {/* Plan name */}
                    <h3 className={`font-display font-bold text-xl mb-1 ${dark ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                    <p className={`text-sm mb-8 ${dark ? "text-slate-500" : "text-slate-400"}`}>{plan.tagline}</p>

                    {/* Price */}
                    <div className="mb-8 h-20">
                      {plan.monthly === null ? (
                        <div>
                          <p className={`font-display font-extrabold text-4xl ${dark ? "text-white" : "text-slate-900"}`}>Custom</p>
                          <p className={`text-sm mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Contact us for a quote</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-end gap-2">
                            <p className={`font-display font-extrabold text-4xl leading-none ${dark ? "text-white" : "text-slate-900"}`}>
                              {billing === "monthly" ? fmt(plan.monthly) : fmt(plan.annualMonthly)}
                            </p>
                            <span className={`text-sm mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>/ month</span>
                          </div>
                          {billing === "annual" && (
                            <p className={`text-xs mt-2 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>
                              Billed {fmt(plan.annual)}/year · 2 months free
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => {
                        navigate(plan.monthly === null ? "/contact" : "/signup");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-8 ${
                        plan.highlight
                          ? "bg-cyan-500 hover:bg-cyan-400 text-[#070d18] glow-cyan hover:scale-[1.02]"
                          : dark
                            ? "border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                            : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Features */}
                    <div className={`pt-8 border-t mt-auto space-y-3 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
                      {plan.features.map((f, fi) => (
                        <div key={fi} className={`flex items-start gap-2.5 text-sm ${
                          f.included
                            ? dark ? "text-slate-300" : "text-slate-600"
                            : dark ? "text-slate-600" : "text-slate-300"
                        }`}>
                          {f.included
                            ? <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                            : <XCircle className="w-4 h-4 shrink-0 opacity-30 mt-0.5" />
                          }
                          <span className="leading-tight">{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* M-Pesa note */}
          <FadeUp className="mt-8 text-center">
            <p className={`text-sm flex items-center justify-center gap-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>
              <CreditCard className="w-4 h-4 text-cyan-500" />
              Pay via M-Pesa Paybill or Visa/Mastercard · Prices exclude VAT (16%)
            </p>
          </FadeUp>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className={`py-24 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-14">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Compare Plans</p>
              <h2 className="font-display text-4xl font-bold leading-tight">
                What's included in{" "}
                <span className={dark ? "text-gradient" : "text-gradient-light"}>each plan</span>
              </h2>
            </FadeUp>

            <FadeUp>
              <div className={`rounded-2xl overflow-hidden border ${dark ? "border-white/[0.06]" : "border-gray-100 shadow-sm"}`}>
                {/* Header */}
                <div className={`grid grid-cols-5 px-6 py-4 border-b ${dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-gray-50 border-gray-100"}`}>
                  <div className={`text-sm font-semibold flex items-center ${dark ? "text-slate-400" : "text-slate-500"}`}>Feature</div>
                  {["Starter", "Growth", "Pro", "Enterprise"].map(p => (
                    <div key={p} className={`text-center text-sm font-display font-bold ${
                      p === "Growth"
                        ? dark ? "text-cyan-400" : "text-cyan-600"
                        : dark ? "text-white" : "text-slate-900"
                    }`}>{p}</div>
                  ))}
                </div>

                {comparison.map((cat, ci) => (
                  <div key={ci}>
                    {/* Category header */}
                    <div className={`px-6 py-3 text-xs font-semibold tracking-widest uppercase ${
                      dark ? "bg-white/[0.02] text-slate-500 border-y border-white/[0.04]" : "bg-slate-50 text-slate-400 border-y border-gray-100"
                    }`}>
                      {cat.category}
                    </div>
                    {cat.rows.map((row, ri) => (
                      <div key={ri} className={`grid grid-cols-5 px-6 py-4 border-b transition-colors ${
                        dark
                          ? "border-white/[0.04] hover:bg-white/[0.02]"
                          : "border-gray-50 hover:bg-slate-50/50"
                      }`}>
                        <span className={`text-sm pr-4 flex items-center ${dark ? "text-slate-400" : "text-slate-600"}`}>{row.feature}</span>
                        {[row.starter, row.growth, row.pro, row.enterprise].map((v, vi) => (
                          <div key={vi} className="flex justify-center items-center">
                            {v
                              ? <CheckCircle className="w-5 h-5 text-cyan-500" />
                              : <span className={`w-4 h-px ${dark ? "bg-white/10" : "bg-gray-200"}`} />
                            }
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-6 py-24">
          <FadeUp className="text-center mb-14">
            <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Questions?{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>We have answers.</span>
            </h2>
          </FadeUp>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeUp key={i} delay={i * 60}>
                <FAQItem {...faq} dark={dark} />
              </FadeUp>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-4xl mx-auto px-6 pb-28">
          <FadeUp>
            <div
              className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${dark ? "bg-[#0f1929]" : "bg-white shadow-xl border border-gray-100"}`}
              style={dark ? { background: "linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.25),rgba(167,139,250,0.25)) border-box", border: "1px solid transparent" } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Not sure which plan?{" "}
                  <span className={dark ? "text-gradient" : "text-gradient-light"}>Let's talk.</span>
                </h2>
                <p className={`max-w-lg mx-auto mb-8 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  We'll walk you through the platform, understand your collection volume, and recommend the right plan — or build a custom one for your agency.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan"
                  >
                    Talk to the Team <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { navigate('/signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium rounded-xl transition-all duration-300 ${
                      dark
                        ? "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Start Free Trial
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

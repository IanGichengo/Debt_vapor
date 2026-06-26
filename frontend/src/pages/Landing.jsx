import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, BarChart3, Shield, CheckCircle,
  CreditCard, MessageSquare, Brain, RefreshCw, ChevronRight
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";

// ── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
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

// ── Particle canvas — adapts color to dark/light ─────────────────────────────
function ParticleCanvas({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // particle color: cyan in dark, blue-teal in light
      const pColor = dark ? "99,179,237" : "6,182,212";
      const lColor = dark ? "99,179,237" : "6,182,212";
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor},${dark ? p.o : p.o * 0.5})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            const alpha = (dark ? 0.06 : 0.04) * (1 - dist / 110);
            ctx.strokeStyle = `rgba(${lColor},${alpha})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, accent, delay, dark }) {
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
      className={`group relative rounded-2xl p-7 border transition-all duration-500 overflow-hidden ${
        dark
          ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.07)]"
          : "bg-white border-gray-100 hover:border-cyan-200 hover:shadow-[0_8px_40px_rgba(6,182,212,0.1)] shadow-sm"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`font-semibold text-lg mb-2 font-display ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    </div>
  );
}

// ── Section fade wrapper ──────────────────────────────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [mounted, setMounted] = useState(false);
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const features = [
    { icon: Brain,         title: "AI-Powered Conversations", description: "Gemini AI analyses debtor intent in real-time: payment readiness, emotional tone, dispute signals and responds intelligently via WhatsApp.", accent: dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600" },
    { icon: MessageSquare, title: "WhatsApp Integration",      description: "Automated two-way WhatsApp communication that reads replies, understands context, and escalates or resolves without manual input.",             accent: dark ? "bg-green-500/10 text-green-400"  : "bg-green-50 text-green-600"  },
    { icon: CreditCard,    title: "M-Pesa STK Push",           description: "When a debtor signals payment intent, an STK push fires automatically. No links, no redirects just a PIN prompt on their phone.",             accent: dark ? "bg-cyan-500/10 text-cyan-400"   : "bg-cyan-50 text-cyan-600"    },
    { icon: BarChart3,     title: "Live Analytics",            description: "Track collection performance, debtor engagement, payment trends, and AI interaction outcomes from a single real-time dashboard.",                  accent: dark ? "bg-blue-500/10 text-blue-400"   : "bg-blue-50 text-blue-600"    },
    { icon: RefreshCw,     title: "Automated Reminders",       description: "Schedule smart, configurable reminders per debtor. Set intervals, limits, and channels the scheduler handles the rest.",                        accent: dark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600" },
    { icon: Shield,        title: "Secure & Role-Based",       description: "JWT authentication, role-based access (Admin / Collector), and encrypted data pipelines keep your clients' data safe.",                          accent: dark ? "bg-rose-500/10 text-rose-400"   : "bg-rose-50 text-rose-600"    },
  ];

  const workflow = [
    { step: "01", title: "Add a Debtor",       body: "Enter debtor details and assign debts. The system stores contact info, debt amount, due dates, and creditor details." },
    { step: "02", title: "Send a Reminder",    body: "Trigger a WhatsApp message manually or let the automated scheduler handle it based on your configured rules." },
    { step: "03", title: "AI Reads the Reply", body: "Gemini analyses the debtor's response detecting payment intent, hardship, dispute, or inquiry and responds appropriately." },
    { step: "04", title: "Payment Collected",  body: "For payment-ready debtors, an M-Pesa STK push fires instantly. The transaction is logged and the debt balance updated." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .glow-cyan { box-shadow: 0 0 60px rgba(6,182,212,0.2), 0 0 120px rgba(6,182,212,0.08); }
        .glow-cyan:hover { box-shadow: 0 0 60px rgba(6,182,212,0.3), 0 0 120px rgba(6,182,212,0.12); }
        .text-gradient       { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .text-gradient-light { background: linear-gradient(135deg,#0891b2 0%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .border-gradient-dark  { border:1px solid transparent; background: linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.3),rgba(167,139,250,0.3)) border-box; }
        .border-gradient-light { border:1px solid transparent; background: linear-gradient(#f8faff,#f8faff) padding-box, linear-gradient(135deg,rgba(6,182,212,0.3),rgba(124,58,237,0.3)) border-box; }
        @keyframes heroFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .animate-float { animation: heroFloat 6s ease-in-out infinite; }
        .pulse-dot { position:relative; display:inline-flex; }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen overflow-x-hidden transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

          {/* Particle canvas — shown in BOTH modes */}
          <ParticleCanvas dark={dark} />

          {/* Ambient glows */}
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-cyan-500/10" : "bg-cyan-400/20"}`} />
          <div className={`absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/10" : "bg-violet-400/15"}`} />

          {/* Light mode subtle grid */}
          {!dark && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }}
            />
          )}

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
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
              Built for Kenyan Debt Collection Teams
            </div>

            {/* Headline */}
            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Debt Collection,{" "}
              <span className={`block ${dark ? "text-gradient" : "text-gradient-light"}`}>Automated.</span>
            </h1>

            {/* Sub */}
            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Debt Vapor combines AI conversation analysis, WhatsApp automation, and M-Pesa STK push into one seamless platform, so your team collects more with less manual effort.
            </p>

            {/* CTAs */}
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.5s" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold text-base rounded-xl transition-all duration-300 glow-cyan hover:scale-[1.03]">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium text-base rounded-xl transition-all duration-300 ${
                dark
                  ? "border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03]"
                  : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-white"
              }`}>
                Book a Demo
              </Link>
            </div>

            {/* Trust pills */}
            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.75s" }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm"
            >
              {["No credit card required", "Free to get started", "Local M-Pesa support"].map(t => (
                <span key={t} className={`flex items-center gap-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  <CheckCircle className="w-4 h-4 text-cyan-500/70" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>
            <span>Scroll</span>
            <div className={`w-px h-10 bg-gradient-to-b ${dark ? "from-slate-600" : "from-slate-400"} to-transparent`} />
          </div>
        </section>

        {/* ── CAPABILITIES STRIP ───────────────────────────────────────────── */}
        <section className={`border-y py-10 ${dark ? "border-white/[0.04] bg-[#0a1120]" : "border-gray-100 bg-white"}`}>
          <FadeUp>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 px-6 text-sm font-medium">
              {["WhatsApp Automation","Gemini AI Analysis","M-Pesa STK Push","Automated Reminders","Role-Based Access","Real-Time Dashboard","Debtor Profiles","Payment Plans"].map(cap => (
                <span key={cap} className={`flex items-center gap-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className="w-1 h-1 rounded-full bg-cyan-500" />{cap}
                </span>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-28">
          <FadeUp className="text-center mb-16">
            <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              From first reminder to{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>collected payment</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            {workflow.map((step, i) => (
              <FadeUp key={step.step} delay={i * 100}>
                <div className={`relative rounded-2xl p-6 h-full border group transition-colors duration-300 ${
                  dark
                    ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/20"
                    : "bg-white border-gray-100 hover:border-cyan-200 shadow-sm hover:shadow-md"
                }`}>
                  <div className={`text-5xl font-display font-extrabold mb-4 leading-none transition-colors ${
                    dark ? "text-white/[0.04] group-hover:text-white/[0.07]" : "text-slate-100 group-hover:text-slate-200"
                  }`}>{step.step}</div>
                  <h3 className={`font-display font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{step.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <section className={`py-28 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Platform Capabilities</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                Everything your team needs{" "}
                <span className={dark ? "text-gradient" : "text-gradient-light"}>in one place</span>
              </h2>
              <p className={`mt-4 max-w-xl mx-auto text-base leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Built specifically for the Kenyan market: M-Pesa native, WhatsApp first, and AI-assisted from the ground up.
              </p>
            </FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 80} dark={dark} />)}
            </div>
          </div>
        </section>

        {/* ── BUILT FOR KENYA ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-4">Local First</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
                Designed for{" "}
                <span className={dark ? "text-gradient" : "text-gradient-light"}>the Kenyan market</span>
              </h2>
              <p className={`leading-relaxed mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Most debt collection software is built for Western markets with bolt-on integrations. Debt Vapor is built from scratch around how Kenyans actually pay on their phones, via M-Pesa.
              </p>
              <ul className="space-y-4">
                {[
                  "M-Pesa Paybill & STK Push natively integrated",
                  "WhatsApp as the primary communication channel",
                  "AI responses tuned for local context",
                  "Kenya timezone & date formatting throughout",
                ].map(item => (
                  <li key={item} className={`flex items-start gap-3 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    <CheckCircle className="w-5 h-5 text-cyan-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>

            <FadeUp delay={150}>
              <div className="relative mx-auto max-w-xs animate-float">
                <div className={`rounded-3xl p-6 ${dark ? "border-gradient-dark bg-[#0f1929]" : "border-gradient-light bg-[#f8faff] shadow-xl"}`}>
                  <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${dark ? "text-white" : "text-slate-900"}`}>WhatsApp</p>
                      <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>+254 724 ••••••</p>
                    </div>
                    <span className="ml-auto text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] ${dark ? "bg-white/[0.05] text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                      Nataka kulipa KES 2,500 sasa hivi.
                    </div>
                    <div className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[85%] ml-auto text-right ${dark ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100" : "bg-cyan-500 text-white"}`}>
                      Asante! Nitatuma ombi la M-Pesa sasa.
                    </div>
                    <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-xs max-w-[75%] ${dark ? "bg-white/[0.05] text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                      ✅ STK Push sent — KES 2,500
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 pt-3 border-t ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <div className={`flex-1 rounded-full px-4 py-2 text-xs ${dark ? "bg-white/[0.04] text-slate-600" : "bg-slate-100 text-slate-400"}`}>AI composing reply...</div>
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-cyan-500" />
                    </div>
                  </div>
                </div>
                <div className={`absolute -top-4 -right-4 rounded-xl px-3 py-2 text-xs border ${dark ? "bg-violet-500/10 border-violet-500/20 text-violet-300" : "bg-violet-50 border-violet-100 text-violet-600"}`}>
                  <Brain className="w-3.5 h-3.5 inline mr-1" />Gemini AI active
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── EARLY ACCESS ──────────────────────────────────────────────────── */}
        <section className={`py-20 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FadeUp>
              <div className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${dark ? "border-gradient-dark" : "border-gradient-light shadow-xl"}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04]" />
                <div className="relative z-10">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6 border ${
                    dark ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
                  }`}>
                    Currently in Development
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    Be among the first teams<br />to use Debt Vapor
                  </h2>
                  <p className={`max-w-xl mx-auto mb-8 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Debt Vapor is actively being built and tested. Join the waitlist to get early access, shape the feature roadmap, and lock in founder pricing before public launch.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan">
                      Request Early Access <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/contact" className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium rounded-xl transition-all duration-300 ${
                      dark
                        ? "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                    }`}>
                      Talk to the Founders
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-28 text-center">
          <FadeUp>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Ready to automate your{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>collection workflow?</span>
            </h2>
            <p className={`text-lg max-w-xl mx-auto mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Stop chasing debtors manually. Let AI handle conversations, M-Pesa handle payments, and your team focus on strategy.
            </p>
            <Link
              to="/signup"
              className={`group inline-flex items-center gap-3 px-10 py-5 font-display font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-[1.03] shadow-2xl ${
                dark ? "bg-white text-[#070d18] hover:bg-cyan-400" : "bg-slate-900 text-white hover:bg-cyan-500"
              }`}
            >
              Get Started — It's Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeUp>
        </section>

        <Footer />
      </div>
    </>
  );
}

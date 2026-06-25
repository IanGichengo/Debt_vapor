import { useState, useEffect, useRef } from 'react';
import { Target, Globe, Shield, Zap, Heart, BarChart3, Shuffle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
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
        transform: inView ? "translateY(0)" : "translateY(30px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.8s cubic-bezier(.22,1,.36,1), opacity 0.8s ease",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function About() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Commitment",
      description: "Dedicated to the success of our clients and partners."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Perseverance",
      description: "Endurance and resilience in the face of complex challenges."
    },
    {
      icon: <Shuffle className="w-6 h-6" />,
      title: "Flexibility",
      description: "Adapting our technology to fit the unique needs of every enterprise."
    }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .text-gradient       { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .text-gradient-light { background: linear-gradient(135deg,#0891b2 0%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .card-glow { box-shadow: 0 0 60px rgba(6,182,212,0.12), 0 0 0 1px rgba(6,182,212,0.2); }

        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 flex flex-col ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>
        <Navbar />

        <main className="flex-grow">
          {/* ── HERO ── */}
          <section className="relative pt-32 pb-16 overflow-hidden">
            {/* Background Glows */}
            <div className={`absolute top-20 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-50 ${dark ? "bg-cyan-500/10" : "bg-cyan-400/20"}`} />
            <div className={`absolute top-40 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-50 ${dark ? "bg-violet-500/10" : "bg-violet-400/15"}`} />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
              <div
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-15px)", transition: "all 0.8s ease 0.1s" }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
                  dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"
                }`}
              >
                <span className="pulse-dot relative flex h-2 w-2">
                  <span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} />
                </span>
                Who are we?
              </div>

              <h1
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s" }}
                className="font-display text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8"
              >
                World-class services for<br />
                <span className={dark ? "text-gradient" : "text-gradient-light"}>Modern Enterprises.</span>
              </h1>

              <p
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.4s" }}
                className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                We leverage artificial intelligence and data to ensure quicker, more sustainable and structured credit collections. We strongly believe cashflow is the lifeblood of business and aim to help enterprises minimize overdue payments.
              </p>
            </div>
          </section>

          {/* ── MISSION & VISION ── */}
          <section className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <FadeUp delay={100}>
                <div className={`relative rounded-3xl p-10 h-full border transition-all duration-500 hover:scale-[1.01] ${
                  dark
                    ? "bg-[#0a1929] card-glow border-cyan-500/20"
                    : "bg-white shadow-xl shadow-cyan-500/5 border-cyan-200"
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-8 ${dark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className={`font-display text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                    Our Mission
                  </h2>
                  <p className={`text-lg leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    To provide world class services to enterprises through useful technology that allows for increased efficiency and faster growth.
                  </p>
                </div>
              </FadeUp>

              <FadeUp delay={300}>
                <div className={`relative rounded-3xl p-10 h-full border transition-all duration-500 hover:scale-[1.01] ${
                  dark
                    ? "bg-[#0f1929] border-white/[0.08]"
                    : "bg-white shadow-sm border-gray-200"
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-8 ${dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"}`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <h2 className={`font-display text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                    Our Vision
                  </h2>
                  <p className={`text-lg leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    To be the leader in strengthening business cash flow throughout Africa and the globe.
                  </p>
                </div>
              </FadeUp>
            </div>
          </section>

          {/* ── CORE VALUES ── */}
          <section className={`py-24 mt-12 transition-colors duration-300 ${dark ? "bg-[#0a1120]" : "bg-white border-t border-gray-100"}`}>
            <div className="max-w-6xl mx-auto px-6">
              <FadeUp>
                <div className="text-center mb-16">
                  <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Foundation of Trust</p>
                  <h2 className="font-display text-4xl font-bold leading-tight">
                    Our Core <span className={dark ? "text-gradient" : "text-gradient-light"}>Values</span>
                  </h2>
                </div>
              </FadeUp>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {values.map((value, i) => (
                  <FadeUp key={i} delay={i * 150}>
                    <div className={`group h-full rounded-2xl p-8 border transition-all duration-500 hover:translate-y-[-8px] ${
                      dark
                        ? "bg-[#0f1929] border-white/[0.06] hover:bg-white/[0.02]"
                        : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl"
                    }`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${
                        dark ? "bg-white/[0.04] text-cyan-400" : "bg-white text-cyan-600 shadow-sm"
                      }`}>
                        {value.icon}
                      </div>
                      <h3 className={`font-display font-bold text-2xl mb-3 ${dark ? "text-white" : "text-slate-900"}`}>
                        {value.title}
                      </h3>
                      <p className={`leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {value.description}
                      </p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

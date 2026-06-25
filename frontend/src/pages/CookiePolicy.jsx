import { useState, useEffect, useRef } from 'react';
import { Cookie } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

// ── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.1) {
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
        transform: inView ? "translateY(0)" : "translateY(24px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.6s ease",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function Section({ id, title, children, dark }) {
  return (
    <FadeUp>
      <section id={id} className={`rounded-2xl border p-8 md:p-10 scroll-mt-28 ${
        dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"
      }`}>
        <h2 className={`font-display font-bold text-xl md:text-2xl mb-5 ${dark ? "text-white" : "text-slate-900"}`}>
          {title}
        </h2>
        <div className={`text-sm leading-relaxed space-y-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {children}
        </div>
      </section>
    </FadeUp>
  );
}

function Strong({ children, dark }) {
  return <strong className={dark ? "text-slate-200" : "text-slate-700"}>{children}</strong>;
}

// ── Cookie type badge ─────────────────────────────────────────────────────────
function CookieBadge({ type, dark }) {
  const colors = {
    essential:   dark ? "bg-green-500/10 border-green-500/20 text-green-400"   : "bg-green-50 border-green-200 text-green-700",
    functional:  dark ? "bg-blue-500/10 border-blue-500/20 text-blue-400"     : "bg-blue-50 border-blue-200 text-blue-700",
    analytics:   dark ? "bg-orange-500/10 border-orange-500/20 text-orange-400": "bg-orange-50 border-orange-200 text-orange-700",
    third:       dark ? "bg-violet-500/10 border-violet-500/20 text-violet-400": "bg-violet-50 border-violet-200 text-violet-700",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${colors[type]}`}>
      {type}
    </span>
  );
}

// ── Cookie table row ──────────────────────────────────────────────────────────
function CookieTable({ cookies, dark }) {
  return (
    <div className={`rounded-xl overflow-hidden border mt-2 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
      <div className={`grid grid-cols-4 px-4 py-3 text-xs font-semibold tracking-wider uppercase ${
        dark ? "bg-white/[0.03] text-slate-500 border-b border-white/[0.06]" : "bg-slate-50 text-slate-400 border-b border-gray-100"
      }`}>
        <span>Name</span>
        <span>Purpose</span>
        <span>Duration</span>
        <span>Type</span>
      </div>
      {cookies.map((c, i) => (
        <div key={i} className={`grid grid-cols-4 px-4 py-3.5 text-xs border-b last:border-0 transition-colors ${
          dark
            ? "border-white/[0.04] hover:bg-white/[0.02] text-slate-400"
            : "border-gray-50 hover:bg-slate-50/60 text-slate-500"
        }`}>
          <span className={`font-mono text-xs ${dark ? "text-cyan-400" : "text-cyan-600"}`}>{c.name}</span>
          <span>{c.purpose}</span>
          <span>{c.duration}</span>
          <CookieBadge type={c.type} dark={dark} />
        </div>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CookiePolicy() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const sections = [
    { id: 'what-are',    label: 'What Are Cookies'      },
    { id: 'how-we-use',  label: 'How We Use Cookies'    },
    { id: 'types',       label: 'Types We Use'          },
    { id: 'table',       label: 'Cookie Reference'      },
    { id: 'third-party', label: 'Third-Party Cookies'   },
    { id: 'no-cookies',  label: 'What We Don\'t Do'     },
    { id: 'control',     label: 'Your Controls'         },
    { id: 'browser',     label: 'Browser Settings'      },
    { id: 'changes',     label: 'Policy Changes'        },
    { id: 'contact',     label: 'Contact'               },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offsets = sections.map(s => {
        const el = document.getElementById(s.id);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
      });
      const closest = offsets.reduce((a, b) => a.top < b.top ? a : b);
      setActiveSection(closest.id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cookies = [
    { name: "dcs_session",     purpose: "Maintains your authenticated login session across page loads",                  duration: "Session",  type: "essential"  },
    { name: "dcs_auth_token",  purpose: "Stores your JWT access token to keep you logged in",                           duration: "7 days",   type: "essential"  },
    { name: "dcs_refresh",     purpose: "Allows silent token refresh without requiring re-login",                        duration: "30 days",  type: "essential"  },
    { name: "dcs_csrf",        purpose: "Cross-site request forgery protection token",                                   duration: "Session",  type: "essential"  },
    { name: "dcs_theme",       purpose: "Remembers your light/dark mode preference",                                    duration: "1 year",   type: "functional" },
    { name: "dcs_sidebar",     purpose: "Remembers dashboard sidebar state (expanded or collapsed)",                    duration: "30 days",  type: "functional" },
    { name: "dcs_locale",      purpose: "Stores your language/timezone preferences",                                    duration: "1 year",   type: "functional" },
    { name: "_ga",             purpose: "Google Analytics — distinguishes unique users for usage analytics",             duration: "2 years",  type: "analytics"  },
    { name: "_ga_*",           purpose: "Google Analytics — maintains session state across page views",                  duration: "2 years",  type: "analytics"  },
    { name: "__cf_bm",         purpose: "Cloudflare — bot detection and security challenge management",                  duration: "30 mins",  type: "third"      },
  ];

  const lastUpdated = "26 March 2026";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        .text-gradient       { background: linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .text-gradient-light { background: linear-gradient(135deg,#0891b2 0%,#7c3aed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.7);opacity:0} }
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(251,191,36,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(251,191,36,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-amber-500/8" : "bg-amber-400/15"}`} />
          <div className={`absolute top-32 right-1/3 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/10"}`} />
          {!dark && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }}
            />
          )}

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${
                dark ? "border-amber-500/20 bg-amber-500/5 text-amber-400" : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span className="pulse-dot relative flex h-2 w-2">
                <span className={`w-2 h-2 rounded-full block ${dark ? "bg-amber-400" : "bg-amber-500"}`} />
              </span>
              Website Cookies
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Cookie{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>Policy</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-base max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              This policy explains what cookies DCS uses, why we use them, and how you can control them. We keep it minimal — we only use what the platform genuinely needs.
            </p>

            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}
              className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl text-xs border ${
                dark ? "border-white/[0.06] bg-white/[0.03] text-slate-500" : "border-gray-100 bg-white text-slate-400"
              }`}
            >
              <Cookie className="w-3.5 h-3.5 text-amber-500" />
              Last updated: {lastUpdated}
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="flex gap-10 items-start">

            {/* Sticky sidebar */}
            <aside className="hidden lg:block w-56 shrink-0 sticky top-24">
              <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${dark ? "text-slate-500" : "text-slate-400"}`}>Contents</p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === s.id
                        ? dark
                          ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                          : "bg-amber-50 text-amber-600 border-l-2 border-amber-500"
                        : dark
                          ? "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                          : "text-slate-400 hover:text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              {/* Legend */}
              <div className={`mt-8 rounded-xl border p-4 space-y-2 ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-white"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>Cookie Types</p>
                {[
                  { type: "essential",  label: "Essential"   },
                  { type: "functional", label: "Functional"  },
                  { type: "analytics",  label: "Analytics"   },
                  { type: "third",      label: "Third-Party" },
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <CookieBadge type={type} dark={dark} />
                  </div>
                ))}
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5">

              <Section id="what-are" title="1. What Are Cookies?" dark={dark}>
                <p>
                  Cookies are small text files placed on your device by a website when you visit it. They allow the website to remember information about your visit — such as whether you are logged in, your preferences, and how you use the site.
                </p>
                <p>
                  DCS uses cookies and similar browser storage technologies (such as <Strong dark={dark}>localStorage</Strong> and <Strong dark={dark}>sessionStorage</Strong>) to keep the platform functional and personalised. This policy covers all such technologies collectively referred to as "cookies".
                </p>
                <p>
                  Cookies are stored locally on your browser and device. They are not the same as personal data held on our servers — though some cookies may reference identifiers that are linked to your account.
                </p>
              </Section>

              <Section id="how-we-use" title="2. How We Use Cookies" dark={dark}>
                <p>DCS uses cookies for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><Strong dark={dark}>Authentication:</Strong> To keep you securely logged in across page loads and browser sessions without requiring you to re-enter your password every time</li>
                  <li><Strong dark={dark}>Security:</Strong> To protect against cross-site request forgery (CSRF) attacks and detect suspicious activity</li>
                  <li><Strong dark={dark}>Preferences:</Strong> To remember your UI settings such as dark/light mode, sidebar state, and locale preferences</li>
                  <li><Strong dark={dark}>Analytics:</Strong> To understand how users navigate the platform so we can improve it — using anonymised, aggregated data</li>
                  <li><Strong dark={dark}>Infrastructure:</Strong> Third-party services we rely on (such as Cloudflare for security) may set their own cookies as part of delivering the platform</li>
                </ul>
                <p>
                  We do <Strong dark={dark}>not</Strong> use cookies for advertising, retargeting, or tracking you across other websites.
                </p>
              </Section>

              <Section id="types" title="3. Types of Cookies We Use" dark={dark}>
                <div className="space-y-5">
                  {[
                    {
                      type: "essential" ,
                      title: "Essential Cookies",
                      body: "These are strictly necessary for the DCS platform to function. They manage your login session, store your authentication token, and protect against security attacks. You cannot opt out of essential cookies — without them, the platform cannot work.",
                    },
                    {
                      type: "functional" ,
                      title: "Functional Cookies",
                      body: "These remember your preferences — like whether you prefer dark mode or how you like your dashboard laid out. They are not strictly necessary but significantly improve your experience. You can disable them, but your preferences will reset on each visit.",
                    },
                    {
                      type: "analytics" ,
                      title: "Analytics Cookies",
                      body: "We use Google Analytics to understand how the platform is used in aggregate — which pages are visited, how long sessions last, and where users encounter friction. No personally identifiable information is included. You can opt out via your browser or using Google's opt-out tools.",
                    },
                    {
                      type: "third" ,
                      title: "Third-Party Cookies",
                      body: "Some third-party services integrated into DCS — such as Cloudflare for DDoS protection and performance — may set their own cookies. These are governed by their own privacy and cookie policies, which we link to in our Privacy Policy.",
                    },
                  ].map(({ type, title, body }) => (
                    <div key={type} className={`rounded-xl p-5 border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-slate-50"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <CookieBadge type={type} dark={dark} />
                        <h3 className={`font-display font-semibold text-sm ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                      </div>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="table" title="4. Cookie Reference Table" dark={dark}>
                <p>Below is a full list of cookies used on the DCS platform:</p>
                <CookieTable cookies={cookies} dark={dark} />
                <p className="pt-2 text-xs">
                  Cookie names prefixed with <span className={`font-mono text-xs ${dark ? "text-cyan-400" : "text-cyan-600"}`}>dcs_</span> are set directly by us. Others are set by third-party services.
                </p>
              </Section>

              <Section id="third-party" title="5. Third-Party Cookies" dark={dark}>
                <p>The following third-party services may set cookies when you use DCS:</p>
                <div className="space-y-3 mt-2">
                  {[
                    {
                      name: "Google Analytics",
                      purpose: "Anonymised usage analytics to help us understand platform performance",
                      cookies: "_ga, _ga_*",
                      link: "policies.google.com/privacy",
                      optout: "tools.google.com/dlpage/gaoptout",
                    },
                    {
                      name: "Cloudflare",
                      purpose: "Security, DDoS protection, and content delivery network",
                      cookies: "__cf_bm, cf_clearance",
                      link: "cloudflare.com/privacypolicy",
                      optout: null,
                    },
                  ].map(({ name, purpose, cookies, link, optout }) => (
                    <div key={name} className={`rounded-xl p-5 border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-slate-50"}`}>
                      <p className={`font-display font-semibold text-sm mb-1 ${dark ? "text-white" : "text-slate-900"}`}>{name}</p>
                      <p className="mb-1">{purpose}</p>
                      <p>Cookies: <span className={`font-mono text-xs ${dark ? "text-cyan-400" : "text-cyan-600"}`}>{cookies}</span></p>
                      <p>Privacy policy: <span className="text-cyan-500">{link}</span></p>
                      {optout && <p>Opt-out: <span className="text-cyan-500">{optout}</span></p>}
                    </div>
                  ))}
                </div>
                <p>
                  DCS does not integrate with advertising networks, social media pixels, or any tracking services beyond those listed above. We will update this list if we add new third-party integrations.
                </p>
              </Section>

              <Section id="no-cookies" title="6. What We Don't Do With Cookies" dark={dark}>
                <p>To be explicit about our approach — DCS does <Strong dark={dark}>not</Strong>:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Use cookies to track you across other websites or platforms</li>
                  <li>Sell or share cookie data with advertisers or data brokers</li>
                  <li>Use cookies to build advertising profiles</li>
                  <li>Place Facebook Pixel, TikTok Pixel, or any social media tracking cookies</li>
                  <li>Use cookies to identify or track Debtors — debtor data is handled entirely server-side</li>
                  <li>Use cookies to infer sensitive information such as health, financial status, or political views</li>
                </ul>
                <p>
                  Our analytics use is limited to understanding how the <Strong dark={dark}>platform itself</Strong> is used — page views, session durations, feature usage — not debtor behaviour or financial data.
                </p>
              </Section>

              <Section id="control" title="7. Your Controls" dark={dark}>
                <p>You have several options for controlling cookies on DCS:</p>
                <div className="space-y-3 mt-2">
                  {[
                    {
                      title: "Essential cookies",
                      body: "Cannot be disabled — they are required for login and security. If you clear all cookies, you will be logged out and will need to sign in again.",
                    },
                    {
                      title: "Functional cookies",
                      body: "You can clear these via your browser's cookie manager. Your UI preferences (dark mode, sidebar state) will reset to defaults on your next visit.",
                    },
                    {
                      title: "Analytics cookies",
                      body: "You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on at tools.google.com/dlpage/gaoptout, or by blocking cookies in your browser settings.",
                    },
                    {
                      title: "All cookies",
                      body: "You can clear all cookies for DCS via your browser settings (see Section 8). Note that clearing essential cookies will log you out of the platform.",
                    },
                  ].map(({ title, body }) => (
                    <div key={title} className={`rounded-xl p-5 border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-slate-50"}`}>
                      <p className={`font-display font-semibold text-sm mb-1 ${dark ? "text-white" : "text-slate-900"}`}>{title}</p>
                      <p>{body}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="browser" title="8. Browser Settings" dark={dark}>
                <p>
                  All modern browsers allow you to view, manage, and delete cookies. Here are direct links to cookie management instructions for the most common browsers:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {[
                    { name: "Google Chrome",   link: "support.google.com/chrome/answer/95647"                           },
                    { name: "Mozilla Firefox", link: "support.mozilla.org/kb/clear-cookies-and-site-data-firefox"       },
                    { name: "Safari",          link: "support.apple.com/guide/safari/manage-cookies-sfri11471"          },
                    { name: "Microsoft Edge",  link: "support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge" },
                    { name: "Opera",           link: "help.opera.com/en/latest/web-preferences/#cookies"               },
                    { name: "Brave",           link: "support.brave.com/hc/articles/360022806212"                       },
                  ].map(({ name, link }) => (
                    <div key={name} className={`rounded-xl p-4 border text-center ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-slate-50"}`}>
                      <p className={`font-semibold text-xs mb-1 ${dark ? "text-slate-200" : "text-slate-800"}`}>{name}</p>
                      <p className="text-cyan-500 text-xs break-all">{link}</p>
                    </div>
                  ))}
                </div>
                <p className="pt-2">
                  Note that blocking or deleting <Strong dark={dark}>essential cookies</Strong> will prevent you from using the DCS platform as it will log you out and disable authentication.
                </p>
              </Section>

              <Section id="changes" title="9. Policy Changes" dark={dark}>
                <p>
                  We may update this Cookie Policy when we add new features, integrate new third-party services, or in response to changes in applicable law. When we make changes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>The "Last updated" date at the top of this page will be revised</li>
                  <li>If we add new analytics or tracking cookies, we will notify active Clients via email before the change takes effect</li>
                  <li>We will never introduce advertising cookies or social media tracking pixels without explicit notice</li>
                </ul>
                <p>
                  Continued use of DCS after a policy update constitutes acceptance of the revised cookie practices.
                </p>
              </Section>

              <Section id="contact" title="10. Contact" dark={dark}>
                <p>If you have questions about how DCS uses cookies or wish to exercise your rights under Kenya's Data Protection Act 2019:</p>
                <div className={`mt-4 rounded-xl p-6 border space-y-2 ${
                  dark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-50 border-gray-100"
                }`}>
                  <p><Strong dark={dark}>DCS — Privacy & Cookies</Strong></p>
                  <p>Email: <span className="text-cyan-500">privacy@dcs.co.ke</span></p>
                  <p>Platform: <span className="text-cyan-500">dcs.co.ke</span></p>
                  <p>Registered in Kenya</p>
                </div>
                <p className="pt-4">
                  For complaints about our use of cookies or data, you may also contact Kenya's <Strong dark={dark}>Office of the Data Protection Commissioner (ODPC)</Strong> at <span className="text-cyan-500">odpc.go.ke</span>.
                </p>
              </Section>

            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

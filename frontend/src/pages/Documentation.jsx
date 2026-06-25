import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap, MessageSquare, CreditCard, Brain, RefreshCw, Users, Shield, Code, Copy, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

function useInView(t = 0.08) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: t });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [t]);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, transform: inView ? "translateY(0)" : "translateY(20px)", opacity: inView ? 1 : 0, transition: "transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.6s ease" }} className={className}>
      {children}
    </div>
  );
}

function CodeBlock({ code, dark, language = "bash" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className={`relative rounded-xl overflow-hidden border my-4 ${dark ? "border-white/[0.08] bg-[#070d18]" : "border-gray-200 bg-slate-900"}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b ${dark ? "border-white/[0.06]" : "border-white/10"}`}>
        <span className="text-xs font-mono text-slate-500">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-300 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

function Callout({ type = "info", children, dark }) {
  const s = { info: dark ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-300" : "bg-cyan-50 border-cyan-200 text-cyan-800", warning: dark ? "bg-amber-500/5 border-amber-500/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800", success: dark ? "bg-green-500/5 border-green-500/20 text-green-300" : "bg-green-50 border-green-200 text-green-800" };
  const icons = { info: "ℹ️", warning: "⚠️", success: "✅" };
  return <div className={`rounded-xl border px-5 py-4 my-4 text-sm leading-relaxed flex gap-3 ${s[type]}`}><span className="mt-0.5 shrink-0">{icons[type]}</span><div>{children}</div></div>;
}

function Step({ n, text, dark }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 mt-0.5 ${dark ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-200"}`}>{n}</span>
      <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{text}</p>
    </div>
  );
}

function Li({ children, dark }) {
  return <li className={`text-sm leading-relaxed flex items-start gap-2.5 ${dark ? "text-slate-400" : "text-slate-500"}`}><span className="text-cyan-500 mt-1 shrink-0">›</span><span>{children}</span></li>;
}

function H2({ children, dark }) { return <h2 className={`font-display font-bold text-2xl md:text-3xl pt-2 ${dark ? "text-white" : "text-slate-900"}`}>{children}</h2>; }
function H3({ children, dark }) { return <h3 className={`font-display font-semibold text-lg mt-6 mb-2 ${dark ? "text-slate-100" : "text-slate-800"}`}>{children}</h3>; }
function P({ children, dark }) { return <p className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{children}</p>; }
function Strong({ children, dark }) { return <strong className={dark ? "text-slate-200 font-semibold" : "text-slate-700 font-semibold"}>{children}</strong>; }

function DocSection({ id, children }) { return <FadeUp><section id={id} className="scroll-mt-24 space-y-4">{children}</section></FadeUp>; }

export default function Documentation() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('quickstart');
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const nav = [
    { id: 'quickstart', label: 'Quick Start',       icon: Zap           },
    { id: 'whatsapp',   label: 'WhatsApp Setup',     icon: MessageSquare },
    { id: 'mpesa',      label: 'M-Pesa Setup',       icon: CreditCard    },
    { id: 'debtors',    label: 'Managing Debtors',   icon: Users         },
    { id: 'reminders',  label: 'Reminder Scheduler', icon: RefreshCw     },
    { id: 'ai',         label: 'AI & Automation',    icon: Brain         },
    { id: 'payments',   label: 'Payment Plans',      icon: FileText      },
    { id: 'team',       label: 'Team & Roles',       icon: Shield        },
    { id: 'api',        label: 'API Reference',      icon: Code          },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offsets = nav.map(s => { const el = document.getElementById(s.id); if (!el) return { id: s.id, top: Infinity }; return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 100) }; });
      setActiveSection(offsets.reduce((a, b) => a.top < b.top ? a : b).id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display{font-family:'Syne',sans-serif}.font-body{font-family:'DM Sans',sans-serif}
        .text-gradient{background:linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .text-gradient-light{background:linear-gradient(135deg,#0891b2 0%,#7c3aed 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.7);opacity:0}}
        .pulse-dot::before{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(6,182,212,.4);animation:pulse-ring 2.5s ease-out infinite}
        .pulse-dot::after{content:'';position:absolute;inset:-14px;border-radius:50%;border:1px solid rgba(6,182,212,.15);animation:pulse-ring 2.5s .8s ease-out infinite}
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* HERO */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-32 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
          {!dark && <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }} />}
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"}`}>
              <span className="pulse-dot relative flex h-2 w-2"><span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} /></span>
              Developer & User Docs
            </div>
            <h1 style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }} className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              DCS <span className={dark ? "text-gradient" : "text-gradient-light"}>Documentation</span>
            </h1>
            <p style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }} className={`text-base max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Everything you need to set up, configure, and run DCS — from first login to production-ready automation.
            </p>
          </div>
        </section>

        {/* BODY */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="flex gap-10 items-start">

            {/* Sidebar */}
            <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
              <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${dark ? "text-slate-500" : "text-slate-400"}`}>Contents</p>
              <nav className="space-y-0.5">
                {nav.map(item => (
                  <button key={item.id} onClick={() => scrollTo(item.id)} className={`flex items-center gap-2.5 w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 ${activeSection === item.id ? dark ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500" : "bg-cyan-50 text-cyan-600 border-l-2 border-cyan-500" : dark ? "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]" : "text-slate-400 hover:text-slate-700 hover:bg-gray-50"}`}>
                    <item.icon className="w-3.5 h-3.5 shrink-0" />{item.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-20">

              {/* 1. QUICK START */}
              <DocSection id="quickstart">
                <H2 dark={dark}>Quick Start</H2>
                <P dark={dark}>Get DCS running from a fresh account to your first automated WhatsApp reminder in under 15 minutes.</P>

                <H3 dark={dark}>Prerequisites</H3>
                <ul className="space-y-2 pl-1">
                  <Li dark={dark}>A <Strong dark={dark}>Meta Developer account</Strong> with a WhatsApp Business App and verified phone number</Li>
                  <Li dark={dark}>A <Strong dark={dark}>Safaricom Daraja API account</Strong> with a registered Paybill or Till Number</Li>
                  <Li dark={dark}>Your <Strong dark={dark}>Node.js backend running</Strong> locally with ngrok or on a hosted server</Li>
                </ul>

                <H3 dark={dark}>Step 1 — Configure environment variables</H3>
                <P dark={dark}>In your DCS backend folder, create or update your <code className="font-mono text-cyan-500 text-xs">.env</code> file:</P>
                <CodeBlock dark={dark} language=".env" code={`DATABASE_URL="postgresql://user:password@host:5432/dcs_db"
JWT_SECRET="your-long-random-secret-here"

# WhatsApp
WHATSAPP_TOKEN="EAAxxxx..."
WHATSAPP_PHONE_ID="123456789"
WHATSAPP_VERIFY_TOKEN="your_custom_verify_token"

# M-Pesa
MPESA_CONSUMER_KEY="xxxx"
MPESA_CONSUMER_SECRET="xxxx"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="xxxx"
MPESA_CALLBACK_URL="https://yourdomain.com/api/mpesa/callback"

# Gemini AI
GEMINI_API_KEY="AIzaSy..."

PORT=3000
NODE_ENV=development`} />

                <H3 dark={dark}>Step 2 — Start the server</H3>
                <CodeBlock dark={dark} language="bash" code={`cd DCS/backend
npm install
npx prisma migrate dev --name init
npm start`} />
                <Callout type="success" dark={dark}>You should see: <code className="font-mono text-xs">Server is running on port 3000</code> and <code className="font-mono text-xs">✓ AI Reminder Scheduler initialized</code></Callout>

                <H3 dark={dark}>Step 3 — Expose your server (local dev)</H3>
                <CodeBlock dark={dark} language="bash" code={`# Static ngrok domain (recommended):
ngrok http --url=your-domain.ngrok-free.dev 3000

# Dynamic URL (changes each session):
ngrok http 3000`} />

                <H3 dark={dark}>Step 4 — Add your first debtor and send a reminder</H3>
                <div className="space-y-3">
                  <Step n="1" dark={dark} text="Log in to your dashboard and go to Debtors → Add Debtor" />
                  <Step n="2" dark={dark} text="Fill in name, phone number (format: 254712345678), and debt amount" />
                  <Step n="3" dark={dark} text="Open the debtor's profile → click Send Reminder → confirm" />
                  <Step n="4" dark={dark} text="Check the debtor's WhatsApp — the message should arrive within seconds" />
                </div>
              </DocSection>

              {/* 2. WHATSAPP */}
              <DocSection id="whatsapp">
                <H2 dark={dark}>WhatsApp Setup</H2>
                <P dark={dark}>DCS uses Meta's WhatsApp Business Cloud API. This covers the full setup from Meta dashboard to working webhook.</P>

                <H3 dark={dark}>1. Create a Meta App</H3>
                <ul className="space-y-2 pl-1">
                  <Li dark={dark}>Go to <strong className="text-cyan-500">developers.facebook.com</strong> → Create App → select Business type</Li>
                  <Li dark={dark}>From your app dashboard, find <Strong dark={dark}>WhatsApp</Strong> in Add Products and click Set Up</Li>
                </ul>

                <H3 dark={dark}>2. Get your credentials</H3>
                <P dark={dark}>In <Strong dark={dark}>WhatsApp → API Setup</Strong>:</P>
                <ul className="space-y-2 pl-1">
                  <Li dark={dark}><Strong dark={dark}>Access Token</Strong> — use the temporary token for testing. Generate a permanent System User token via Meta Business Suite for production.</Li>
                  <Li dark={dark}><Strong dark={dark}>Phone Number ID</Strong> — add to <code className="font-mono text-cyan-500 text-xs">WHATSAPP_PHONE_ID</code> in your .env</Li>
                  <Li dark={dark}><Strong dark={dark}>WABA ID</Strong> — WhatsApp Business Account ID, needed to subscribe webhooks</Li>
                </ul>

                <H3 dark={dark}>3. Configure the Webhook</H3>
                <CodeBlock dark={dark} language="webhook config" code={`Callback URL:  https://your-domain.app/api/whatsapp/webhook
Verify Token:  (value of WHATSAPP_VERIFY_TOKEN in your .env)`} />
                <Callout type="warning" dark={dark}>The callback URL must end with <code className="font-mono text-xs">/api/whatsapp/webhook</code>. Your server must be running when you click Verify and Save.</Callout>

                <H3 dark={dark}>4. Subscribe to messages</H3>
                <P dark={dark}>After saving the webhook: <Strong dark={dark}>Webhook Fields → Manage → subscribe to messages</Strong>. Without this, debtor replies will never reach your server.</P>

                <H3 dark={dark}>5. Subscribe your WABA to the app</H3>
                <CodeBlock dark={dark} language="bash" code={`curl -X POST \\
  "https://graph.facebook.com/v17.0/YOUR_WABA_ID/subscribed_apps" \\
  -H "Authorization: Bearer YOUR_WHATSAPP_TOKEN"
# Expected: { "success": true }`} />

                <H3 dark={dark}>6. Switch to Live Mode</H3>
                <P dark={dark}>In Development Mode, only verified test numbers can send messages. Switch to <Strong dark={dark}>Live Mode</Strong> via the Meta dashboard top bar to receive messages from real debtors. You'll need a privacy policy URL — use <code className="font-mono text-cyan-500 text-xs">yourdomain.com/privacy</code>.</P>
              </DocSection>

              {/* 3. MPESA */}
              <DocSection id="mpesa">
                <H2 dark={dark}>M-Pesa Setup</H2>
                <P dark={dark}>DCS integrates with Safaricom's Daraja API to initiate STK push payment requests on behalf of your clients.</P>

                <H3 dark={dark}>1. Register on Daraja</H3>
                <ul className="space-y-2 pl-1">
                  <Li dark={dark}>Go to <strong className="text-cyan-500">developer.safaricom.co.ke</strong> and create a developer account</Li>
                  <Li dark={dark}>Go to <Strong dark={dark}>My Apps → Add a New App</Strong> → select Lipa Na M-Pesa Sandbox</Li>
                  <Li dark={dark}>Copy your <Strong dark={dark}>Consumer Key</Strong> and <Strong dark={dark}>Consumer Secret</Strong></Li>
                </ul>

                <H3 dark={dark}>2. Sandbox test credentials</H3>
                <CodeBlock dark={dark} language=".env" code={`MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox`} />

                <H3 dark={dark}>3. Callback URL</H3>
                <CodeBlock dark={dark} language=".env" code={`MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback`} />
                <Callout type="warning" dark={dark}>Must be a public HTTPS URL. Safaricom cannot reach localhost. Use ngrok during development.</Callout>

                <H3 dark={dark}>4. Testing STK Push</H3>
                <P dark={dark}>Use the Daraja sandbox test phone <code className="font-mono text-cyan-500 text-xs">254708374149</code> with PIN <code className="font-mono text-cyan-500 text-xs">12345</code>. Trigger a test from any debtor's profile → Send Payment Request.</P>

                <H3 dark={dark}>5. Going to production</H3>
                <P dark={dark}>Apply for a production app at developer.safaricom.co.ke under <Strong dark={dark}>Go Live</Strong>. Replace sandbox credentials with production values and set <code className="font-mono text-cyan-500 text-xs">MPESA_ENVIRONMENT=production</code>.</P>
              </DocSection>

              {/* 4. DEBTORS */}
              <DocSection id="debtors">
                <H2 dark={dark}>Managing Debtors</H2>
                <P dark={dark}>Debtors are the core entity in DCS. Each profile links to debts, a WhatsApp chat log, and reminder settings.</P>

                <H3 dark={dark}>Adding a debtor</H3>
                <div className="space-y-3">
                  <Step n="1" dark={dark} text="Go to Debtors in the sidebar → Add Debtor" />
                  <Step n="2" dark={dark} text="Fill in: Full Name (required), Phone (required), Email (optional), National ID (optional)" />
                  <Step n="3" dark={dark} text="Click Save — then from the profile click Add Debt: enter amount, due date, creditor name, debt type" />
                </div>

                <H3 dark={dark}>Phone number format</H3>
                <CodeBlock dark={dark} language="format" code={`✅ 254712345678    (international, no plus)
✅ +254712345678   (with plus — also accepted)
✅ 0712345678      (local format — also accepted)
❌ 712345678       (missing country code)`} />
                <P dark={dark}>DCS normalises all three formats when matching incoming WhatsApp replies to debtor profiles.</P>

                <H3 dark={dark}>Debt statuses</H3>
                <CodeBlock dark={dark} language="statuses" code={`pending   → Unpaid and active. Reminders will fire.
active    → Debtor engaged (on payment plan). AI continues conversations.
settled   → Fully paid. Reminders stop automatically.
disputed  → Debtor raised a dispute. Flagged for manual review.`} />
              </DocSection>

              {/* 5. REMINDERS */}
              <DocSection id="reminders">
                <H2 dark={dark}>Reminder Scheduler</H2>
                <P dark={dark}>The automated scheduler runs every hour and sends WhatsApp reminders to eligible debtors without any manual input.</P>

                <H3 dark={dark}>How it works</H3>
                <P dark={dark}>On each hourly run, the scheduler looks for debtors who have an active debt, reminder settings enabled, haven't been messaged within their configured interval, and haven't exceeded their maximum reminder count.</P>

                <H3 dark={dark}>Per-debtor configuration</H3>
                <CodeBlock dark={dark} language="settings" code={`Enabled:       true / false
Interval:      3 | 7 | 14 | 30  (days between reminders)
Max Reminders: 1 | 2 | 3 | 5 | 10 (total before stopping)`} />
                <Callout type="info" dark={dark}>Max Reminders: 3 + Interval: 7 days = reminders on day 0, 7, and 14 — then the scheduler stops for that debtor automatically.</Callout>

                <H3 dark={dark}>Organisation defaults</H3>
                <P dark={dark}>Set default reminder settings for all new debtors under <Strong dark={dark}>Settings → Default Reminder Settings</Strong>. Applied automatically when a new debtor is created.</P>

                <H3 dark={dark}>Duplicate protection</H3>
                <P dark={dark}>Built-in duplicate send protection prevents the same debtor from receiving multiple reminders within their interval. A <code className="font-mono text-cyan-500 text-xs">warn: Duplicate reminder blocked</code> log entry appears when this fires.</P>
              </DocSection>

              {/* 6. AI */}
              <DocSection id="ai">
                <H2 dark={dark}>AI & Automation</H2>
                <P dark={dark}>When a debtor replies to a WhatsApp message, Gemini AI analyses the text and responds automatically. Here's the exact pipeline.</P>

                <H3 dark={dark}>The AI pipeline</H3>
                <div className="space-y-3">
                  <Step n="1" dark={dark} text="Debtor reply arrives at POST /api/whatsapp/webhook" />
                  <Step n="2" dark={dark} text="DCS looks up the debtor by phone number (normalised across formats)" />
                  <Step n="3" dark={dark} text="Message text + debt context sent to Gemini API for analysis" />
                  <Step n="4" dark={dark} text="AI returns intent classification, tone, and suggested response" />
                  <Step n="5" dark={dark} text="DCS routes to the appropriate handler and sends the response" />
                  <Step n="6" dark={dark} text="Interaction logged to debtor's chat history and database" />
                </div>

                <H3 dark={dark}>Intent classifications</H3>
                <CodeBlock dark={dark} language="intents" code={`full_payment         → STK push fires for full outstanding amount
partial_payment      → STK push fires for debtor's proposed amount
payment_plan_request → AI generates a payment plan and sends schedule
dispute              → Escalation message sent, flagged for manual review
hardship             → Empathetic response + flexible plan offered
inquiry              → Account summary (balance, due date) sent
general              → Menu response with options 1–4`} />

                <H3 dark={dark}>AI analysis object</H3>
                <CodeBlock dark={dark} language="javascript" code={`{
  paymentIntent: "full_payment",
  emotionalTone: "cooperative",   // cooperative | hostile | distressed | neutral
  urgency: "high",                // high | medium | low
  proposedAmount: 2500,           // KES amount or null
  confidence: 0.92,               // 0–1
  keyPoints: ["wants to pay today"],
  responseMessage: "Asante! Nitatuma ombi...",
}`} />

                <H3 dark={dark}>Unknown debtors</H3>
                <P dark={dark}>If a message comes from a number not in your database, DCS automatically creates a new debtor profile, sends a welcome message, and adds the entry to your Debtors list for you to update.</P>
              </DocSection>

              {/* 7. PAYMENT PLANS */}
              <DocSection id="payments">
                <H2 dark={dark}>Payment Plans</H2>
                <P dark={dark}>Payment plans can be created automatically by the AI or manually from the dashboard.</P>

                <H3 dark={dark}>AI-generated plans</H3>
                <P dark={dark}>When the AI detects a <code className="font-mono text-cyan-500 text-xs">payment_plan_request</code>, it automatically: calculates instalments from the outstanding balance (or debtor's proposed amount), proposes a frequency, creates the plan in the database, sends the schedule via WhatsApp, and schedules automated reminders for each instalment date.</P>

                <H3 dark={dark}>Manual plan creation</H3>
                <P dark={dark}>From a debtor's profile → <Strong dark={dark}>Add Payment Plan</Strong> → fill in total amount, instalment amount, frequency, and first payment date. The system calculates the number of instalments automatically.</P>

                <H3 dark={dark}>Plan statuses</H3>
                <CodeBlock dark={dark} language="statuses" code={`ACTIVE    → Running. Instalments being tracked.
COMPLETED → All instalments paid. Debt settled automatically.
CANCELLED → Cancelled manually or debtor defaulted.`} />
              </DocSection>

              {/* 8. TEAM */}
              <DocSection id="team">
                <H2 dark={dark}>Team & Roles</H2>
                <P dark={dark}>DCS uses two roles: <Strong dark={dark}>Admin</Strong> (full access) and <Strong dark={dark}>Collector</Strong> (restricted to assigned debtors).</P>

                <H3 dark={dark}>Role permissions</H3>
                <CodeBlock dark={dark} language="permissions" code={`ADMIN
├── Full access to all debtors and debts
├── Add / remove Collectors
├── Billing and subscription settings
├── Organisation-wide reminder defaults
└── Full audit logs

COLLECTOR
├── View and manage assigned debtors
├── Send manual reminders
├── Update debt statuses and amounts
├── View their debtors' chat logs
└── No access to: billing, settings, other collectors' data`} />

                <H3 dark={dark}>Adding a team member</H3>
                <div className="space-y-3">
                  <Step n="1" dark={dark} text="Settings → Team → Invite Collector" />
                  <Step n="2" dark={dark} text="Enter their email and click Send Invite" />
                  <Step n="3" dark={dark} text="They receive a secure link to set their password and log in" />
                </div>
              </DocSection>

              {/* 9. API */}
              <DocSection id="api">
                <H2 dark={dark}>API Reference</H2>
                <P dark={dark}>DCS exposes a REST API. All endpoints require a JWT Bearer token except the public webhook endpoints.</P>

                <H3 dark={dark}>Authentication</H3>
                <CodeBlock dark={dark} language="bash" code={`# Get your token
curl -X POST https://your-domain.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"yourpassword"}'

# Use the token
curl https://your-domain.com/api/debtors \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`} />

                <H3 dark={dark}>Key endpoints</H3>
                <CodeBlock dark={dark} language="endpoints" code={`# Auth
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Debtors
GET    /api/debtors
POST   /api/debtors
GET    /api/debtors/:id
PUT    /api/debtors/:id
DELETE /api/debtors/:id
GET    /api/debtors/:id/chats

# Debts
GET    /api/debts
POST   /api/debts
PUT    /api/debts/:id
GET    /api/debts/dashboard-stats
GET    /api/debts/bulk-summary

# WhatsApp
POST   /api/whatsapp/send-to-debtor/:id
POST   /api/whatsapp/send
GET    /api/whatsapp/webhook    (public — verification)
POST   /api/whatsapp/webhook    (public — incoming messages)

# M-Pesa
POST   /api/mpesa/stk-push
POST   /api/mpesa/callback      (public — Safaricom callback)

# Notifications
GET    /api/notifications/statuses
PUT    /api/notifications/:id/read`} />

                <H3 dark={dark}>Error format</H3>
                <CodeBlock dark={dark} language="json" code={`{
  "success": false,
  "message": "Descriptive error message",
  "errors": []  // Optional validation errors

  // HTTP codes:
  // 400 — Bad request / validation error
  // 401 — Unauthorized (missing/invalid token)
  // 403 — Forbidden (insufficient role)
  // 404 — Not found
  // 500 — Internal server error
}`} />
                <Callout type="info" dark={dark}>A full Postman collection with example payloads is available on request — email <strong className="text-cyan-400">support@dcs.co.ke</strong>.</Callout>
              </DocSection>

            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

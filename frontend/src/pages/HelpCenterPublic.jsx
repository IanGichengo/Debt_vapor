import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Search, MessageSquare, CreditCard, Brain, RefreshCw, Users, Zap, Shield, FileText, ArrowRight, ChevronDown, ChevronUp, BookOpen, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

function useInView(t = 0.1) {
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
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, transform: inView ? "translateY(0)" : "translateY(24px)", opacity: inView ? 1 : 0, transition: "transform 0.6s cubic-bezier(.22,1,.36,1), opacity 0.6s ease" }} className={className}>
      {children}
    </div>
  );
}

function FAQItem({ question, answer, dark, visible }) {
  const [open, setOpen] = useState(false);
  if (!visible) return null;
  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${dark ? open ? "border-cyan-500/20 bg-[#0f1929]" : "border-white/[0.06] bg-[#0f1929]" : open ? "border-cyan-200 bg-white shadow-md" : "border-gray-100 bg-white shadow-sm"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className={`font-medium text-sm ${dark ? "text-white" : "text-slate-900"}`}>{question}</span>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${open ? dark ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-600" : dark ? "border-white/10 text-slate-500" : "border-gray-200 text-gray-400"}`}>
          <span className="text-lg leading-none font-light">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && <div className={`px-5 pb-5 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>{answer}</div>}
    </div>
  );
}

function GuideCard({ icon: Icon, title, tag, readTime, dark, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"}`}>
      {/* Header */}
      <button onClick={() => setOpen(!open)} className="w-full p-6 text-left group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${dark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
              <Icon className={`w-5 h-5 ${dark ? "text-cyan-400" : "text-cyan-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${dark ? "border-white/[0.06] text-slate-500 bg-white/[0.03]" : "border-gray-100 text-slate-400 bg-slate-50"}`}>{tag}</span>
                <span className={`text-[10px] ${dark ? "text-slate-600" : "text-slate-400"}`}>{readTime}</span>
              </div>
              <h3 className={`font-display font-semibold text-base ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
            </div>
          </div>
          <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 mt-1 ${open ? dark ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-cyan-50 border-cyan-200 text-cyan-600" : dark ? "border-white/10 text-slate-500" : "border-gray-200 text-gray-400"}`}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className={`px-6 pb-7 border-t ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
          <div className={`pt-5 text-sm leading-relaxed space-y-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {content(dark)}
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ n, text, dark }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${dark ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-200"}`}>{n}</span>
      <span>{text}</span>
    </div>
  );
}

function Li({ children }) { return <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5 shrink-0">›</span><span>{children}</span></li>; }

function Strong({ children, dark }) { return <strong className={dark ? "text-slate-200 font-semibold" : "text-slate-700 font-semibold"}>{children}</strong>; }

function InlineCode({ children }) { return <code className="font-mono text-xs text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">{children}</code>; }

export default function HelpCenter() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const categories = [
    { id: 'all',      label: 'All Topics',      icon: HelpCircle   },
    { id: 'setup',    label: 'Getting Started', icon: Zap          },
    { id: 'whatsapp', label: 'WhatsApp',        icon: MessageSquare},
    { id: 'mpesa',    label: 'M-Pesa',          icon: CreditCard   },
    { id: 'ai',       label: 'AI',              icon: Brain        },
    { id: 'debtors',  label: 'Debtors',         icon: Users        },
    { id: 'billing',  label: 'Billing',         icon: FileText     },
    { id: 'security', label: 'Security',        icon: Shield       },
  ];

  const guides = [
    {
      icon: Zap, title: "Quick Start: Your first reminder in 10 minutes", tag: "Getting Started", readTime: "5 min read",
      content: (dark) => (
        <>
          <p>This guide gets you from a fresh DCS account to a working WhatsApp reminder as fast as possible.</p>
          <div className="space-y-3 pt-1">
            <Step n="1" dark={dark} text={<span>Create your account at <InlineCode>dcs.co.ke/signup</InlineCode> and verify your email.</span>} />
            <Step n="2" dark={dark} text="Log in and go to Debtors → Add Debtor. Enter the debtor's name and phone number in international format (e.g. 254712345678)." />
            <Step n="3" dark={dark} text="On the debtor's profile, click Add Debt. Enter the amount owed, the due date, and the creditor name." />
            <Step n="4" dark={dark} text="Click Send Reminder from the debtor's profile. Confirm the message preview." />
            <Step n="5" dark={dark} text="Check your backend logs — you should see POST /api/whatsapp/send-to-debtor/:id — and the debtor's WhatsApp should receive the message within seconds." />
          </div>
          <div className={`rounded-xl border px-4 py-3 mt-4 text-xs ${dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-300" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
            💡 If the message doesn't arrive, verify your <InlineCode>WHATSAPP_TOKEN</InlineCode> and <InlineCode>WHATSAPP_PHONE_ID</InlineCode> environment variables are set correctly and your server is running.
          </div>
        </>
      )
    },
    {
      icon: MessageSquare, title: "Setting up your WhatsApp Business webhook", tag: "WhatsApp", readTime: "8 min read",
      content: (dark) => (
        <>
          <p>DCS requires a Meta WhatsApp Business Cloud API connection to send and receive messages. Here is the full setup.</p>
          <p><Strong dark={dark}>What you need first:</Strong> A Meta Developer account, a WhatsApp Business phone number, and your DCS backend running with a public HTTPS URL (use ngrok for local development).</p>
          <div className="space-y-3 pt-1">
            <Step n="1" dark={dark} text={<span>Go to <InlineCode>developers.facebook.com</InlineCode> → Create App → Business → add WhatsApp product.</span>} />
            <Step n="2" dark={dark} text="Under WhatsApp → API Setup, copy your Access Token and Phone Number ID. Add them to your .env as WHATSAPP_TOKEN and WHATSAPP_PHONE_ID." />
            <Step n="3" dark={dark} text={<span>Go to WhatsApp → Configuration → Webhook. Set the Callback URL to <InlineCode>https://your-url/api/whatsapp/webhook</InlineCode> and the Verify Token to whatever you set in <InlineCode>WHATSAPP_VERIFY_TOKEN</InlineCode>.</span>} />
            <Step n="4" dark={dark} text="Click Verify and Save. Your server must be running — Meta will send a GET request to confirm you own the URL." />
            <Step n="5" dark={dark} text="Go to Webhook Fields → Manage → subscribe to the messages field. Without this, debtor replies won't reach your server." />
            <Step n="6" dark={dark} text="Run the WABA subscription command (see Documentation → WhatsApp Setup) to link your Business Account to the app." />
            <Step n="7" dark={dark} text="Switch your Meta App from Development to Live Mode to receive messages from real debtors." />
          </div>
          <div className={`rounded-xl border px-4 py-3 mt-4 text-xs ${dark ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            ⚠️ In Development Mode, only verified test numbers can trigger webhook events. You must switch to Live Mode to receive real debtor replies.
          </div>
        </>
      )
    },
    {
      icon: CreditCard, title: "Connecting M-Pesa for automatic STK push", tag: "M-Pesa", readTime: "10 min read",
      content: (dark) => (
        <>
          <p>M-Pesa STK push allows DCS to send a payment request directly to a debtor's phone when they signal they're ready to pay. Here's how to set it up.</p>
          <p><Strong dark={dark}>What you need:</Strong> A Safaricom Paybill or Till Number, access to the Daraja API portal, and a public HTTPS callback URL.</p>
          <div className="space-y-3 pt-1">
            <Step n="1" dark={dark} text={<span>Register at <InlineCode>developer.safaricom.co.ke</InlineCode> and create a new app with the Lipa Na M-Pesa API enabled.</span>} />
            <Step n="2" dark={dark} text="Copy your Consumer Key and Consumer Secret from the app dashboard. Add them to your .env." />
            <Step n="3" dark={dark} text="For sandbox testing, use Shortcode 174379 and the test passkey from the Daraja documentation." />
            <Step n="4" dark={dark} text={<span>Set your callback URL: <InlineCode>MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback</InlineCode>. This must be publicly accessible — use ngrok locally.</span>} />
            <Step n="5" dark={dark} text="Test by opening any debtor profile and clicking Send Payment Request. Use the Daraja test number 254708374149 with PIN 12345." />
            <Step n="6" dark={dark} text="For production, apply for a Go Live approval on the Daraja portal and swap your credentials. Change MPESA_ENVIRONMENT to production." />
          </div>
          <p className="pt-2"><Strong dark={dark}>How STK push works in practice:</Strong> When a debtor replies "I want to pay now", the AI classifies this as <InlineCode>full_payment</InlineCode> intent and DCS automatically sends an STK push to the debtor's phone. They see an M-Pesa PIN prompt. The money goes directly to your Paybill — DCS never touches the funds.</p>
        </>
      )
    },
    {
      icon: Brain, title: "Understanding how AI analyses debtor replies", tag: "AI & Automation", readTime: "6 min read",
      content: (dark) => (
        <>
          <p>Every time a debtor replies to a WhatsApp message, Gemini AI reads the message and decides what to do next. Here's exactly how it works.</p>
          <p><Strong dark={dark}>Step by step:</Strong></p>
          <div className="space-y-3 pt-1">
            <Step n="1" dark={dark} text="Debtor's WhatsApp reply arrives at your server via the webhook." />
            <Step n="2" dark={dark} text="DCS looks up the debtor by phone number. If not found, a new profile is created automatically." />
            <Step n="3" dark={dark} text="The message text plus debt context (amount, due date, debtor name) is sent to Gemini AI." />
            <Step n="4" dark={dark} text="Gemini returns: the payment intent, emotional tone, urgency, any proposed amount, and a suggested response." />
            <Step n="5" dark={dark} text="DCS routes to the correct handler — payment, hardship, dispute, etc." />
            <Step n="6" dark={dark} text="The appropriate action fires (STK push, payment plan creation, or informational reply)." />
          </div>
          <p className="pt-2"><Strong dark={dark}>The 7 intents the AI can classify:</Strong></p>
          <ul className="space-y-1.5 pl-1 pt-1">
            <Li><InlineCode>full_payment</InlineCode> — Debtor says they'll pay everything. STK push fires for the full outstanding amount.</Li>
            <Li><InlineCode>partial_payment</InlineCode> — Debtor offers a specific smaller amount. STK push fires for that amount.</Li>
            <Li><InlineCode>payment_plan_request</InlineCode> — Debtor asks for instalments. AI creates a plan and sends the schedule.</Li>
            <Li><InlineCode>dispute</InlineCode> — Debtor says the debt is wrong. Escalation message sent, flagged in dashboard.</Li>
            <Li><InlineCode>hardship</InlineCode> — Debtor signals they're struggling financially. Empathetic response, flexible plan offered.</Li>
            <Li><InlineCode>inquiry</InlineCode> — Debtor asks about their balance or account. Full account summary sent.</Li>
            <Li><InlineCode>general</InlineCode> — Anything else. Menu response with 4 options.</Li>
          </ul>
          <div className={`rounded-xl border px-4 py-3 mt-4 text-xs ${dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-300" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}>
            💡 You can see every AI classification in the debtor's Chats tab, including the confidence score. If you see a pattern of misclassification, contact support — we use this feedback to improve the model.
          </div>
        </>
      )
    },
    {
      icon: RefreshCw, title: "Configuring automated reminder rules", tag: "Automation", readTime: "4 min read",
      content: (dark) => (
        <>
          <p>The DCS reminder scheduler runs every hour and automatically sends WhatsApp reminders to eligible debtors. Here's how to configure it for each debtor — and at the organisation level.</p>
          <p><Strong dark={dark}>Per-debtor settings:</Strong> Open a debtor's profile and go to the Reminder Settings tab. You'll see three options:</p>
          <ul className="space-y-1.5 pl-1 pt-1">
            <Li><Strong dark={dark}>Enabled</Strong> — toggle on or off for this debtor.</Li>
            <Li><Strong dark={dark}>Interval</Strong> — how many days between reminders. Options: 3, 7, 14, or 30 days.</Li>
            <Li><Strong dark={dark}>Max Reminders</Strong> — maximum total reminders to send before stopping. Options: 1, 2, 3, 5, or 10.</Li>
          </ul>
          <p className="pt-2"><Strong dark={dark}>Example:</Strong> Interval 7 days + Max 3 reminders = debtor gets a reminder on day 0, day 7, and day 14. On day 21, the scheduler sees the maximum has been reached and skips this debtor permanently.</p>
          <p><Strong dark={dark}>Organisation defaults:</Strong> Go to Settings → Default Reminder Settings. Any debtor you create after saving these defaults will automatically inherit your settings — no need to configure each one manually.</p>
          <p><Strong dark={dark}>Duplicate protection:</Strong> If you manually send a reminder to a debtor today and the scheduler runs tonight, it won't send a second message. DCS tracks the last send time and respects the interval. You'll see a <InlineCode>Duplicate reminder blocked</InlineCode> warning in your server logs if this fires.</p>
        </>
      )
    },
    {
      icon: Users, title: "Managing your team — adding and removing collectors", tag: "Team", readTime: "3 min read",
      content: (dark) => (
        <>
          <p>DCS has two roles: <Strong dark={dark}>Admin</Strong> (you) and <Strong dark={dark}>Collectors</Strong> (your team). Collectors can manage debtors and send reminders but cannot access billing, settings, or each other's data.</p>
          <p><Strong dark={dark}>To add a collector:</Strong></p>
          <div className="space-y-3 pt-1">
            <Step n="1" dark={dark} text="Go to Settings → Team → Invite Collector." />
            <Step n="2" dark={dark} text="Enter their email address and click Send Invite." />
            <Step n="3" dark={dark} text="They'll receive an email with a secure link to set their password. Once they log in, they appear in your team list." />
          </div>
          <p className="pt-2"><Strong dark={dark}>To remove a collector:</Strong> Go to Settings → Team, find their name, and click Remove. Their account is deactivated immediately. All debtors and data they created remain in the system — nothing is deleted.</p>
          <p><Strong dark={dark}>What collectors can and can't do:</Strong></p>
          <ul className="space-y-1.5 pl-1 pt-1">
            <Li>✅ View and update debtors in their account</Li>
            <Li>✅ Send reminders and manual WhatsApp messages</Li>
            <Li>✅ View chat logs for their debtors</Li>
            <Li>❌ Cannot access billing or change subscription</Li>
            <Li>❌ Cannot view other collectors' debtors</Li>
            <Li>❌ Cannot change organisation settings or defaults</Li>
          </ul>
        </>
      )
    },
  ];

  const faqs = [
    { category: 'setup',    question: "How do I get started with DCS?",                         answer: "Sign up, verify your email, log in, go to Debtors → Add Debtor, create your first debtor, then click Send Reminder from their profile. The full setup takes under 10 minutes. For WhatsApp and M-Pesa integration, follow the guides above." },
    { category: 'setup',    question: "What do I need before I can use DCS?",                    answer: "You need: (1) a WhatsApp Business number linked to Meta's Cloud API, (2) a Safaricom M-Pesa Paybill or Till Number, and (3) your debtors' names and WhatsApp phone numbers. DCS handles the rest." },
    { category: 'setup',    question: "Can I import debtors in bulk?",                           answer: "Bulk import is on our roadmap. Currently debtors are added one at a time. If you have a large portfolio, email support@dcs.co.ke and we'll assist with a manual import during onboarding." },
    { category: 'whatsapp', question: "What number do messages come from?",                      answer: "Messages are sent from your own WhatsApp Business number — not a DCS number. DCS is the engine behind it. Debtors see your business identity." },
    { category: 'whatsapp', question: "What happens if a debtor blocks the number?",             answer: "Messages will fail to deliver silently. DCS logs the failed delivery. That debtor will appear with no response in the chat log — flag them for manual follow-up via phone." },
    { category: 'whatsapp', question: "How many reminders can I send per debtor?",               answer: "You control this via the reminder settings on each debtor's profile. Set the interval (days between reminders) and max reminders. Once the max is reached, the scheduler stops for that debtor automatically." },
    { category: 'mpesa',    question: "Does DCS hold my M-Pesa payments?",                      answer: "No. DCS initiates the STK push but money goes directly from the debtor to your Paybill or Till Number. DCS never holds, processes, or settles funds." },
    { category: 'mpesa',    question: "What if the STK push fails?",                            answer: "DCS automatically sends the debtor a WhatsApp message with manual M-Pesa instructions including your Paybill, account reference, and exact amount. No payment opportunity is lost." },
    { category: 'mpesa',    question: "Does DCS confirm when payment is received?",              answer: "Yes — Safaricom sends a callback to DCS when payment is confirmed. The transaction is logged, the debt balance updated, and the debtor receives a WhatsApp confirmation." },
    { category: 'ai',       question: "What if the AI gets the intent wrong?",                  answer: "For edge cases, the AI defaults to a helpful general response. You can see every classification in the debtor's Chats tab. If you notice a pattern, contact support — we use feedback to improve the model." },
    { category: 'ai',       question: "Is debtor message content sent to Google?",              answer: "Yes — message text is sent to Google's Gemini API for analysis. This is disclosed in our Privacy Policy. Debtor identity details (name, ID) are not sent — only message text and debt context." },
    { category: 'ai',       question: "Can I disable AI responses and reply manually?",         answer: "Manual reply mode is on our near-term roadmap. Currently AI responses are automatic. You can send a custom message from the debtor's profile page which overrides the next scheduled AI response." },
    { category: 'debtors',  question: "What phone number format should I use?",                 answer: "Use 254712345678 (international, no plus sign). DCS also accepts +254712345678 and 0712345678 — all three formats are normalised when matching incoming replies." },
    { category: 'debtors',  question: "What happens if an unknown number messages us?",         answer: "DCS automatically creates a new debtor profile with their phone number, sends a welcome message, and adds the entry to your Debtors list for you to update with full details." },
    { category: 'debtors',  question: "How do I mark a debt as settled?",                       answer: "Open the debtor's profile → go to the debt record → click Mark as Settled. Once settled, automated reminders stop automatically for that debt." },
    { category: 'billing',  question: "How do I pay for my DCS subscription?",                  answer: "Via M-Pesa Paybill or card (Visa/Mastercard). All prices are in KES and subject to 16% VAT. You'll receive a receipt via email after each payment." },
    { category: 'billing',  question: "What happens if my payment fails?",                      answer: "DCS retries automatically up to 3 times over 7 days. After 3 failures, your account is suspended (not deleted) until payment is received. Data is retained for 30 days." },
    { category: 'billing',  question: "How do I cancel my subscription?",                       answer: "Go to Settings → Billing → Cancel Subscription. Cancellation takes effect at end of current billing period. You retain full access until that date. Data held for 30 days after expiry." },
    { category: 'security', question: "How is my data protected?",                              answer: "All data is encrypted in transit (HTTPS/TLS) and at rest. Passwords are hashed. JWT tokens have defined expiry. Role-based access means Collectors only see their own debtors." },
    { category: 'security', question: "What should I do if my account is compromised?",         answer: "Immediately go to Settings → Security → Change Password. Then review Settings → Team and remove unfamiliar users. Email support@dcs.co.ke with subject 'Account Security' for an audit." },
  ];

  const filtered = faqs.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = q === '' || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .font-display{font-family:'Syne',sans-serif}.font-body{font-family:'DM Sans',sans-serif}
        .text-gradient{background:linear-gradient(135deg,#67e8f9 0%,#a78bfa 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .text-gradient-light{background:linear-gradient(135deg,#0891b2 0%,#7c3aed 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .glow-cyan{box-shadow:0 0 40px rgba(6,182,212,.2)}.glow-cyan:hover{box-shadow:0 0 60px rgba(6,182,212,.35)}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.7);opacity:0}}
        .pulse-dot::before{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(6,182,212,.4);animation:pulse-ring 2.5s ease-out infinite}
        .pulse-dot::after{content:'';position:absolute;inset:-14px;border-radius:50%;border:1px solid rgba(6,182,212,.15);animation:pulse-ring 2.5s .8s ease-out infinite}
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* HERO */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-32 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
          {!dark && <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#0891b2 1px,transparent 1px),linear-gradient(90deg,#0891b2 1px,transparent 1px)", backgroundSize: "60px 60px" }} />}

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transition: "all 0.6s ease 0.1s" }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 ${dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" : "border-cyan-200 bg-cyan-50 text-cyan-700"}`}>
              <span className="pulse-dot relative flex h-2 w-2"><span className={`w-2 h-2 rounded-full block ${dark ? "bg-cyan-400" : "bg-cyan-500"}`} /></span>
              Support & Guides
            </div>
            <h1 style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }} className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              How can we <span className={dark ? "text-gradient" : "text-gradient-light"}>help you?</span>
            </h1>
            <p style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }} className={`text-base max-w-xl mx-auto leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Browse our setup guides, search FAQs, or reach out directly. We're a small team — we actually respond.
            </p>

            {/* Search */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.5s" }} className="relative max-w-xl mx-auto">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? "text-slate-500" : "text-slate-400"}`} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs — try 'M-Pesa', 'WhatsApp', 'AI'..."
                className={`w-full pl-12 pr-5 py-4 rounded-2xl border text-sm outline-none transition-all duration-200 ${dark ? "bg-[#0f1929] border-white/[0.08] text-white focus:border-cyan-500/40" : "bg-white border-gray-200 text-slate-900 focus:border-cyan-300 shadow-sm"}`} />
              {search && <button onClick={() => setSearch('')} className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>clear</button>}
            </div>
          </div>
        </section>

        {/* GUIDES */}
        <section className={`py-20 border-y ${dark ? "border-white/[0.04] bg-[#0a1120]" : "border-gray-100 bg-white"}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FadeUp className="text-center mb-10">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Step-by-Step Guides</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Getting started — <span className={dark ? "text-gradient" : "text-gradient-light"}>click to read</span>
              </h2>
              <p className={`text-sm mt-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>Click any guide to expand the full instructions inline.</p>
            </FadeUp>

            <div className="space-y-4">
              {guides.map((g, i) => (
                <FadeUp key={g.title} delay={i * 60}>
                  <GuideCard {...g} dark={dark} />
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <FadeUp className="text-center mb-10">
            <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Frequently asked <span className={dark ? "text-gradient" : "text-gradient-light"}>questions</span>
            </h2>
          </FadeUp>

          {/* Category pills */}
          <FadeUp delay={100}>
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${activeCategory === cat.id ? dark ? "bg-cyan-500 text-[#070d18] border-cyan-500" : "bg-cyan-500 text-white border-cyan-500 shadow" : dark ? "border-white/[0.08] text-slate-400 hover:text-white bg-white/[0.03]" : "border-gray-200 text-slate-500 hover:text-slate-800 bg-white"}`}>
                  <cat.icon className="w-3.5 h-3.5" />{cat.label}
                </button>
              ))}
            </div>
          </FadeUp>

          {search && <FadeUp><p className={`text-sm mb-4 ${dark ? "text-slate-500" : "text-slate-400"}`}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<span className={dark ? "text-slate-200" : "text-slate-700"}>{search}</span>"</p></FadeUp>}

          <div className="space-y-3">
            {filtered.length > 0
              ? filtered.map((faq, i) => <FadeUp key={i} delay={i * 40}><FAQItem {...faq} dark={dark} visible={true} /></FadeUp>)
              : (
                <FadeUp>
                  <div className={`rounded-2xl border p-12 text-center ${dark ? "border-white/[0.06] bg-[#0f1929]" : "border-gray-100 bg-white"}`}>
                    <HelpCircle className={`w-10 h-10 mx-auto mb-4 ${dark ? "text-slate-600" : "text-slate-300"}`} />
                    <p className={`font-display font-semibold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}>No results found</p>
                    <p className={`text-sm mb-6 ${dark ? "text-slate-500" : "text-slate-400"}`}>Try a different search or browse all topics.</p>
                    <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold text-sm rounded-xl transition-all duration-200">Clear filters</button>
                  </div>
                </FadeUp>
              )
            }
          </div>
        </section>

        {/* CONTACT */}
        <section className={`py-20 ${dark ? "bg-[#0a1120]" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto px-6">
            <FadeUp className="text-center mb-10">
              <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">Still Stuck?</p>
              <h2 className="font-display text-3xl font-bold">Reach out — <span className={dark ? "text-gradient" : "text-gradient-light"}>we respond fast.</span></h2>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Mail,         title: "Email Support",      body: "Send us a message and we'll get back to you within one business day.", action: "support@dcs.co.ke", href: "mailto:support@dcs.co.ke", accent: dark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600" },
                { icon: MessageSquare,title: "WhatsApp Us",        body: "Quick questions during Nairobi business hours. Usually online Mon–Fri 8am–6pm EAT.", action: "Chat on WhatsApp", href: "https://wa.me/254700000000", accent: dark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600" },
                { icon: BookOpen,     title: "Full Documentation", body: "Technical docs covering API, webhooks, and advanced configuration.", action: "Browse Docs", href: "/documentation", accent: dark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600" },
              ].map(({ icon: Icon, title, body, action, href, accent }) => (
                <FadeUp key={title}>
                  <div className={`group rounded-2xl border p-7 h-full transition-all duration-300 ${dark ? "bg-[#0f1929] border-white/[0.06] hover:border-cyan-500/20" : "bg-slate-50 border-gray-100 hover:border-cyan-200 hover:bg-white hover:shadow-md"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${accent}`}><Icon className="w-6 h-6" /></div>
                    <h3 className={`font-display font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                    <p className={`text-sm leading-relaxed mb-5 ${dark ? "text-slate-400" : "text-slate-500"}`}>{body}</p>
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group/link ${dark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"}`}>
                      {action}<ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={200}><p className={`text-center text-xs mt-8 ${dark ? "text-slate-600" : "text-slate-400"}`}>DCS is built in Nairobi 🇰🇪 · Support hours: Mon–Fri, 8am–6pm EAT · We aim to respond within 4 business hours</p></FadeUp>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <FadeUp>
            <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
              style={dark ? { background: "linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.25),rgba(167,139,250,0.25)) border-box", border: "1px solid transparent" } : { background: "#f8faff", border: "1px solid transparent", boxShadow: "0 8px 40px rgba(6,182,212,0.08)" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Ready to try DCS?</h2>
                <p className={`max-w-md mx-auto mb-8 text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>Request early access and we'll walk you through the full setup — WhatsApp, M-Pesa, and everything in between.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => { navigate('/signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan">
                    Request Early Access <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`inline-flex items-center justify-center gap-2 px-8 py-4 border font-medium rounded-xl transition-all duration-300 ${dark ? "border-white/10 text-slate-300 hover:border-white/20 hover:text-white" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"}`}>
                    Book a Demo
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

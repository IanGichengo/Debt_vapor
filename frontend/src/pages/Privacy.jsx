import { useState, useEffect, useRef } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
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

// ── Section block ─────────────────────────────────────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Privacy() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const sections = [
    { id: 'overview',     label: 'Overview'              },
    { id: 'data-collect', label: 'Data We Collect'       },
    { id: 'data-use',     label: 'How We Use Data'       },
    { id: 'data-storage', label: 'Storage & Security'    },
    { id: 'whatsapp',     label: 'WhatsApp & Meta'       },
    { id: 'mpesa',        label: 'M-Pesa & Payments'     },
    { id: 'third-party',  label: 'Third-Party Services'  },
    { id: 'rights',       label: 'Your Rights'           },
    { id: 'retention',    label: 'Data Retention'        },
    { id: 'children',     label: 'Children\'s Privacy'   },
    { id: 'changes',      label: 'Policy Changes'        },
    { id: 'contact',      label: 'Contact Us'            },
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
        .pulse-dot::before { content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(6,182,212,0.4); animation: pulse-ring 2.5s ease-out infinite; }
        .pulse-dot::after  { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid rgba(6,182,212,0.15); animation: pulse-ring 2.5s 0.8s ease-out infinite; }
      `}</style>

      <div className={`font-body min-h-screen transition-colors duration-300 ${dark ? "bg-[#070d18] text-white" : "bg-slate-50 text-slate-900"}`}>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-cyan-500/8" : "bg-cyan-400/15"}`} />
          <div className={`absolute top-32 right-1/3 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/10"}`} />
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
              Data Protection
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Privacy{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>Policy</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-base max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              This policy explains what data DCS collects, how it is used, and how it is protected. We handle debtor data on behalf of our clients — we take that responsibility seriously.
            </p>

            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}
              className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl text-xs border ${
                dark ? "border-white/[0.06] bg-white/[0.03] text-slate-500" : "border-gray-100 bg-white text-slate-400"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-500" />
              Last updated: {lastUpdated}
            </div>
          </div>
        </section>

        {/* ── BODY: sidebar + content ── */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="flex gap-10 items-start">

            {/* Sticky sidebar nav */}
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
                          ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500"
                          : "bg-cyan-50 text-cyan-600 border-l-2 border-cyan-500"
                        : dark
                          ? "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                          : "text-slate-400 hover:text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-5">

              <Section id="overview" title="1. Overview" dark={dark}>
                <p>
                  Debt Collection System ("DCS", "we", "our") is a software platform developed and operated in Kenya. We provide AI-powered debt collection tools to businesses including microfinance institutions, SACCOs, landlords, SMEs, and financial lenders ("Clients").
                </p>
                <p>
                  This Privacy Policy applies to all users of the DCS platform — including Clients (businesses using DCS) and Debtors (individuals whose data is processed through the platform on behalf of our Clients). It covers data collected through our web application, API, and WhatsApp integration.
                </p>
                <p>
                  By using DCS, you agree to the practices described in this policy. If you are a Debtor and have questions about why you received a WhatsApp message, it is because a business you owe money to is using DCS to manage their collections. Contact that business directly for disputes regarding the underlying debt.
                </p>
              </Section>

              <Section id="data-collect" title="2. Data We Collect" dark={dark}>
                <p><strong className={dark ? "text-slate-200" : "text-slate-700"}>From Clients (businesses):</strong></p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Account registration details: name, business name, email address, password (hashed)</li>
                  <li>Role and permissions within the platform (Admin or Collector)</li>
                  <li>Payment and billing information (processed via M-Pesa or card — we do not store raw card data)</li>
                  <li>Usage data: login times, pages visited, actions performed within the dashboard</li>
                </ul>

                <p className="pt-2"><strong className={dark ? "text-slate-200" : "text-slate-700"}>From Debtors (processed on behalf of Clients):</strong></p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Full name and phone number (required to send WhatsApp messages)</li>
                  <li>Email address and National ID (optional, if provided by the Client)</li>
                  <li>Debt details: amount owed, due dates, creditor name, payment history</li>
                  <li>WhatsApp message content: incoming replies from the debtor and outgoing AI-generated responses</li>
                  <li>M-Pesa transaction data: STK push status, transaction reference numbers, payment amounts</li>
                  <li>AI interaction metadata: payment intent classification, emotional tone signals, response confidence scores</li>
                </ul>

                <p className="pt-2"><strong className={dark ? "text-slate-200" : "text-slate-700"}>Automatically collected:</strong></p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>IP address and browser/device information for security and fraud prevention</li>
                  <li>Server logs including timestamps and HTTP request metadata</li>
                </ul>
              </Section>

              <Section id="data-use" title="3. How We Use Data" dark={dark}>
                <p>We use collected data strictly to provide and improve the DCS platform. Specifically:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Debt collection automation:</strong> Processing WhatsApp messages, generating AI responses, and triggering M-Pesa STK pushes on behalf of our Clients</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Reminder scheduling:</strong> Sending automated payment reminders at intervals configured by the Client</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Account management:</strong> Creating and maintaining Client accounts, roles, and permissions</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Analytics and reporting:</strong> Providing Clients with dashboards showing collection performance, payment trends, and debtor interaction logs</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Security and compliance:</strong> Detecting fraud, preventing unauthorised access, and maintaining audit trails</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Product improvement:</strong> Anonymised, aggregated usage data may be used to improve DCS features — no individual debtor data is used for this purpose</li>
                </ul>
                <p>We do <strong className={dark ? "text-slate-200" : "text-slate-700"}>not</strong> sell, rent, or share personally identifiable data with any third party for marketing or advertising purposes.</p>
              </Section>

              <Section id="data-storage" title="4. Storage & Security" dark={dark}>
                <p>
                  All DCS data is stored in a PostgreSQL database with encryption at rest. Data in transit is protected via HTTPS/TLS on all endpoints. Access to the database is restricted to authenticated application processes only.
                </p>
                <p>
                  Access to debtor and debt data within the platform is governed by role-based access control (RBAC). Collectors can only access debtors assigned to their account. Admins have full access within their organisation. No cross-organisation data access is permitted.
                </p>
                <p>
                  Passwords are hashed using industry-standard algorithms and are never stored in plain text. API access is protected by JWT tokens with defined expiry periods.
                </p>
                <p>
                  We are actively working toward compliance with Kenya's <strong className={dark ? "text-slate-200" : "text-slate-700"}>Data Protection Act 2019</strong> and will notify affected users in the event of a data breach within the timeframes required by law.
                </p>
              </Section>

              <Section id="whatsapp" title="5. WhatsApp & Meta" dark={dark}>
                <p>
                  DCS integrates with the <strong className={dark ? "text-slate-200" : "text-slate-700"}>WhatsApp Business API</strong> provided by Meta Platforms, Inc. When a debtor receives or sends a WhatsApp message through DCS:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>The message is transmitted via Meta's servers to our webhook endpoint</li>
                  <li>The debtor's WhatsApp phone number is received and stored in our database as their contact identifier</li>
                  <li>Message content is processed by the Gemini AI engine to generate a response</li>
                  <li>Meta's own privacy policy governs the handling of message data on their infrastructure — we recommend reviewing it at <span className="text-cyan-500">meta.com/privacy</span></li>
                </ul>
                <p>
                  Debtors who do not wish to receive WhatsApp messages should contact the business that added them to the DCS platform. We will action removal requests from Clients within 48 hours.
                </p>
              </Section>

              <Section id="mpesa" title="6. M-Pesa & Payments" dark={dark}>
                <p>
                  DCS integrates with <strong className={dark ? "text-slate-200" : "text-slate-700"}>Safaricom M-Pesa</strong> via their Daraja API to initiate STK push payment requests. When a payment is triggered:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>The debtor's normalised M-Pesa phone number is sent to Safaricom to initiate the STK push</li>
                  <li>We receive and store the transaction reference number (CheckoutRequestID), payment status, and amount</li>
                  <li>We do <strong className={dark ? "text-slate-200" : "text-slate-700"}>not</strong> store M-Pesa PINs or any authentication credentials belonging to the debtor</li>
                  <li>Payment receipts and M-Pesa confirmation codes are stored for reconciliation and audit purposes</li>
                </ul>
                <p>
                  For Client billing (subscription payments), we process M-Pesa Paybill transactions. Billing records are retained for a minimum of 7 years in compliance with Kenyan tax regulations.
                </p>
              </Section>

              <Section id="third-party" title="7. Third-Party Services" dark={dark}>
                <p>DCS uses the following third-party services to operate the platform. Each has its own privacy policy:</p>
                <div className="space-y-3 pt-1">
                  {[
                    { name: "Google Gemini AI (via Gemini API)", purpose: "Analysing debtor message content and generating responses. Message text is sent to Google's API for processing.", link: "policies.google.com/privacy" },
                    { name: "Meta WhatsApp Business API", purpose: "Sending and receiving WhatsApp messages to and from debtors.", link: "meta.com/privacy" },
                    { name: "Safaricom M-Pesa (Daraja API)", purpose: "Initiating STK push payment requests on behalf of Clients.", link: "safaricom.co.ke/privacy" },
                    { name: "PostgreSQL / Database hosting provider", purpose: "Persistent storage of all platform data.", link: "" },
                  ].map(({ name, purpose, link }) => (
                    <div key={name} className={`rounded-xl p-4 border ${dark ? "border-white/[0.06] bg-white/[0.02]" : "border-gray-100 bg-slate-50"}`}>
                      <p className={`font-medium text-sm mb-1 ${dark ? "text-slate-200" : "text-slate-800"}`}>{name}</p>
                      <p className="text-xs">{purpose}</p>
                      {link && <p className="text-xs mt-1 text-cyan-500">{link}</p>}
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="rights" title="8. Your Rights" dark={dark}>
                <p>Under Kenya's Data Protection Act 2019, you have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Right of access:</strong> Request a copy of all personal data we hold about you</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Right to correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Right to deletion:</strong> Request deletion of your personal data, subject to legal retention requirements</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Right to object:</strong> Object to the processing of your data for specific purposes</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Right to data portability:</strong> Request your data in a structured, machine-readable format</li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at <span className="text-cyan-500">privacy@dcs.co.ke</span>. We will respond within <strong className={dark ? "text-slate-200" : "text-slate-700"}>21 days</strong> as required under the Act.
                </p>
                <p>
                  Note: If you are a Debtor, some data may be retained by our Client (the business that added you) even after deletion from DCS. Please contact the business directly for full data removal from their records.
                </p>
              </Section>

              <Section id="retention" title="9. Data Retention" dark={dark}>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Active debtor records:</strong> Retained for the duration of the Client's subscription and for 12 months after account closure</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>M-Pesa transaction records:</strong> Retained for 7 years for financial compliance</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>WhatsApp message logs:</strong> Retained for 12 months, then deleted or anonymised</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>AI interaction logs:</strong> Retained for 6 months for quality improvement, then deleted</li>
                  <li><strong className={dark ? "text-slate-200" : "text-slate-700"}>Server and access logs:</strong> Retained for 90 days for security monitoring</li>
                </ul>
                <p>Upon account deletion, Client data is purged within 30 days except where retention is required by law.</p>
              </Section>

              <Section id="children" title="10. Children's Privacy" dark={dark}>
                <p>
                  DCS is a business-to-business platform and is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If a debtor profile is created for someone under 18, Clients are responsible for ensuring they have lawful authority to process that data.
                </p>
                <p>
                  If you believe we have inadvertently collected data from a minor, please contact us at <span className="text-cyan-500">privacy@dcs.co.ke</span> and we will delete it promptly.
                </p>
              </Section>

              <Section id="changes" title="11. Policy Changes" dark={dark}>
                <p>
                  We may update this Privacy Policy as the platform evolves or as legal requirements change. When we make material changes, we will:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Update the "Last updated" date at the top of this page</li>
                  <li>Notify active Clients via email at least 14 days before the changes take effect</li>
                  <li>For significant changes, require re-acceptance of the updated policy on next login</li>
                </ul>
                <p>Continued use of DCS after the effective date constitutes acceptance of the revised policy.</p>
              </Section>

              <Section id="contact" title="12. Contact Us" dark={dark}>
                <p>For privacy-related enquiries, data subject requests, or to report a concern:</p>
                <div className={`mt-4 rounded-xl p-6 border space-y-2 ${
                  dark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-50 border-gray-100"
                }`}>
                  <p><strong className={dark ? "text-slate-200" : "text-slate-700"}>DCS — Data Protection Contact</strong></p>
                  <p>Email: <span className="text-cyan-500">privacy@dcs.co.ke</span></p>
                  <p>Platform: <span className="text-cyan-500">dcs.co.ke</span></p>
                  <p>Registered in Kenya</p>
                </div>
                <p className="pt-4">
                  You also have the right to lodge a complaint with Kenya's <strong className={dark ? "text-slate-200" : "text-slate-700"}>Office of the Data Protection Commissioner (ODPC)</strong> at <span className="text-cyan-500">odpc.go.ke</span> if you believe your data has been handled unlawfully.
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

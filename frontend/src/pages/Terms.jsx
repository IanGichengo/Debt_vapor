import { useState, useEffect, useRef } from 'react';
import { FileCheck } from 'lucide-react';
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

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Terms() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const sections = [
    { id: 'agreement',    label: 'Agreement'               },
    { id: 'definitions',  label: 'Definitions'             },
    { id: 'eligibility',  label: 'Eligibility'             },
    { id: 'account',      label: 'Account Responsibilities' },
    { id: 'services',     label: 'Platform Services'       },
    { id: 'whatsapp',     label: 'WhatsApp Usage'          },
    { id: 'mpesa',        label: 'M-Pesa Payments'         },
    { id: 'ai',           label: 'AI & Automation'         },
    { id: 'debtor-data',  label: 'Debtor Data'             },
    { id: 'billing',      label: 'Billing & Subscriptions' },
    { id: 'prohibited',   label: 'Prohibited Use'          },
    { id: 'ip',           label: 'Intellectual Property'   },
    { id: 'liability',    label: 'Limitation of Liability' },
    { id: 'termination',  label: 'Termination'             },
    { id: 'governing',    label: 'Governing Law'           },
    { id: 'contact',      label: 'Contact'                 },
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
          <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-violet-500/8" : "bg-violet-400/15"}`} />
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
                dark ? "border-violet-500/20 bg-violet-500/5 text-violet-400" : "border-violet-200 bg-violet-50 text-violet-700"
              }`}
            >
              <span className="pulse-dot relative flex h-2 w-2">
                <span className={`w-2 h-2 rounded-full block ${dark ? "bg-violet-400" : "bg-violet-500"}`} />
              </span>
              Legal Agreement
            </div>

            <h1
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
              className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6"
            >
              Terms of{" "}
              <span className={dark ? "text-gradient" : "text-gradient-light"}>Service</span>
            </h1>

            <p
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
              className={`text-base max-w-xl mx-auto leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              These Terms govern your use of the DCS platform. By creating an account or accessing any part of our services, you agree to be bound by them. Please read carefully.
            </p>

            <div
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}
              className={`inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl text-xs border ${
                dark ? "border-white/[0.06] bg-white/[0.03] text-slate-500" : "border-gray-100 bg-white text-slate-400"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-violet-500" />
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
                          ? "bg-violet-500/10 text-violet-400 border-l-2 border-violet-500"
                          : "bg-violet-50 text-violet-600 border-l-2 border-violet-500"
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

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5">

              <Section id="agreement" title="1. Agreement to Terms" dark={dark}>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client", "you", "your") and Debt Collection System ("DCS", "we", "our", "us"), a platform developed and operated in Kenya.
                </p>
                <p>
                  By registering for an account, accessing the DCS dashboard, using our API, or using any feature of the platform, you confirm that you have read, understood, and agree to be bound by these Terms and our <Strong dark={dark}>Privacy Policy</Strong>, which is incorporated herein by reference.
                </p>
                <p>
                  If you are using DCS on behalf of a business or organisation, you represent that you have authority to bind that entity to these Terms. If you do not agree, do not use DCS.
                </p>
              </Section>

              <Section id="definitions" title="2. Definitions" dark={dark}>
                <ul className="list-disc pl-5 space-y-2">
                  <li><Strong dark={dark}>"Platform"</Strong> — the DCS web application, API, backend services, and all associated features.</li>
                  <li><Strong dark={dark}>"Client"</Strong> — any business, organisation, or individual who registers for and uses DCS to manage debt collection.</li>
                  <li><Strong dark={dark}>"Debtor"</Strong> — an individual or entity whose debt information is managed through DCS by a Client.</li>
                  <li><Strong dark={dark}>"Collector"</Strong> — a team member added by a Client to use the platform under the Client's account.</li>
                  <li><Strong dark={dark}>"AI Service"</Strong> — the Gemini AI-powered analysis and response generation features of the platform.</li>
                  <li><Strong dark={dark}>"WhatsApp Integration"</Strong> — the connection between DCS and the WhatsApp Business API for sending and receiving messages.</li>
                  <li><Strong dark={dark}>"M-Pesa Integration"</Strong> — the connection between DCS and Safaricom's Daraja API for initiating STK push payment requests.</li>
                  <li><Strong dark={dark}>"Subscription"</Strong> — the recurring payment plan that grants a Client access to the platform.</li>
                </ul>
              </Section>

              <Section id="eligibility" title="3. Eligibility" dark={dark}>
                <p>To use DCS, you must:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Be at least 18 years of age</li>
                  <li>Be operating a legitimate business or providing professional debt collection services</li>
                  <li>Have lawful authority to collect the debts you intend to manage through the platform</li>
                  <li>Comply with all applicable Kenyan laws, including the <Strong dark={dark}>Data Protection Act 2019</Strong>, the <Strong dark={dark}>Consumer Protection Act</Strong>, and any regulations governing debt collection in your sector</li>
                </ul>
                <p>
                  DCS reserves the right to refuse access to any person or entity at our sole discretion, including where we have reason to believe the intended use is unlawful, abusive, or contrary to these Terms.
                </p>
              </Section>

              <Section id="account" title="4. Account Responsibilities" dark={dark}>
                <p>When you create a DCS account, you are responsible for:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Providing accurate and complete registration information</li>
                  <li>Keeping your login credentials confidential and not sharing them with unauthorised parties</li>
                  <li>All activity that occurs under your account, whether performed by you or your Collectors</li>
                  <li>Promptly notifying DCS at <span className="text-cyan-500">support@dcs.co.ke</span> if you suspect unauthorised access to your account</li>
                  <li>Ensuring all Collectors you add understand and comply with these Terms</li>
                </ul>
                <p>
                  DCS implements role-based access control. Admins have full access to account data and settings. Collectors have restricted access as defined by the Admin. You are solely responsible for managing these roles appropriately.
                </p>
              </Section>

              <Section id="services" title="5. Platform Services" dark={dark}>
                <p>DCS provides the following core services under your Subscription:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Debtor and debt management tools including profiles, payment tracking, and status management</li>
                  <li>Automated WhatsApp reminder scheduling and delivery</li>
                  <li>AI-powered analysis of debtor replies and automated response generation</li>
                  <li>M-Pesa STK push initiation for ready-to-pay debtors</li>
                  <li>Payment plan creation and instalment tracking</li>
                  <li>Real-time dashboard and analytics</li>
                  <li>Notification system for key collection events</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any feature of the platform at any time. Where a material feature is removed permanently, we will provide at least <Strong dark={dark}>30 days' notice</Strong> to active Clients.
                </p>
                <p>
                  DCS does not guarantee specific collection outcomes. The platform is a tool — results depend on debtor behaviour, the quality of debtor data provided, and factors outside our control.
                </p>
              </Section>

              <Section id="whatsapp" title="6. WhatsApp Usage" dark={dark}>
                <p>
                  DCS uses the <Strong dark={dark}>Meta WhatsApp Business API</Strong> to send and receive messages on your behalf. By using the WhatsApp integration, you agree to the following:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>You will only message individuals who have a legitimate, existing financial relationship with your business</li>
                  <li>You will not use DCS to send spam, unsolicited marketing, harassment, or threatening messages</li>
                  <li>You are responsible for ensuring message content complies with Meta's WhatsApp Business Policy</li>
                  <li>You acknowledge that Meta may suspend your WhatsApp Business number if it receives excessive complaints — DCS is not liable for such suspensions</li>
                  <li>Message frequency must be reasonable and proportionate to the debt collection context — not more than one message per day to the same debtor unless they have actively engaged</li>
                </ul>
                <p>
                  DCS provides the AI response generation as a tool. You remain responsible for reviewing AI-generated messages if they are sent in your business's name. By enabling automated responses, you accept that the AI may occasionally produce imperfect outputs and DCS is not liable for unintended message content.
                </p>
              </Section>

              <Section id="mpesa" title="7. M-Pesa Payments" dark={dark}>
                <p>
                  DCS integrates with <Strong dark={dark}>Safaricom's Daraja API</Strong> to initiate M-Pesa STK push requests on your behalf. By using this feature:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>You confirm that you have a valid Safaricom M-Pesa Paybill or Till Number and that your use of it complies with Safaricom's terms</li>
                  <li>You are solely responsible for reconciling payments received and updating debt records accordingly</li>
                  <li>DCS initiates the STK push but does not hold, process, or settle funds on your behalf — money goes directly from the debtor to your M-Pesa account</li>
                  <li>DCS is not liable for failed STK pushes, network timeouts, or Safaricom service interruptions</li>
                  <li>You must not use the M-Pesa integration to collect payments for fraudulent, unlawful, or disputed debts</li>
                </ul>
                <p>
                  For your DCS subscription payments, all amounts are in <Strong dark={dark}>Kenyan Shillings (KES)</Strong> and are subject to applicable VAT at 16%. Subscription payments via M-Pesa are final and non-refundable except as specified in Section 10.
                </p>
              </Section>

              <Section id="ai" title="8. AI & Automation" dark={dark}>
                <p>
                  DCS uses <Strong dark={dark}>Google's Gemini AI</Strong> to analyse debtor message content and generate responses. You understand and agree that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>AI-generated responses are automated and may not always perfectly reflect the nuance of a given situation</li>
                  <li>DCS does not guarantee the accuracy, appropriateness, or effectiveness of any AI-generated message</li>
                  <li>By enabling automated AI responses, you authorise DCS to send AI-generated messages to debtors on your behalf</li>
                  <li>Debtor message content is transmitted to Google's Gemini API for processing — this is disclosed in our Privacy Policy and you are responsible for informing debtors if required by applicable law</li>
                  <li>You must not attempt to manipulate or abuse the AI system to produce harmful, discriminatory, or misleading content</li>
                </ul>
                <p>
                  The automated reminder scheduler runs on a configured schedule. DCS includes duplicate send protection, but you are responsible for verifying your reminder settings are appropriate for your use case. DCS is not liable for over-communication to debtors resulting from misconfigured settings.
                </p>
              </Section>

              <Section id="debtor-data" title="9. Debtor Data & Compliance" dark={dark}>
                <p>
                  As a Client, you are the <Strong dark={dark}>data controller</Strong> for all debtor information you upload to DCS. DCS acts as a <Strong dark={dark}>data processor</Strong> on your behalf. This means:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>You must have a lawful basis for processing each debtor's personal data under Kenya's <Strong dark={dark}>Data Protection Act 2019</Strong></li>
                  <li>You are responsible for the accuracy of debtor data you provide — wrong numbers, incorrect amounts, or incorrect names are your responsibility</li>
                  <li>You must not upload data for individuals who have not had a genuine financial relationship with your business</li>
                  <li>You must respond promptly to any debtor data subject request (access, deletion, correction) that DCS forwards to you</li>
                  <li>You must comply with all applicable laws governing debt collection in Kenya, including treating debtors with dignity and not engaging in harassment</li>
                </ul>
                <p>
                  DCS reserves the right to suspend or terminate accounts where we have evidence of unlawful debtor treatment, data misuse, or regulatory non-compliance. We may also report such conduct to relevant authorities.
                </p>
              </Section>

              <Section id="billing" title="10. Billing & Subscriptions" dark={dark}>
                <p>
                  DCS subscriptions are billed monthly or annually in <Strong dark={dark}>Kenyan Shillings (KES)</Strong>. All prices are exclusive of VAT (16%) unless otherwise stated.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><Strong dark={dark}>Monthly plans</Strong> are billed at the start of each billing cycle. Payment is due immediately upon invoice.</li>
                  <li><Strong dark={dark}>Annual plans</Strong> are billed upfront and include a discount equivalent to 2 months free.</li>
                  <li>If payment fails, we will retry up to 3 times over 7 days. After that, your account may be suspended until payment is received.</li>
                  <li>Suspended accounts retain their data for 30 days before deletion.</li>
                  <li><Strong dark={dark}>Refunds:</Strong> Monthly subscriptions are non-refundable once the billing cycle has started. Annual subscriptions may receive a prorated refund for unused complete months, less a 10% administration fee, upon written request within 30 days of payment.</li>
                  <li>We reserve the right to change pricing with <Strong dark={dark}>30 days' written notice</Strong> to active Clients. Continued use after the effective date constitutes acceptance of the new pricing.</li>
                </ul>
              </Section>

              <Section id="prohibited" title="11. Prohibited Use" dark={dark}>
                <p>You may not use DCS to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Collect debts that are statute-barred, fraudulent, or that you have no legal right to collect</li>
                  <li>Send threatening, abusive, defamatory, or harassing messages to debtors</li>
                  <li>Contact debtors at unreasonable hours or with excessive frequency</li>
                  <li>Misrepresent your identity, organisation, or the nature of the debt</li>
                  <li>Upload false or fabricated debt records</li>
                  <li>Attempt to reverse-engineer, copy, or create derivative works from any part of the DCS platform</li>
                  <li>Use the platform to process payments for illegal goods or services</li>
                  <li>Introduce malware, scripts, or automated tools designed to overload or damage the platform</li>
                  <li>Share your account credentials or allow access to DCS by unauthorised third parties</li>
                  <li>Use DCS in any way that violates Kenyan law or the laws of any jurisdiction applicable to your business</li>
                </ul>
                <p>
                  Violation of these prohibitions may result in immediate account termination without refund and may be reported to relevant regulatory and law enforcement authorities.
                </p>
              </Section>

              <Section id="ip" title="12. Intellectual Property" dark={dark}>
                <p>
                  All software, code, designs, algorithms, AI models, workflows, documentation, and branding constituting the DCS platform are the exclusive intellectual property of DCS and its licensors. Nothing in these Terms grants you any ownership rights in the platform.
                </p>
                <p>
                  You are granted a <Strong dark={dark}>limited, non-exclusive, non-transferable licence</Strong> to access and use the platform solely for your internal debt collection operations during an active Subscription period.
                </p>
                <p>
                  You retain ownership of all debtor data and business data you upload to DCS. By uploading data, you grant DCS a limited licence to process it solely for the purpose of providing the platform services to you.
                </p>
                <p>
                  You may not use the DCS name, logo, or branding in any external communication without our prior written consent.
                </p>
              </Section>

              <Section id="liability" title="13. Limitation of Liability" dark={dark}>
                <p>
                  To the maximum extent permitted by Kenyan law, DCS and its directors, employees, and contractors shall not be liable for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform</li>
                  <li>Lost revenue, lost profits, or failed debt recoveries attributable to platform downtime, AI errors, or WhatsApp/M-Pesa service disruptions</li>
                  <li>Any loss arising from unauthorised access to your account due to your failure to maintain credential security</li>
                  <li>Actions taken by third-party services (Meta, Safaricom, Google) that affect platform functionality</li>
                  <li>Any regulatory penalties you incur as a result of how you use the platform</li>
                </ul>
                <p>
                  In no event shall DCS's total liability to you for any claim exceed the amount you paid to DCS in the <Strong dark={dark}>3 months immediately preceding</Strong> the event giving rise to the claim.
                </p>
                <p>
                  DCS provides the platform <Strong dark={dark}>"as is"</Strong> and makes no warranties — express or implied — regarding uptime, accuracy of AI outputs, or fitness for any particular purpose.
                </p>
              </Section>

              <Section id="termination" title="14. Termination" dark={dark}>
                <p><Strong dark={dark}>By you:</Strong> You may cancel your subscription at any time via the account settings page or by emailing <span className="text-cyan-500">support@dcs.co.ke</span>. Cancellation takes effect at the end of your current billing cycle. You will retain access until that date.</p>
                <p><Strong dark={dark}>By DCS:</Strong> We may suspend or terminate your account immediately and without notice if:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>You breach any provision of these Terms</li>
                  <li>We have reason to believe you are using the platform for unlawful purposes</li>
                  <li>Your account is more than 14 days past due on payment</li>
                  <li>We receive a valid legal order requiring us to do so</li>
                </ul>
                <p>
                  Upon termination, your access to the platform ceases immediately. Your data will be retained for <Strong dark={dark}>30 days</Strong> after termination, during which you may request an export. After 30 days, data will be permanently deleted except where retention is required by law.
                </p>
              </Section>

              <Section id="governing" title="15. Governing Law & Disputes" dark={dark}>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the <Strong dark={dark}>Republic of Kenya</Strong>. Any dispute arising from or in connection with these Terms shall first be referred to good-faith negotiation between the parties.
                </p>
                <p>
                  If a dispute cannot be resolved through negotiation within <Strong dark={dark}>30 days</Strong>, it shall be submitted to binding arbitration in Nairobi, Kenya, conducted in English under the rules of the <Strong dark={dark}>Nairobi Centre for International Arbitration (NCIA)</Strong>.
                </p>
                <p>
                  Nothing in this clause prevents either party from seeking urgent injunctive relief from a Kenyan court where necessary to protect confidential information or intellectual property.
                </p>
              </Section>

              <Section id="contact" title="16. Contact" dark={dark}>
                <p>For legal notices, billing disputes, or questions about these Terms:</p>
                <div className={`mt-4 rounded-xl p-6 border space-y-2 ${
                  dark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-50 border-gray-100"
                }`}>
                  <p><Strong dark={dark}>DCS — Legal & Compliance</Strong></p>
                  <p>Email: <span className="text-cyan-500">legal@dcs.co.ke</span></p>
                  <p>Support: <span className="text-cyan-500">support@dcs.co.ke</span></p>
                  <p>Platform: <span className="text-cyan-500">dcs.co.ke</span></p>
                  <p>Registered in Kenya</p>
                </div>
                <p className="pt-4">
                  Legal notices must be sent by email to <span className="text-cyan-500">legal@dcs.co.ke</span> with the subject line <Strong dark={dark}>"Legal Notice — [Your Company Name]"</Strong>. Notices are deemed received on the next business day after sending.
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

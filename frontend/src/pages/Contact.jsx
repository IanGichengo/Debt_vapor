import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Phone, MapPin, MessageSquare,
  Send, CheckCircle, Facebook, Twitter,
  Linkedin, Instagram
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
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
export default function Contact() {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    companySize: '',
    message: '',
    consent: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        firstName: '', lastName: '', email: '', company: '',
        phone: '', companySize: '', message: '', consent: false,
      });
      setIsSubmitted(false);
    }, 5000);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Support",
      details: ["Coming Soon !"],
      description: "Available Mon-Fri, 9AM-6PM EST",
      color: "text-cyan-500",
      bg: dark ? "bg-cyan-500/10" : "bg-cyan-50",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      details: ["Coming Soon !"],
      description: "We respond within 24 hours",
      color: "text-violet-500",
      bg: dark ? "bg-violet-500/10" : "bg-violet-50",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Office Locations",
      details: ["WestLands, Nairobi. Kenya"],
      description: "Visit us during business hours",
      color: "text-blue-500",
      bg: dark ? "bg-blue-500/10" : "bg-blue-50",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Live Chat",
      details: ["Available on website", "Mobile app support"],
      description: "Instant response during business hours",
      color: "text-emerald-500",
      bg: dark ? "bg-emerald-500/10" : "bg-emerald-50",
    },
  ];

  const teamMembers = [
    { name: "Mark Muroki", role: "C.E.O", email: "markmuroki@gmail.com", dept: "Administrator" },
    { name: "Ian Gichengo", role: "C.T.O", email: "iangichengo@gmail.com", dept: "IT" },
  ];

  const faqs = [
    { question: "How quickly do you respond to inquiries?", answer: "We respond to all sales inquiries within 2 hours during business hours and within 24 hours maximum. Support requests are addressed within 1 hour for priority customers." },
    { question: "Do you offer on-site training?", answer: "Yes, we offer both on-site and remote training sessions. Enterprise plans include comprehensive training as part of the implementation package." },
    { question: "What languages do you support?", answer: "Our platform supports English, Spanish, French, German, and Mandarin. Our support team is available in English and Spanish 24/7." },
    { question: "Can I schedule a personalized demo?", answer: "Absolutely! We offer personalized demos tailored to your specific use case. Book a demo through our calendar or contact our sales team." },
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
            <div className={`absolute top-20 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-50 ${dark ? "bg-cyan-500/10" : "bg-cyan-400/20"}`} />
            <div className={`absolute top-40 right-1/4 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-50 ${dark ? "bg-violet-500/10" : "bg-violet-400/15"}`} />
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
                Get In Touch
              </div>

              <h1
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
              >
                Let's Talk About Your<br />
                <span className={dark ? "text-gradient" : "text-gradient-light"}>Debt Collection Needs.</span>
              </h1>

              <p
                style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.35s" }}
                className={`text-lg max-w-2xl mx-auto leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                Our team is ready to help you transform your debt collection process. Contact us for a demo, pricing, or any questions.
              </p>
            </div>
          </section>

          {/* ── MAIN CONTENT ── */}
          <section className="max-w-7xl mx-auto px-6 pb-24 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

              {/* Left Column: Info & Team */}
              <div>
                <FadeUp delay={100}>
                  <h2 className={`font-display text-3xl font-bold mb-8 ${dark ? "text-white" : "text-slate-900"}`}>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {contactInfo.map((info, idx) => (
                      <div key={idx} className={`p-6 rounded-2xl border transition-all duration-300 ${
                        dark ? "bg-[#0f1929] border-white/[0.06] hover:bg-[#131f33]" : "bg-white border-gray-100 hover:shadow-md"
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${info.bg} ${info.color}`}>
                          {info.icon}
                        </div>
                        <h3 className={`font-display font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>{info.title}</h3>
                        {info.details.map((detail, dIdx) => (
                          <p key={dIdx} className={`text-sm mb-1 ${dark ? "text-slate-300" : "text-slate-600"}`}>{detail}</p>
                        ))}
                        <p className={`text-xs mt-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>{info.description}</p>
                      </div>
                    ))}
                  </div>
                </FadeUp>

                <FadeUp delay={200}>
                  <h3 className={`font-display text-2xl font-bold mb-6 ${dark ? "text-white" : "text-slate-900"}`}>
                    Meet Our Team
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className={`p-5 rounded-xl border transition-all ${
                        dark ? "bg-[#0f1929] border-white/[0.06]" : "bg-white border-gray-100 shadow-sm"
                      }`}>
                        <h4 className={`font-semibold mb-1 ${dark ? "text-white" : "text-slate-900"}`}>{member.name}</h4>
                        <p className={`text-xs font-medium mb-3 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>{member.role}</p>
                        <div className="space-y-1.5 text-sm">
                          <p className={`flex items-center gap-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                            <Mail className="w-3.5 h-3.5" /> {member.email}
                          </p>
                          <p className={`flex items-center gap-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                            <Phone className="w-3.5 h-3.5" /> {member.phone}
                          </p>
                        </div>
                        <span className={`inline-block mt-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                          dark ? "bg-white/[0.04] text-slate-400" : "bg-gray-100 text-gray-500"
                        }`}>
                          {member.dept}
                        </span>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>

              {/* Right Column: Contact Form */}
              <FadeUp delay={300}>
                <div className={`rounded-3xl p-8 md:p-10 border relative overflow-hidden ${
                  dark ? "bg-[#0a1929] card-glow border-cyan-500/20" : "bg-white shadow-2xl shadow-cyan-500/10 border-cyan-200"
                }`}>
                  <h2 className={`font-display text-3xl font-bold mb-2 ${dark ? "text-white" : "text-slate-900"}`}>
                    Send us a Message
                  </h2>
                  <p className={`mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Fill out the form and our team will get back to you within 24 hours.
                  </p>

                  {isSubmitted ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-cyan-500/10 text-cyan-500">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className={`font-display text-2xl font-bold mb-3 ${dark ? "text-white" : "text-slate-900"}`}>
                        Message Sent Successfully!
                      </h3>
                      <p className={`mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        Thank you for contacting us. We'll get back to you shortly.
                      </p>
                      <div className={`text-sm animate-pulse ${dark ? "text-slate-500" : "text-slate-400"}`}>
                        Refreshing form in a few seconds...
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>First Name</label>
                          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                              dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                            }`} placeholder="John" />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Last Name</label>
                          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                              dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                            }`} placeholder="Doe" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Email Address</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} required
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                              dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                            }`} placeholder="john@company.com" />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Phone Number</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                              dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                            }`} placeholder="+1 (555) 123-4567" />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Company Name</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} required
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                          }`} placeholder="Acme Inc." />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Company Size</label>
                        <select name="companySize" value={formData.companySize} onChange={handleChange} required
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                          }`}>
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>Your Message</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} required rows="4"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all resize-none focus:outline-none focus:ring-2 ${
                            dark ? "bg-[#0f1929] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                          }`} placeholder="Tell us about your challenges..."></textarea>
                      </div>

                      <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" name="consent" id="consent" checked={formData.consent} onChange={handleChange} required
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 bg-transparent cursor-pointer" />
                        <label htmlFor="consent" className={`text-xs leading-relaxed cursor-pointer ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          I agree to receive communications from DCS about solutions. I understand I can unsubscribe at any time.
                        </label>
                      </div>

                      <button type="submit"
                        className="w-full mt-4 py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan flex items-center justify-center gap-2"
                      >
                        Send Message <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </FadeUp>
            </div>
          </section>

          {/* ── FAQ SECTION ── */}
          <section className={`py-24 border-t ${dark ? "bg-[#0a1120] border-white/[0.04]" : "bg-white border-gray-100"}`}>
            <div className="max-w-3xl mx-auto px-6">
              <FadeUp className="text-center mb-14">
                <p className="text-cyan-500 text-sm font-medium tracking-widest uppercase mb-3">FAQ</p>
                <h2 className="font-display text-4xl font-bold leading-tight">
                  Common <span className={dark ? "text-gradient" : "text-gradient-light"}>Questions</span>
                </h2>
              </FadeUp>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <FadeUp key={i} delay={i * 60}>
                    <FAQItem {...faq} dark={dark} />
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* ── SOCIAL / NEWSLETTER CTA ── */}
          <section className="max-w-4xl mx-auto px-6 pb-28">
            <FadeUp>
              <div
                className={`rounded-3xl p-10 md:p-14 text-center relative overflow-hidden ${dark ? "bg-[#0f1929]" : "bg-white shadow-xl border border-gray-100"}`}
                style={dark ? { background: "linear-gradient(#0f1929,#0f1929) padding-box, linear-gradient(135deg,rgba(103,232,249,0.25),rgba(167,139,250,0.25)) border-box", border: "1px solid transparent" } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04] pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    Stay <span className={dark ? "text-gradient" : "text-gradient-light"}>Connected</span>
                  </h2>
                  <p className={`max-w-lg mx-auto mb-10 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    Follow us on social media for updates, tips, and industry insights about debt collection.
                  </p>

                  <div className="flex justify-center gap-4 mb-10">
                    {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                      <a key={i} href="#" className={`p-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                        dark ? "bg-white/[0.04] border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30" : "bg-gray-50 border-gray-200 text-slate-500 hover:text-cyan-600 hover:shadow-md"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                          dark ? "bg-[#070d18] border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500" : "bg-white border-gray-200 text-slate-900 focus:ring-cyan-500/20 focus:border-cyan-500"
                        }`}
                      />
                      <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] glow-cyan whitespace-nowrap">
                        Subscribe
                      </button>
                    </div>
                    <p className={`text-xs mt-4 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                      We send about 1-2 emails per month. Unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}

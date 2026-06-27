import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Globe, Shield, Facebook, Twitter, Linkedin, Instagram, ArrowUp, MessageSquare, Brain, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExternalLink = (e, url) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const links = {
    Product:  [["Features","/features"],["Pricing","/pricing"]],
    Company:  [["About Us","/about"],["Contact","/contact"]],
    Resources:[["Help Center","/help-center-public"]],
  };

  const socials = [
    { label: "Facebook",  icon: Facebook,  url: "https://facebook.com"  },
    { label: "Twitter",   icon: Twitter,   url: "https://twitter.com"   },
    { label: "LinkedIn",  icon: Linkedin,  url: "https://linkedin.com"  },
    { label: "Instagram", icon: Instagram, url: "https://instagram.com" },
  ];

  const pills = [
    { icon: MessageSquare, label: "WhatsApp Automation" },
    { icon: Brain,         label: "Gemini AI"           },
    { icon: CreditCard,    label: "M-Pesa Native"       },
    { icon: Shield,        label: "Bank-Grade Security"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .footer-font  { font-family: 'DM Sans', sans-serif; }
        .footer-logo  { font-family: 'Syne', sans-serif; }
        .footer-link-line { position: relative; display: inline-block; }
        .footer-link-line::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 0; height: 1px;
          background: linear-gradient(90deg, #06b6d4, #a78bfa);
          transition: width 0.3s cubic-bezier(.22,1,.36,1);
        }
        .footer-link-line:hover::after { width: 100%; }
        .footer-glow-cyan { box-shadow: 0 0 20px rgba(6,182,212,0.25); }
        .footer-glow-cyan:hover { box-shadow: 0 0 30px rgba(6,182,212,0.4); }
      `}</style>

      <footer className={`footer-font border-t transition-colors duration-300 ${
        dark
          ? "bg-[#070d18] border-white/[0.06] text-white"
          : "bg-white border-gray-100 text-slate-900"
      }`}>

        {/* ── Feature pills strip ── */}
        <div className={`border-b ${dark ? "border-white/[0.04]" : "border-gray-100"}`}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
            <div className="flex flex-wrap justify-center gap-3">
              {pills.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                    dark
                      ? "border-white/[0.07] bg-white/[0.03] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20"
                      : "border-gray-100 bg-gray-50 text-slate-500 hover:text-cyan-600 hover:border-cyan-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main footer body ── */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-12">

            {/* Brand column */}
            <div className="md:col-span-2">
              <p className={`text-sm leading-relaxed mb-8 max-w-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                AI-powered debt collection built for the African market. WhatsApp automation, M-Pesa integration, and real-time analytics in one platform.
              </p>

              {/* Socials */}
              <div className="flex items-center gap-2">
                {socials.map(({ label, icon: Icon, url }) => (
                  <button
                    key={label}
                    onClick={(e) => handleExternalLink(e, url)}
                    aria-label={label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                      dark
                        ? "border-white/[0.08] text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5"
                        : "border-gray-200 text-gray-400 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([section, items]) => (
              <div key={section}>
                <h3 className={`footer-logo text-sm font-semibold tracking-wider uppercase mb-5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  {section}
                </h3>
                <ul className="space-y-3">
                  {items.map(([label, path]) => (
                    <li key={label}>
                      <button
                        onClick={() => handleNavigation(path)}
                        className={`footer-link-line text-sm transition-colors duration-200 text-left ${
                          dark ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className={`mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
            dark ? "border-white/[0.06]" : "border-gray-100"
          }`}>
            <p className={`text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>
              © {currentYear} Debt Vapor. All rights reserved. Nairobi, Kenya.
            </p>

            <div className="flex items-center gap-6">
              {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookies", "/cookie-policy"]].map(([label, path]) => (
                <button
                  key={label}
                  onClick={() => handleNavigation(path)}
                  className={`text-xs transition-colors duration-200 ${
                    dark ? "text-slate-600 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                onClick={scrollToTop}
                className={`footer-glow-cyan flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070d18] text-xs font-semibold transition-all duration-200 hover:scale-[1.04]`}
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Top
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

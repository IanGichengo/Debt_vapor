import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#mobile-menu-container") && menuOpen) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { to: "/features",  label: "Features"  },
    { to: "/pricing",   label: "Pricing"   },
    { to: "/solutions", label: "Use Cases" },
    { to: "/about",     label: "About"     },
    { to: "/contact",   label: "Contact"   },
  ];

  const isActive = (path) => location.pathname === path;
  const dark = isDarkMode;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .nav-font { font-family: 'DM Sans', sans-serif; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .menu-animate { animation: slideDown 0.22s cubic-bezier(.22,1,.36,1) forwards; }
        .nav-link-line { position: relative; }
        .nav-link-line::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: linear-gradient(90deg, #06b6d4, #a78bfa);
          transition: width 0.3s cubic-bezier(.22,1,.36,1);
        }
        .nav-link-line:hover::after,
        .nav-link-line.active-link::after { width: 100%; }
        .cyan-glow { box-shadow: 0 0 20px rgba(6,182,212,0.28); }
        .cyan-glow:hover { box-shadow: 0 0 32px rgba(6,182,212,0.42); }
      `}</style>

      <nav className={`nav-font fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? dark
            ? "bg-[#070d18]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
            : "bg-white/92 backdrop-blur-xl border-b border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.07)]"
          : dark
            ? "bg-transparent border-b border-transparent"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100/80"
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo — original favicon ── */}
            <button onClick={() => handleNavigation("/")} className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <img
                  src="/favicon.svg"
                  alt="Debt Vapor Logo"
                  className="h-16 w-16"
                />
              </div>
            </button>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`nav-link-line text-sm font-medium transition-colors duration-200 ${
                    isActive(link.to)
                      ? "text-cyan-500 active-link"
                      : dark
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl border transition-all duration-200 ${
                  dark
                    ? "border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                    : "border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50"
                }`}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleNavigation("/login")}
                className={`px-5 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  dark
                    ? "text-slate-300 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                    : "text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => handleNavigation("/signup")}
                className="cyan-glow px-5 py-2 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-[#070d18] rounded-xl transition-all duration-200 hover:scale-[1.03]"
              >
                Get Started Free
              </button>
            </div>

            {/* ── Mobile controls ── */}
            <div id="mobile-menu-container" className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  dark
                    ? "border-white/10 text-slate-400 hover:text-white"
                    : "border-gray-200 text-gray-500 hover:text-gray-900"
                }`}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleNavigation("/login")}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  dark
                    ? "text-slate-300 border-white/10 hover:border-white/20 hover:text-white"
                    : "text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  dark
                    ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {menuOpen && (
          <div className={`menu-animate md:hidden border-t backdrop-blur-xl shadow-2xl ${
            dark ? "bg-[#0a1120]/95 border-white/[0.06]" : "bg-white/95 border-gray-100"
          }`}>
            <div className="max-w-7xl mx-auto px-5 py-5 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigation(link.to)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? dark
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-cyan-50 text-cyan-600 border border-cyan-200"
                      : dark
                        ? "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}

              <div className={`pt-4 border-t space-y-3 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#070d18] font-semibold text-sm rounded-xl transition-all duration-200 cyan-glow"
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className={`text-center text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>
                  Already have an account?{" "}
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

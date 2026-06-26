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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on outside tap — checks both the control row AND the open dropdown panel,
  // since they're siblings in the DOM (the old version only checked the control row,
  // so tapping empty space inside the open menu would close it).
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#mobile-nav-cluster, #mobile-menu-panel") && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock background scroll while the mobile menu is open, so the page underneath
  // doesn't scroll along with a swipe inside the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [menuOpen]);

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

        /* Touch ergonomics: kill the gray tap-flash and long-press text-selection
           callout on iOS/Android, and tell the browser these are tap targets
           rather than pan/zoom surfaces (removes the ~300ms tap delay). */
        nav button {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          touch-action: manipulation;
          user-select: none;
        }

        /* Exact-height open/close animation for the mobile panel. Using a
           grid-template-rows transition (0fr -> 1fr) instead of animating
           max-height to a guessed pixel/vh value avoids the "snap" you get
           when real content is shorter than the guessed limit. */
        .mobile-panel-rows {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.32s cubic-bezier(.22,1,.36,1);
        }
        .mobile-panel-rows.open { grid-template-rows: 1fr; }
      `}</style>

      {/* Dimmed backdrop behind the open mobile menu — tap it to close */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <nav className={`nav-font fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-[env(safe-area-inset-top)] ${
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
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 group shrink-0 active:scale-95 transition-transform duration-150"
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Debt Vapor Logo"
                  className="h-11 w-11 md:h-16 md:w-16"
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
            <div id="mobile-nav-cluster" className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg border transition-all duration-150 active:scale-90 ${
                  dark
                    ? "border-white/10 text-slate-400 active:bg-white/[0.08]"
                    : "border-gray-200 text-gray-500 active:bg-gray-100"
                }`}
              >
                {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <button
                onClick={() => handleNavigation("/login")}
                className={`px-4 min-h-[44px] flex items-center text-sm font-medium rounded-lg border transition-all duration-150 active:scale-95 ${
                  dark
                    ? "text-slate-300 border-white/10 active:bg-white/[0.08]"
                    : "text-gray-600 border-gray-200 active:bg-gray-100"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu-panel"
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-all duration-150 active:scale-90 ${
                  dark
                    ? "text-slate-400 active:bg-white/[0.08]"
                    : "text-gray-500 active:bg-gray-100"
                }`}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile dropdown — height-animated open/close, scroll-safe on short screens ── */}
          <div id="mobile-menu-panel" className={`md:hidden mobile-panel-rows ${menuOpen ? "open" : ""}`}>
            <div className="overflow-hidden">
              <div className={`border-t backdrop-blur-xl shadow-2xl transition-opacity duration-300 ${
                menuOpen ? "opacity-100 delay-100" : "opacity-0"
              } ${dark ? "bg-[#0a1120]/95 border-white/[0.06]" : "bg-white/95 border-gray-100"}`}>
                <div className="max-h-[70vh] overflow-y-auto px-5 py-5 space-y-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.to}
                      onClick={() => handleNavigation(link.to)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-150 active:scale-[0.98] ${
                        isActive(link.to)
                          ? dark
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-cyan-50 text-cyan-600 border border-cyan-200"
                          : dark
                            ? "text-slate-300 active:bg-white/[0.06]"
                            : "text-gray-600 active:bg-gray-100"
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </button>
                  ))}

                  <div className={`pt-4 border-t space-y-3 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
                    <button
                      onClick={() => handleNavigation("/signup")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] bg-cyan-500 active:bg-cyan-400 text-[#070d18] font-semibold text-sm rounded-xl transition-all duration-150 active:scale-[0.98] cyan-glow"
                    >
                      Get Started Free
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className={`text-center text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>
                      Already have an account?{" "}
                      <button
                        onClick={() => handleNavigation("/login")}
                        className="text-cyan-500 active:text-cyan-400 font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Scissors, MessageCircle, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Clair" },
    { value: "dark", icon: Moon, label: "Sombre" },
    { value: "system", icon: Monitor, label: "Système" },
  ];
  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-full p-1 border border-border">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            theme === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/reservation", label: "Réservation" },
  { to: "/boutique", label: "Boutique" },
  { to: "/contact", label: "Contact" },
];

const menuItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: (i: number) => ({
    opacity: 0,
    x: -12,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Bloque le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-card/80 backdrop-blur-sm"
      }`}
    >
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </motion.div>
          <span
            className="font-black tracking-tight text-foreground text-base sm:text-xl"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            <span className="hidden sm:inline">Centre de Beauté </span>
            <span className="text-primary italic">Zara</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-2 text-sm font-semibold transition-colors rounded-lg ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeSwitcher />
          <a
            href="https://wa.me/22796600817"
            className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-500 transition-colors"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/reservation"
              className="bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Réserver
            </Link>
          </motion.div>
        </div>

        {/* Mobile toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen((p) => !p)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="w-5 h-5 text-foreground" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu className="w-5 h-5 text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-card border-t border-border"
          >
            <div className="px-5 py-5 space-y-1">
              {/* Theme switcher */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="pb-4 border-b border-border mb-3"
              >
                <ThemeSwitcher />
              </motion.div>

              {/* Nav links avec stagger */}
              {NAV_LINKS.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === to
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {location.pathname === to && (
                      <motion.div layoutId="mobile-indicator" className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                    {label}
                  </Link>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="pt-3"
              >
                <Link
                  to="/reservation"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-5 py-3.5 rounded-full w-full"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  <Scissors className="w-4 h-4" />
                  Réserver maintenant
                </Link>
              </motion.div>

              {/* WhatsApp */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.3 }}
              >
                <a
                  href="https://wa.me/22796600817"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors w-full"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter sur WhatsApp
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

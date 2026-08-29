import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from "react-router";
import { Home } from "./app/pages/Home";
import { Services } from "./app/pages/Services";
import { Reservation } from "./app/pages/Reservation";
import { Boutique } from "./app/pages/Boutique";
import { Contact } from "./app/pages/Contact";
import { Admin } from "./app/pages/Admin";
import { Root } from "./app/components/Root";
import { PhoneFrame, LaptopFrame } from "./app/components/ui/MockupFrames";
import { Monitor, Smartphone, CheckCircle2, ChevronRight, Share2, Info } from "lucide-react";
import "./styles/index.css";

const NAV_LINKS = [
  { path: "/", label: "Accueil", description: "Expérience immersive & offres" },
  { path: "/services", label: "Services", description: "Catalogue de prestations" },
  { path: "/reservation", label: "Réservation", description: "File d'attente intelligente" },
  { path: "/boutique", label: "Boutique", description: "Produits & soins Zara" },
  { path: "/contact", label: "Contact", description: "Localisation & horaires" },
];

function PrototypeNav() {
  const location = useLocation();

  return (
    <div className="hidden xl:flex flex-col gap-4 w-72">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Parcours Utilisateur</h3>
        <Info className="w-3 h-3 text-white/20" />
      </div>

      <div className="space-y-3">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group relative flex items-center gap-4 p-5 rounded-[24px] transition-all duration-500 border overflow-hidden ${
                isActive
                  ? "bg-primary border-primary shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] -translate-x-2"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 hover:-translate-x-1"
              }`}
            >
              {/* Active Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              )}

              <div className="flex-1 flex flex-col relative z-10">
                <span className={`text-sm font-black tracking-tight ${isActive ? "text-white" : "text-white/90"}`} style={{ fontFamily: "Fraunces, serif" }}>
                  {link.label}
                </span>
                <span className={`text-[10px] mt-1 font-medium leading-relaxed ${isActive ? "text-white/70" : "text-white/40"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                  {link.description}
                </span>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? "bg-white text-primary rotate-0" : "bg-white/5 text-white/20 rotate-45 group-hover:rotate-0 group-hover:bg-white/10 group-hover:text-white/40"}`}>
                {isActive ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 p-5 rounded-[24px] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Note Prototype</span>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed font-medium">
          Ce prototype simule l'expérience finale du client. Toutes les interactions sont fonctionnelles.
        </p>
      </div>
    </div>
  );
}

function ShowcaseLayout() {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const location = useLocation();

  // Détection automatique du mode responsive réel
  useEffect(() => {
    const checkScreen = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      if (!isLarge) setViewMode("mobile");
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Si on est sur un petit écran (vrai mobile), ou si on est en mode standalone, on affiche l'app directement
  const isStandalone = new URLSearchParams(window.location.search).get("standalone") === "true";

  if (!isLargeScreen || isStandalone) {
    return (
      <div className="min-h-screen bg-background">
        <AppContent />
      </div>
    );
  }

  // URL pour l'iframe : on garde le même chemin mais on force le mode standalone
  const iframeSrc = `${window.location.pathname}?standalone=true#${location.pathname}`;

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header Showcase */}
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#020408]/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-xl shadow-2xl shadow-primary/30 rotate-3 transition-transform hover:rotate-0 cursor-default">Z</div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none" style={{ fontFamily: "Fraunces, serif" }}>Centre Zara Beauté</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-1.5">Interactive Experience v1.0</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-white/[0.03] rounded-2xl p-1.5 border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-500 ${viewMode === "mobile" ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" : "text-white/40 hover:text-white/70"}`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-500 ${viewMode === "desktop" ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" : "text-white/40 hover:text-white/70"}`}
          >
            <Monitor className="w-4 h-4" /> Ordinateur
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="h-8 w-px bg-white/10" />
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Partager
          </button>
        </div>
      </header>

      {/* Main Preview Area */}
      <main className="flex-1 relative flex items-center justify-center gap-10 p-8 lg:p-12 overflow-hidden">

        {/* Left Side Content */}
        <div className="absolute top-20 left-12 hidden 2xl:block space-y-10">
          <div className="relative group">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full" />
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Identité Visuelle</h4>
            <p className="text-sm text-white/80 max-w-[240px] leading-relaxed font-medium">
              Une typographie élégante (<span className="italic font-serif">Fraunces</span>) alliée à une interface moderne (<span className="font-sans">Outfit</span>).
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-white/10 rounded-full group-hover:bg-primary/40 transition-colors" />
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Composants</h4>
            <p className="text-sm text-white/80 max-w-[240px] leading-relaxed font-medium">
              Système de design responsive complet optimisé pour le Niger.
            </p>
          </div>
        </div>

        {/* The Frame Container */}
        <div className="relative z-10 flex flex-col items-center flex-shrink-0">
          <div className="transition-all duration-700 ease-in-out transform scale-[0.5] sm:scale-[0.6] lg:scale-[0.75] xl:scale-[0.8] 2xl:scale-[0.9] origin-center">
            {viewMode === "mobile" ? (
              <PhoneFrame>
                 <iframe key="mobile-iframe" src={iframeSrc} className="w-full h-full border-none" />
              </PhoneFrame>
            ) : (
              <LaptopFrame>
                 <iframe key="desktop-iframe" src={iframeSrc} className="w-full h-full border-none" />
              </LaptopFrame>
            )}
          </div>
        </div>

        {/* Right Side Navigation */}
        <div className="relative z-10 flex flex-col items-start transition-all duration-700">
           <PrototypeNav />
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">
            <span>Zara Beauty Niamey</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>Digital Agency</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">
            <span>© 2026</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="reservation" element={<Reservation />} />
        <Route path="boutique" element={<Boutique />} />
        <Route path="contact" element={<Contact />} />
        <Route path="admin-zara" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <ShowcaseLayout />
  </HashRouter>
);

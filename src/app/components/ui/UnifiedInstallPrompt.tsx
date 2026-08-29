import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Share, PlusSquare, Download } from "lucide-react";

export function UnifiedInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Detect Platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isStandalone) return;

    if (isIOS) {
      setPlatform("ios");
      const timer = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(timer);
    } else {
      // Android / Chrome Logic
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setPlatform("android");
        setShow(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[60] md:max-w-sm md:left-auto"
      >
        <div className="bg-card border border-primary/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 text-white font-black text-xl">
              Z
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1" style={{ fontFamily: "Fraunces, serif" }}>
                {platform === "ios" ? "Installer Zara Beauté" : "L'application Zara Beauté"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
                {platform === "ios"
                  ? "Installez l'app pour recevoir vos notifications de rendez-vous."
                  : "Téléchargez l'application pour un accès rapide et des rappels gratuits."}
              </p>
            </div>
          </div>

          {platform === "ios" ? (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-foreground">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                  <Share className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>1. Cliquez sur le bouton <strong>Partager</strong> en bas.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-foreground">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                  <PlusSquare className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>2. Cliquez sur <strong>Sur l'écran d'accueil</strong>.</span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAndroidInstall}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <Download className="w-4 h-4" />
                Télécharger l'application
              </motion.button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

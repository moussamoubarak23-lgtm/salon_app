import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import { Scissors } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ThemeProvider } from "./ThemeProvider";
import { UnifiedInstallPrompt } from "./ui/UnifiedInstallPrompt";
import { ManifestManager } from "./ManifestManager";

function PageWrapper() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

// Bouton flottant visible uniquement sur mobile, masqué sur /reservation
function FloatingReserveButton() {
  const location = useLocation();
  const hidden = location.pathname === "/reservation";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
          className="fixed bottom-5 left-4 right-4 z-40 md:hidden"
        >
          <Link
            to="/reservation"
            className="flex items-center justify-center gap-2.5 bg-primary text-white font-bold py-4 rounded-2xl shadow-2xl shadow-primary/50 w-full text-sm"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <Scissors className="w-4 h-4" />
            Réserver un créneau
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Root() {
  return (
    <ThemeProvider>
      <ManifestManager />
      <div className="min-h-screen flex flex-col bg-transparent">
        <Navbar />
        <main className="flex-1 bg-transparent">
          <PageWrapper />
        </main>
        <Footer />
        <FloatingReserveButton />
        <UnifiedInstallPrompt />
      </div>
    </ThemeProvider>
  );
}


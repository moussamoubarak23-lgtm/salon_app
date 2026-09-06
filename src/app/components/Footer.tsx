import { Link } from "react-router";
import { motion } from "motion/react";
import { Scissors, Phone, MessageCircle, MapPin } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Footer() {
  return (
    <footer className="bg-[#04080f]/95 backdrop-blur-md text-white py-8 md:py-12 border-t border-white/10">
      <div className="w-full px-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Scissors className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-black" style={{ fontFamily: "Poppins, sans-serif" }}>
                Centre de Beauté <span className="text-blue-400 italic">Zara</span>
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
              Votre salon de beauté de confiance à Niamey. Excellence et savoir-faire depuis 2019.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-[11px] mb-4 uppercase tracking-widest opacity-60" style={{ fontFamily: "DM Mono, monospace" }}>Services</h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2.5">
              {[
                "Tresses",
                "Coup de peigne",
                "Traitement",
                "Pédicure",
                "Sourcils"
              ].map((l) => (
                <li key={l}>
                  <Link to="/services" className="text-xs text-white/40 hover:text-primary transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}>{l}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-[11px] mb-4 uppercase tracking-widest opacity-60" style={{ fontFamily: "DM Mono, monospace" }}>Plateforme</h4>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2.5">
              {[
                { label: "Accueil", to: "/" },
                { label: "Services", to: "/services" },
                { label: "Réservation", to: "/reservation" },
                { label: "Boutique", to: "/boutique" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-xs text-white/40 hover:text-primary transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-[11px] mb-4 uppercase tracking-widest opacity-60" style={{ fontFamily: "DM Mono, monospace" }}>Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href="tel:80122884" className="text-xs text-white/60 hover:text-white transition-colors">80-12-28-84</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <a href="https://wa.me/22796600817" target="_blank" rel="noreferrer" className="text-xs text-white/60 hover:text-white transition-colors">96-60-08-17</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-white/60 leading-snug">Francophonie, FENIFOOT,<br/>Niamey, Niger</p>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[9px] text-white/20 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>
            © 2026 Centre de Beauté Zara
          </p>
          <p className="text-[9px] text-white/20 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>
            Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}


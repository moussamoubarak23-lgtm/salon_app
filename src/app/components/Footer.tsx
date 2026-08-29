import { Link } from "react-router";
import { motion } from "motion/react";
import { Scissors, Phone, MessageCircle, MapPin } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Footer() {
  return (
    <footer className="bg-[#04080f] text-white py-12">
      <div className="w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Scissors className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-black" style={{ fontFamily: "Fraunces, serif" }}>
                Centre de Beauté <span className="text-blue-400 italic">Zara</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
              Votre salon de beauté de confiance à Niamey. Excellence et savoir-faire depuis 2019.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Services</h4>
            <ul className="space-y-2.5">
              {[
                "Tresses (simple)",
                "Coup de peigne",
                "Traitement de cheveux",
                "Pédicure",
                "Tatouage des sourcils"
              ].map((l) => (
                <li key={l}>
                  <Link to="/services" className="text-sm text-white/50 hover:text-primary transition-colors" style={{ fontFamily: "Outfit, sans-serif" }}>{l}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Plateforme</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Accueil", to: "/" },
                { label: "Nos Services", to: "/services" },
                { label: "Réservation", to: "/reservation" },
                { label: "Boutique en ligne", to: "/boutique" },
                { label: "Nous contacter", to: "/contact" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/50 hover:text-primary transition-colors" style={{ fontFamily: "Outfit, sans-serif" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">Téléphone</div>
                  <a href="tel:80122884" className="text-sm text-white/70 hover:text-white transition-colors">80-12-28-84</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">WhatsApp</div>
                  <a href="https://wa.me/22796600817" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">96-60-08-17</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">Adresse</div>
                  <p className="text-sm text-white/70 leading-snug">Francophonie à côté la FENIFOOT,<br/>Niamey, Niger</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>
            © 2026 Centre de Beauté Zara · Mme Fatouma Zara Madjiri
          </p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>
            Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}

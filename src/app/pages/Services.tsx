import { Link } from "react-router";
import { motion } from "motion/react";
import { Clock, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SERVICES = [
  {
    img: "images_salon/tresse_simple_sans_meche.png", name: "Tresses (simple sans mèche)", price: "À partir de 1500 F", duration: "1h – 2h",
    desc: "Tresses classiques réalisées sans mèches additionnelles pour un look naturel et protecteur.",
    details: ["Nattes simples", "Nattes couchées", "Vanilles naturelles"],
  },
  {
    img: "images_salon/coupe_de_peigne_et_casque.png", name: "Coup de peigne et casque", price: "1500 F", duration: "45 min",
    desc: "Mise en forme rapide et séchage sous casque pour un volume et une tenue parfaite.",
    details: ["Démêlage doux", "Mise en plis", "Séchage casque professionnel"],
  },
  {
    img: "images_salon/traitement_de_cheveux.png", name: "Traitement de cheveux", price: "4000 F / séance", duration: "1h – 1h30",
    desc: "Soin intensif recommandé 2 fois par mois pour une santé capillaire optimale.",
    details: ["Soin profond", "Hydratation intense", "Fortification"],
  },
  {
    img: "images_salon/pedicure.png", name: "Pédicure", price: "3500 F", duration: "1h",
    desc: "Soin complet des pieds pour une détente totale et des ongles impeccables.",
    details: ["Bain de pieds", "Gommage", "Soin des cuticules", "Pose vernis"],
  },
  {
    img: "images_salon/tatouages_des_sourcils.png", name: "Tatouage des sourcils", price: "1000 F", duration: "30 min",
    desc: "Définition et traçage des sourcils pour sublimer votre regard.",
    details: ["Dessin précis", "Tenue prolongée", "Finition naturelle"],
  },
];

export function Services() {
  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Header */}
      <section className="py-6 md:py-8 bg-muted/20 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center max-w-3xl mx-auto">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]" style={{ fontFamily: "DM Mono, monospace" }}>Nos Prestations</span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mt-2 mb-3" style={{ fontFamily: "Fraunces, serif" }}>
              Tout pour votre <span className="text-primary italic">beauté</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
              Des soins d'exception réalisés par Mme Fatouma Zara Madjiri.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-8 md:py-12">
        <div className="w-full px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {SERVICES.map((s) => (
              <motion.div
                key={s.name} variants={cardVariant}
                whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}
                className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col shadow-sm"
              >
                {/* Image - Agrandie */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge Temps */}
                  {s.duration !== "—" && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full font-bold border border-white/10">
                      <Clock className="w-3 h-3 text-primary" />{s.duration}
                    </div>
                  )}

                  {/* Prix sur l'image pour un look plus moderne */}
                  <div className="absolute bottom-4 left-5">
                    <div className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest mb-1" style={{ fontFamily: "DM Mono, monospace" }}>Tarif</div>
                    <div className="text-xl font-black text-white" style={{ fontFamily: "Fraunces, serif" }}>{s.price}</div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col bg-card">
                  <h2 className="text-lg font-black text-foreground mb-3" style={{ fontFamily: "Fraunces, serif" }}>{s.name}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5" style={{ fontFamily: "Outfit, sans-serif" }}>{s.desc}</p>

                  <div className="space-y-2 mb-6 flex-1">
                    {s.details.map((d) => (
                      <div key={d} className="flex items-center gap-2.5 text-[11px] text-foreground font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />{d}
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/reservation"
                    state={{ service: s.name }}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Réserver ce service <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-12 bg-muted">
        <div className="w-full px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: "Fraunces, serif" }}>Prête à vous faire chouchouter ?</h3>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block mt-2">
              <Link
                to="/reservation"
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-7 py-3.5 rounded-full"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Réserver un service <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

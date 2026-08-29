import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Scissors, Calendar, Users, Sparkles, ArrowRight,
  Clock, Bell, QrCode, Check, ChevronRight, Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SERVICES_PREVIEW = [
  { icon: "icon_salon/icon_tresse.jpg", name: "Tresses (simple)", duration: "1h–2h", color: "from-violet-500/20 to-purple-500/10" },
  { icon: "icon_salon/icones_casque.jpg", name: "Coup de peigne", duration: "45 min", color: "from-blue-500/20 to-cyan-500/10" },
  { icon: "icon_salon/icon_traitement_cheveux.png", name: "Traitement", duration: "1h–2h", color: "from-green-500/20 to-emerald-500/10" },
  { icon: "icon_salon/icon_pedicure.png", name: "Pédicure", duration: "1h", color: "from-amber-500/20 to-orange-500/10" },
  { icon: "icon_salon/icon_tatou_sourcils.jpg", name: "Tatouage Sourcils", duration: "30 min", color: "from-pink-500/20 to-rose-500/10" },
  { emoji: "🛍️", name: "Vente de Produits", duration: "—", color: "from-primary/20 to-blue-500/10" },
];

export function Home() {
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 500], [0, 60]);

  return (
    <div>
      {/* ── Hero ── */}
      {/* MOBILE hero : image plein-largeur avec overlay */}
      <section className="relative md:hidden overflow-hidden bg-background">
        <div className="relative h-[88vh] min-h-[560px]">
          {/* Image fond */}
          <img
            src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=1200&fit=crop&auto=format"
            alt="Centre de Beauté Zara"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] via-[#04080f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent" />

          {/* Badge haut */}
          <div className="absolute top-20 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Salon ouvert 10h30 – 20h · Lun–Sam
            </motion.div>
          </div>

          {/* Contenu bas */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 mb-5"
            >
              {[
                { value: "2019", label: "Fondé en" },
                { value: "10+", label: "Clientes / mois" },
                { value: "5★", label: "Note" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-black text-white text-xl leading-none" style={{ fontFamily: "Fraunces, serif" }}>{s.value}</span>
                  <span className="text-[10px] text-white/60 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>{s.label}</span>
                </div>
              ))}
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
            </motion.div>

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl font-black leading-[1.08] text-white mb-4"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              L'élégance,<br />
              <span className="text-primary italic">révélée</span> par<br />
              nos soins.
            </motion.h1>

            {/* Boutons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex gap-3"
            >
              <Link
                to="/reservation"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-3.5 rounded-2xl text-sm shadow-lg shadow-primary/40"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Réserver <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-5 py-3.5 rounded-2xl border border-white/20 text-sm"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Services
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bandeau salon info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 bg-card border-b border-border px-5 py-4"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-foreground text-sm" style={{ fontFamily: "Fraunces, serif" }}>Centre de Beauté Zara</div>
            <div className="text-xs text-muted-foreground truncate" style={{ fontFamily: "Outfit, sans-serif" }}>Mme Fatouma · Niamey, Niger</div>
          </div>
          <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">Ouvert</span>
          </div>
        </motion.div>
      </section>

      {/* DESKTOP hero */}
      <section className="relative hidden md:block pt-28 pb-24 overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-secondary translate-x-1/3 -translate-y-1/4"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary -translate-x-1/3 translate-y-1/4"
          />
        </div>

        <div className="w-full px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-secondary text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 border border-accent"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Salon ouvert 10h30 – 20h · Lun–Sam
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl font-black leading-[1.05] text-foreground mb-8"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                L'art de la beauté,<br />
                <span className="text-primary italic relative">
                  sublimé
                  <motion.span
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 h-1.5 bg-primary/20 rounded-full"
                  />
                </span> pour<br />
                chaque femme.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Découvrez une expérience de soin unique au cœur de Niamey.
                Tresses, pédicures et soins capillaires d'exception dans un cadre chaleureux et professionnel.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex flex-wrap gap-3"
              >
                <motion.div whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(24,119,242,0.3)" }} whileTap={{ scale: 0.97 }}>
                  <Link to="/reservation" className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-7 py-3.5 rounded-full" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Réserver maintenant <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/services" className="flex items-center gap-2 bg-card text-foreground font-semibold px-6 py-3.5 rounded-full border border-border hover:border-primary hover:text-primary transition-all" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Voir nos services
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8 mt-10 pt-10 border-t border-border"
              >
                {[
                  { value: "2019", label: "Fondé en" },
                  { value: "10+", label: "Clientes fidèles / mois" },
                  { value: "5★", label: "Note moyenne" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.1 }}>
                    <div className="text-2xl font-black text-primary" style={{ fontFamily: "Fraunces, serif" }}>{s.value}</div>
                    <div className="text-xs text-muted-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex justify-center"
            >
              <div className="relative w-80 h-96">
                <motion.div style={{ y: imgY }} className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/50 dark:shadow-blue-900/30">
                  <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=640&h=800&fit=crop&auto=format" alt="Salon de coiffure" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.04 }}
                  className="absolute -left-10 top-12 bg-card rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-border">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>File d&apos;attente</div>
                    <div className="text-xs text-muted-foreground">2 clientes avant vous</div>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.04 }}
                  className="absolute -right-8 bottom-20 bg-card rounded-2xl shadow-xl px-4 py-3 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>Prochain créneau</span>
                  </div>
                  <div className="text-lg font-black text-primary" style={{ fontFamily: "Fraunces, serif" }}>14h30</div>
                  <div className="text-xs text-green-500 font-semibold">● Disponible</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                  className="absolute -right-6 top-8 bg-card rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-border">
                  <span className="text-amber-400">★</span>
                  <span className="text-sm font-black text-foreground" style={{ fontFamily: "Fraunces, serif" }}>5.0</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services preview ── */}
      <section className="py-10 md:py-20 bg-muted/20 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={fadeUp} className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Nos Prestations</span>
              <h2 className="text-2xl sm:text-4xl font-black text-foreground mt-1" style={{ fontFamily: "Fraunces, serif" }}>Tout pour votre beauté</h2>
            </div>
            <motion.div whileHover={{ x: 4 }}>
              <Link to="/services" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary" style={{ fontFamily: "Outfit, sans-serif" }}>
                Voir tous <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Mobile : scroll horizontal */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
            {SERVICES_PREVIEW.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`flex-shrink-0 w-36 bg-gradient-to-br ${s.color} bg-card rounded-2xl p-4 border border-border/50 shadow-sm`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden mb-3 bg-white/50 flex items-center justify-center">
                  {s.icon ? (
                    <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{s.emoji}</span>
                  )}
                </div>
                <div className="font-black text-foreground text-xs leading-tight mb-1" style={{ fontFamily: "Fraunces, serif" }}>{s.name}</div>
                {s.duration !== "—" && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />{s.duration}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop : grid - Forcé à 3 colonnes pour plus de visibilité */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SERVICES_PREVIEW.map((s) => (
              <motion.div key={s.name} variants={cardVariant} whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                className="bg-card rounded-[2rem] p-8 border border-border flex flex-col items-center text-center transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mb-6 bg-secondary flex items-center justify-center shadow-inner border-4 border-white dark:border-white/5">
                  {s.icon ? (
                    <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{s.emoji}</span>
                  )}
                </div>
                <h3 className="text-lg font-black text-foreground mb-2" style={{ fontFamily: "Fraunces, serif" }}>{s.name}</h3>

                <div className="mt-auto w-full pt-4 border-t border-border/50">
                  <Link to="/services" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                    En savoir plus <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-6 text-center md:hidden">
            <Link to="/services" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full text-sm shadow-md shadow-primary/30" style={{ fontFamily: "Outfit, sans-serif" }}>
              Voir tous les services <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="py-10 md:py-16 bg-background">
        <div className="w-full px-4 sm:px-6">
          {/* Mobile : liste vertical stylisée */}
          <div className="md:hidden mb-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={fadeUp} className="mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Pourquoi nous choisir</span>
              <h2 className="text-2xl font-black text-foreground mt-1" style={{ fontFamily: "Fraunces, serif" }}>Réservez en toute confiance</h2>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="space-y-3">
              {[
                { icon: Bell, title: "Notification WhatsApp", desc: "La gérante est alertée dès votre réservation.", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
                { icon: Users, title: "File d'attente live", desc: "Consultez votre position avant de vous déplacer.", color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
                { icon: QrCode, title: "QR Code au salon", desc: "Scannez et réservez en quelques secondes.", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
                { icon: Check, title: "Clientes prioritaires", desc: "Les réservations en ligne passent en premier.", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
              ].map(({ icon: Icon, title, desc, color }) => (
                <motion.div key={title} variants={cardVariant}
                  className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Desktop : grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger} className="hidden md:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bell, title: "Notification WhatsApp", desc: "La gérante est alertée dès votre réservation." },
              { icon: Users, title: "File d'attente live", desc: "Consultez votre position avant de vous déplacer." },
              { icon: QrCode, title: "QR Code au salon", desc: "Scannez et réservez en quelques secondes." },
              { icon: Check, title: "Clientes prioritaires", desc: "Les réservations en ligne passent en premier." },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={cardVariant} whileHover={{ y: -3 }} className="flex flex-col items-start gap-3 p-5 bg-card border border-border rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>{title}</div>
                  <div className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-12 md:py-16 bg-primary relative overflow-hidden">
        {/* Déco */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        </div>
        <div className="w-full px-4 sm:px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 md:mb-4" style={{ fontFamily: "Fraunces, serif" }}>
              Prête pour votre prochain<br /><span className="italic text-blue-200">rendez-vous beauté ?</span>
            </h2>
            <p className="text-blue-100 mb-7 max-w-md mx-auto text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
              Réservez votre créneau en ligne dès maintenant et profitez d&apos;un service prioritaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="sm:flex-none">
                <Link to="/reservation" className="flex items-center justify-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-full hover:bg-blue-50 transition-colors text-sm shadow-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Réserver maintenant <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="sm:flex-none">
                <Link to="/boutique" className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-7 py-3.5 rounded-full hover:border-white transition-colors text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Voir la boutique
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

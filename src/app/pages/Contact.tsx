import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Phone, MessageCircle, Send, Check, Loader2, User, HelpCircle, Mail, ChevronRight } from "lucide-react";
import { sendWhatsAppNotification } from "../utils/api";

function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Information");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setIsSending(true);

    try {
      await sendWhatsAppNotification("/send-contact", {
        name,
        phone,
        subject,
        message,
      });

      setSent(true);
    } catch (err) {
      console.error("Erreur envoi contact:", err);

      if (window.location.protocol === "https:") {
        alert("Note : Vous êtes sur HTTPS, le serveur WhatsApp local (http) est bloqué. Utilisation du lien direct.");
      }

      // Fallback: lien wa.me
      const waMsg = encodeURIComponent(`*Nouveau Message Contact*\n\n👤 *Nom:* ${name}\n📞 *Tél:* ${phone}\n📌 *Sujet:* ${subject}\n💬 *Message:* ${message}`);
      window.open(`https://wa.me/22796600817?text=${waMsg}`, "_blank");
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-green-200 dark:border-green-900/30 p-8 rounded-3xl text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-foreground mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Message envoyé !</h3>
        <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
          Mme Fatouma a bien reçu votre demande. Elle vous répondra sur WhatsApp très prochainement.
        </p>
        <button onClick={() => setSent(false)} className="mt-6 text-primary font-bold text-sm hover:underline">Envoyer un autre message</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1" style={{ fontFamily: "DM Mono, monospace" }}>Votre Nom</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom Nom" className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-all" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1" style={{ fontFamily: "DM Mono, monospace" }}>Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+227 -- -- -- --" className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-all" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1" style={{ fontFamily: "DM Mono, monospace" }}>Objet de la demande</label>
        <div className="relative">
          <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-all appearance-none cursor-pointer">
            <option>Information</option>
            <option>Question sur un produit</option>
            <option>Problème de réservation</option>
            <option>Autre</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1" style={{ fontFamily: "DM Mono, monospace" }}>Message</label>
        <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Comment pouvons-nous vous aider ?" className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all resize-none" />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isSending}
        className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        Envoyer le message
      </motion.button>
    </form>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const HOURS = [
  { day: "Lundi", hours: "10h30 – 20h00" },
  { day: "Mardi", hours: "10h30 – 20h00" },
  { day: "Mercredi", hours: "10h30 – 20h00" },
  { day: "Jeudi", hours: "10h30 – 20h00" },
  { day: "Vendredi", hours: "10h30 – 20h00" },
  { day: "Samedi", hours: "10h30 – 20h00" },
];

export function Contact() {
  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Header */}
      <section className="py-10 md:py-12 bg-muted/20 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Contact</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mt-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Venez nous<br /><span className="text-primary italic">rendre visite</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="w-full px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-5 mb-10">
                {[
                  { icon: MapPin, label: "Adresse", value: "Francophonie à côté la FENIFOOT, Niamey Niger" },
                  { icon: Clock, label: "Horaires", value: "Lundi – Samedi · 10h30 à 20h" },
                  { icon: Phone, label: "Téléphone", value: "80-12-28-84", href: "tel:80122884" },
                  { icon: MessageCircle, label: "WhatsApp", value: "96-60-08-17", href: "https://wa.me/22796600817" },
                  { icon: Mail, label: "E-mail", value: "fzaramadjiri12@gmail.com", href: "mailto:fzaramadjiri12@gmail.com" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <motion.div key={label} variants={cardVariant} className="flex items-start gap-4">
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "DM Mono, monospace" }}>{label}</div>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-foreground mt-0.5 hover:text-primary transition-colors" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</a>
                      ) : (
                        <div className="text-sm font-semibold text-foreground mt-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Hours table */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
                <div className="px-5 py-3 bg-secondary border-b border-border">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Horaires d'ouverture</span>
                </div>
                {HOURS.map(({ day, hours }, i) => (
                  <div key={day} className={`flex items-center justify-between px-5 py-3.5 ${i < HOURS.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{day}</span>
                    <span className="text-sm font-black text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>{hours}</span>
                  </div>
                ))}
              </motion.div>

              <motion.a
                href="https://wa.me/22796600817"
                whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(34,197,94,0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-green-500 text-white font-bold px-7 py-3.5 rounded-full hover:bg-green-600 transition-colors"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp
              </motion.a>
            </motion.div>

            {/* Right */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]" style={{ fontFamily: "DM Mono, monospace" }}>Contact Rapide</span>
                <h2 className="text-2xl font-black text-foreground mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>Écrivez-nous</h2>
              </div>

              <ContactForm />

              {/* Map placeholder */}
              <div className="mt-8">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=13.569214,2.087788"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-muted rounded-3xl overflow-hidden border border-border h-48 relative group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=400&fit=crop"
                    alt="Niamey, Niger"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card rounded-2xl px-5 py-3 shadow-xl border border-border flex items-center gap-3 group-hover:border-primary transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>Centre de Beauté Zara</div>
                        <div className="text-xs text-muted-foreground">Cliquez pour ouvrir Maps</div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>

            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}


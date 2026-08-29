import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Store, Truck, X, Check,
  MessageCircle, User, Phone, ArrowRight, Package, ChevronLeft, Sparkles, Loader2,
} from "lucide-react";
import { sendWhatsAppNotification } from "../utils/api";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

type Product = { id: string; name: string; category: string; price: string; img: string | string[] };

const PRODUCTS: Product[] = [
  { id: "p1", name: "Perles pour enfants (Le paquet)", category: "Accessoires", price: "500 F", img: ["images_salon/perle_pour_enfants.png", "images_salon/perle_pour_enfants2.png"] },
  { id: "p2", name: "Pommades pour cheveux naturels (Petit/Grand)", category: "Hydratation", price: "1000 F / 2500 F", img: "images_salon/pommades_pour_cheveux_naturels.png" },
  { id: "p3", name: "Gel des cheveux (simple/perfomant)", category: "Coiffage", price: "300 F / 750 F", img: "images_salon/gel_cheveux.png" },
  { id: "p4", name: "Défrisant (UB)/(EXPRESS)", category: "Traitement", price: "500 F  / 1000 F ", img: ["images_salon/defrisant_ub.png", "images_salon/defrisant_express.png"] },
  { id: "p5", name: "Chouchou pour les cheveux", category: "Accessoires", price: "250 F et 500 F", img: ["images_salon/chouchou_pour_cheveux2.png", "images_salon/chouchou_pour_cheveux5.png"] },
  { id: "p6", name: "Colorant (Le paquet)", category: "Traitement", price: "1000 F ", img: "images_salon/colorant.png" },
  { id: "p7", name: "Décolorant", category: "Traitement", price: "3000 F", img: "images_salon/traitement_de_cheveux.png" },
  { id: "p8", name: "Crayon", category: "Maquillage", price: "500 F", img: ["images_salon/crayon.png", "images_salon/crayon2.png"] },
  { id: "p9", name: "Fond de teint", category: "Maquillage", price: "Prix non communiqué", img: "images_salon/fond_de_teint.png" },
  { id: "p10", name: "Fard à paupière", category: "Maquillage", price: "Prix non communiqué", img: ["images_salon/fard_paupiere1.png", "images_salon/fard_paupiere2.png"] },
  { id: "p11", name: "Rouge à lèvre", category: "Maquillage", price: "1000 F", img: "images_salon/rouge_a_levre.png" },
  { id: "p12", name: "Vernis à ongle", category: "Nail Art", price: "1000 F", img: ["images_salon/vernie_ongle.png", "images_salon/vernie_ongle2.png"] },
];

const CATEGORIES = ["Tous", "Maquillage", "Accessoires", "Soin", "Coiffage", "Traitement", "Nail Art", "Hydratation"];
const WA_NUMBER = "22796600817";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: "form" | "confirm" | "sent" }) {
  const steps = [
    { key: "form", label: "Infos" },
    { key: "confirm", label: "Récap" },
    { key: "sent", label: "Envoyé" },
  ];
  const activeIdx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-0 px-5 pt-3 pb-1">
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                  done ? "bg-primary" : active ? "bg-primary ring-4 ring-primary/20" : "bg-muted border border-border"
                }`}
              >
                {done
                  ? <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  : <span className={`text-xs font-black ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>{i + 1}</span>
                }
              </div>
              <span className={`text-[10px] font-bold ${active ? "text-primary" : done ? "text-primary" : "text-muted-foreground"}`} style={{ fontFamily: "DM Mono, monospace" }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all duration-500 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Modal commande ───────────────────────────────────────────────────────────

function OrderModal({
  product,
  delivery,
  onClose,
}: {
  product: Product;
  delivery: "retrait" | "livraison";
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "confirm" | "sent">("form");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [qty, setQty] = useState(1);
  const [isSending, setIsSending] = useState(false);

  const canSubmit = nom.trim().length > 1 && tel.trim().length > 5;

  const priceNum = (product.price.includes('/') || product.price.includes(' et ') || product.price.includes('non communiqué'))
    ? 0
    : parseInt(product.price.replace(/\D/g, ""), 10) || 0;
  const totalPrice = priceNum > 0 ? `${(priceNum * qty).toLocaleString("fr-FR")} FCFA` : product.price;

  const handleOrder = async () => {
    if (!canSubmit) return;
    setIsSending(true);
    console.log("🛒 Tentative d'envoi de commande au serveur...");

    try {
      await sendWhatsAppNotification("/send-order", {
        name: nom,
        phone: tel,
        product: product.name,
        qty,
        total: totalPrice,
        delivery,
      });

      console.log("✅ Commande envoyée avec succès au serveur WhatsApp");
      setStep("sent");
    } catch (err) {
      console.warn("⚠️ Serveur WhatsApp injoignable, basculement vers lien direct.", err);

      if (window.location.protocol === "https:") {
        alert("Note : Vous êtes sur HTTPS, le serveur WhatsApp local (http) est bloqué par le navigateur.\n\nUtilisation du lien direct WhatsApp.");
      }

      // Fallback: lien direct si le serveur est KO
      const whatsappMessage = encodeURIComponent(
        `Bonjour Mme Fatouma 👋\n\n` +
        `Je souhaite commander le produit suivant :\n\n` +
        `🛍️ *Produit :* ${product.name}\n` +
        `🔢 *Quantité :* ${qty}\n` +
        `💰 *Prix total :* ${totalPrice}\n` +
        `📦 *Mode :* ${delivery === "retrait" ? "Retrait au salon" : "Livraison à domicile"}\n\n` +
        `👤 *Nom & Prénom :* ${nom}\n` +
        `📞 *Téléphone :* ${tel}\n\n` +
        `Merci de confirmer ma commande 🙏`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${whatsappMessage}`, "_blank");
      setStep("sent");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl w-full max-w-sm border border-border shadow-2xl overflow-hidden"
      >
        {/* Hero produit */}
        <div className="relative h-32 overflow-hidden">
          <img src={Array.isArray(product.img) ? product.img[0] : product.img} alt={product.name} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {step !== "sent" && (
            <button
              onClick={onClose}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          <div className="absolute bottom-2.5 left-4 right-12">
            <div className="text-white font-black text-base leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
              {product.name}
            </div>
            <div className="text-blue-300 font-bold text-sm" style={{ fontFamily: "Fraunces, serif" }}>
              {product.price}
            </div>
          </div>
          {/* Mode badge */}
          <div className="absolute top-2.5 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            {delivery === "retrait"
              ? <><Store className="w-3 h-3 text-blue-300" /><span className="text-[10px] font-bold text-blue-200" style={{ fontFamily: "Outfit, sans-serif" }}>Retrait salon</span></>
              : <><Truck className="w-3 h-3 text-blue-300" /><span className="text-[10px] font-bold text-blue-200" style={{ fontFamily: "Outfit, sans-serif" }}>Livraison</span></>
            }
          </div>
        </div>

        {/* Step bar */}
        {step !== "sent" && <StepBar step={step} />}

        <div className="px-5 pb-5 pt-1">
          <AnimatePresence mode="wait">

            {/* ── Étape 1 : Formulaire ── */}
            {step === "form" && (
              <motion.div key="form"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-black text-base text-foreground mb-3" style={{ fontFamily: "Fraunces, serif" }}>
                  Vos coordonnées
                </h3>

                <div className="space-y-2.5 mb-3">
                  {/* Nom */}
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Nom & Prénom"
                      className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-foreground placeholder:text-muted-foreground"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="tel"
                      value={tel}
                      onChange={(e) => setTel(e.target.value)}
                      placeholder="Numéro de téléphone"
                      className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-foreground placeholder:text-muted-foreground"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    />
                  </div>

                  {/* Quantité */}
                  <div className="flex items-center justify-between bg-muted border border-border rounded-xl px-3.5 py-2.5">
                    <span className="text-sm font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>Quantité</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-foreground font-black text-sm"
                      >−</button>
                      <span className="w-5 text-center font-black text-foreground" style={{ fontFamily: "Fraunces, serif" }}>{qty}</span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity font-black text-sm"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Total */}
                {priceNum > 0 && (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 mb-3">
                    <span className="text-xs text-primary font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>Total estimé</span>
                    <span className="font-black text-primary text-sm" style={{ fontFamily: "Fraunces, serif" }}>{totalPrice}</span>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => canSubmit && setStep("confirm")}
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-sm"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Continuer <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ── Étape 2 : Confirmation ── */}
            {step === "confirm" && (
              <motion.div key="confirm"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setStep("form")} className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <h3 className="font-black text-base text-foreground" style={{ fontFamily: "Fraunces, serif" }}>
                    Récapitulatif
                  </h3>
                </div>

                {/* Récap commande */}
                <div className="bg-muted rounded-xl overflow-hidden mb-3 border border-border divide-y divide-border">
                  {[
                    { icon: Package, label: "Produit", value: product.name },
                    { icon: delivery === "retrait" ? Store : Truck, label: "Mode", value: delivery === "retrait" ? "Retrait au salon" : "Livraison" },
                    { icon: ShoppingBag, label: "Quantité", value: `× ${qty}` },
                    { icon: Sparkles, label: "Total", value: totalPrice },
                    { icon: User, label: "Nom", value: nom },
                    { icon: Phone, label: "Téléphone", value: tel },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5 px-3.5 py-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground flex-shrink-0" style={{ fontFamily: "DM Mono, monospace" }}>{label}</span>
                        <span className="text-xs font-bold text-foreground text-right truncate" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground text-center mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Votre commande sera envoyée à Mme Fatouma via WhatsApp. Elle vous contactera pour confirmer.
                </p>

                <motion.button
                  onClick={handleOrder}
                  disabled={isSending}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(34,197,94,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {isSending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Confirmer la commande
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ── Étape 3 : Envoyé ── */}
            {step === "sent" && (
              <motion.div key="sent"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="py-4 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3"
                >
                  <Check className="w-7 h-7 text-green-500" />
                </motion.div>

                <h3 className="font-black text-xl text-foreground mb-1" style={{ fontFamily: "Fraunces, serif" }}>
                  Commande envoyée !
                </h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Commande pour <strong className="text-foreground">{product.name}</strong> transmise à Mme Fatouma.
                  Elle vous contactera au <strong className="text-foreground">{tel}</strong>.
                </p>

                {/* Récap rapide */}
                <div className="w-full bg-muted rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-4 border border-border">
                  <div className="text-left">
                    <div className="text-[10px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>Produit</div>
                    <div className="text-xs font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>{product.name} × {qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>Total</div>
                    <div className="font-black text-primary text-sm" style={{ fontFamily: "Fraunces, serif" }}>{totalPrice}</div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Retour à la boutique
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page Boutique ────────────────────────────────────────────────────────────

export function Boutique() {
  const [delivery, setDelivery] = useState<"retrait" | "livraison">("retrait");
  const [filter, setFilter] = useState("Tous");
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [unavailableId, setUnavailableId] = useState<string | null>(null);

  const handleCommander = (p: Product) => {
    if (delivery === "livraison") {
      setUnavailableId(p.id);
      setTimeout(() => setUnavailableId(null), 3000);
    } else {
      setOrderProduct(p);
    }
  };

  const filtered = filter === "Tous" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Header */}
      <section className="py-10 md:py-12 bg-muted/20 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Boutique en ligne</span>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mt-2" style={{ fontFamily: "Fraunces, serif" }}>
                Nos produits,<br /><span className="text-primary italic">disponibles au salon.</span>
              </h1>
            </motion.div>

            {/* Delivery toggle */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-2 bg-card rounded-2xl p-1.5 border border-border self-start">
              {(["retrait", "livraison"] as const).map((mode) => (
                <motion.button key={mode} whileTap={{ scale: 0.96 }} onClick={() => setDelivery(mode)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                    delivery === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {mode === "retrait" ? <><Store className="w-4 h-4" />Retrait salon</> : <><Truck className="w-4 h-4" />Livraison</>}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="w-full px-4 sm:px-6">
          {/* Delivery info */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className={`flex items-center gap-3 rounded-2xl px-5 py-3 mb-8 border text-sm ${
              delivery === "retrait"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400"
            }`}
          >
            {delivery === "retrait"
              ? <><Store className="w-4 h-4 flex-shrink-0" /><span style={{ fontFamily: "Outfit, sans-serif" }}><strong>Retrait gratuit</strong> — Réservez en ligne et récupérez votre produit directement au salon.</span></>
              : <><Truck className="w-4 h-4 flex-shrink-0" /><span style={{ fontFamily: "Outfit, sans-serif" }}><strong>Livraison à domicile</strong> — Pas encore disponible pour le moment.</span></>
            }
          </motion.div>

          {/* Filters */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center gap-2 flex-wrap mb-6">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
                  filter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
              >{cat}</button>
            ))}
          </motion.div>

          {/* Products */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {filtered.map((p) => (
              <motion.div key={p.id} variants={cardVariant}
                whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-card rounded-2xl overflow-hidden border border-border group shadow-sm"
              >
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {Array.isArray(p.img) ? (
                    <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth">
                      {p.img.map((img, i) => (
                        <img key={i} src={img} alt={p.name} className="w-full h-full object-cover flex-shrink-0 snap-center group-hover:scale-105 transition-transform duration-500" />
                      ))}
                    </div>
                  ) : (
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute top-2 left-2 pointer-events-none">
                    <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{p.category}</span>
                  </div>
                  {Array.isArray(p.img) && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                      {p.img.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-foreground text-xs sm:text-sm leading-tight mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-primary text-sm" style={{ fontFamily: "Fraunces, serif" }}>{p.price}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleCommander(p)}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-primary text-primary-foreground transition-all shadow-sm shadow-primary/30"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Commander
                  </motion.button>

                  {/* Message livraison indisponible */}
                  <AnimatePresence>
                    {unavailableId === p.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        className="mt-2 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        <Truck className="w-3 h-3 flex-shrink-0" />
                        Livraison non disponible.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Order modal */}
      <AnimatePresence>
        {orderProduct && (
          <OrderModal
            product={orderProduct}
            delivery={delivery}
            onClose={() => setOrderProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

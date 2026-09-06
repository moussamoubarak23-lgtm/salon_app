import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Users, QrCode, Check, Clock, Calendar,
  ChevronRight, Wifi, AlertCircle, Pencil, X, MessageCircle, ChevronLeft, Loader2,
} from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { generateGoogleCalendarLink, downloadICSFile } from "../utils/calendar";
import { useTheme } from "../components/ThemeProvider";
import { sendWhatsAppNotification } from "../utils/api";

// ─── Types ───
type ReservationData = {
  id?: string;
  name: string;
  phone: string;
  service: string;
  slot: string;
  date: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt?: any;
};

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

const SERVICES = [
  { id: "tresses", name: "Tresses (simple sans mèche)", emoji: "✨", price: "À partir de 1500 F" },
  { id: "casque", name: "Coup de peigne et casque", emoji: "💨", price: "1500 F" },
  { id: "traitement", name: "Traitement de cheveux", emoji: "🌿", price: "4000 F / séance" },
  { id: "pedi", name: "Pédicure", emoji: "🦶", price: "3500 F" },
  { id: "sourcils", name: "Tatouage des sourcils", emoji: "✍️", price: "1000 F" },
];

const TIMESLOTS = [
  { time: "10:30", available: true }, { time: "11:00", available: true },
  { time: "11:30", available: true }, { time: "12:00", available: true },
  { time: "12:30", available: true }, { time: "13:00", available: true },
  { time: "13:30", available: true }, { time: "14:00", available: true },
  { time: "14:30", available: true }, { time: "15:00", available: true },
  { time: "15:30", available: true }, { time: "16:00", available: true },
  { time: "16:30", available: true }, { time: "17:00", available: true },
  { time: "17:30", available: true }, { time: "18:00", available: true },
  { time: "18:30", available: true }, { time: "19:00", available: true },
  { time: "19:30", available: true },
];

// Créneaux structurellement indisponibles (maintenance, pause…)
const BLOCKED_SLOTS = new Set(TIMESLOTS.filter((s) => !s.available).map((s) => s.time));

// ─── Helpers date/heure ───────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function slotToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isPastSlot(time: string, date: Date): boolean {
  const now = new Date();
  if (!isSameDay(date, now)) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return slotToMins(time) <= nowMins;
}

function getTakenSlots(date: Date, todayConfirmed: string[]): Set<string> {
  const now = new Date();
  const taken = new Set(BLOCKED_SLOTS);
  if (isSameDay(date, now)) {
    todayConfirmed.forEach(slot => taken.add(slot));
  }
  return taken;
}

function formatDateLabel(d: Date): string {
  const now = new Date();
  if (isSameDay(d, now)) return "Aujourd'hui";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, tomorrow)) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getNext7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t);
}
function isInHours(t: string): boolean {
  const mins = slotToMins(t);
  return mins >= slotToMins("10:30") && mins <= slotToMins("20:00");
}
function isValidPhone(p: string): boolean {
  const digits = p.replace(/[\s\-().+]/g, "");
  return /^\d{8,15}$/.test(digits);
}

const WA_OWNER = "22796600817";

// ─── Local Storage Helpers ───────────────────────────────────────────────────

type Booking = {
  id: string; // Firebase Document ID
  service: string;
  date: string; // ISO string
  slot: string;
  name: string;
  phone: string;
};

const STORAGE_KEY = "zara_reservation";
const CANCEL_COUNT_KEY = "zara_cancel_count";

function saveBooking(b: Booking) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}
function getBooking(): Booking | null {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}
function clearBooking() {
  localStorage.removeItem(STORAGE_KEY);
}
function getCancelCount(): number {
  return parseInt(localStorage.getItem(CANCEL_COUNT_KEY) || "0", 10);
}
function incrementCancelCount() {
  localStorage.setItem(CANCEL_COUNT_KEY, (getCancelCount() + 1).toString());
}

function buildWaLink(name: string, phone: string, service: string, slot: string, date: Date) {
  const msg = encodeURIComponent(
    `🔔 *Nouvelle réservation — Centre de Beauté Zara*\n\n` +
    `👤 *Nom :* ${name}\n` +
    `📞 *Téléphone :* ${phone}\n` +
    `✂️ *Service :* ${service}\n` +
    `📅 *Date :* ${formatDateFull(date)}\n` +
    `🕐 *Créneau :* ${slot}\n\n` +
    `_Réservé via le site centrebeautezara.cd_`
  );
  return `https://wa.me/${WA_OWNER}?text=${msg}`;
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function Reservation() {
  const location = useLocation();
  const preselected = (location.state as { service?: string } | null)?.service ?? "";

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselected);

  // Gestion de la file d'attente réelle
  const [queue, setQueue] = useState<ReservationData[]>([]);
  const [todayConfirmedSlots, setTodayConfirmedSlots] = useState<string[]>([]);

  // Gestion de la réservation existante
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [cancelCount, setCancelCount] = useState(0);
  const [showManage, setShowManage] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // Écoute en temps réel de la file d'attente (Uniquement confirmé pour aujourd'hui)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0];

    const q = query(
      collection(db, "reservations"),
      where("status", "==", "confirmed"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ReservationData))
        .filter(res => res.date.startsWith(todayISO)); // Filtrer par jour côté client car Firestore index complexe

      setQueue(data);
      setTodayConfirmedSlots(data.map(r => r.slot));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = getBooking();
    // Si la réservation est passée, on la supprime automatiquement
    if (saved && isPastSlot(saved.slot, new Date(saved.date))) {
      clearBooking();
      setExistingBooking(null);
    } else {
      setExistingBooking(saved);
    }

    setCancelCount(getCancelCount());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Vérification périodique (toutes les minutes) pour nettoyer si le temps passe
    const interval = setInterval(() => {
      const current = getBooking();
      if (current && isPastSlot(current.slot, new Date(current.date))) {
        clearBooking();
        setExistingBooking(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Écouteur en temps réel pour synchroniser les actions de l'Admin (Terminer/Supprimer)
  useEffect(() => {
    if (existingBooking?.id) {
      const unsub = onSnapshot(doc(db, "reservations", existingBooking.id), (docSnap) => {
        if (!docSnap.exists() || docSnap.data()?.status === "completed" || docSnap.data()?.status === "cancelled") {
          // Si l'admin a supprimé ou terminé, on nettoie localement
          clearBooking();
          setExistingBooking(null);
          setShowManage(false);
          setConfirmed(false);
          setStep(1);
        }
      }, (err) => {
        console.error("Erreur sync admin:", err);
      });
      return () => unsub();
    }
  }, [existingBooking?.id]);

  // Date — initialisée à aujourd'hui
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedSlot, setSelectedSlot] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [customStatus, setCustomStatus] = useState<"idle" | "valid" | "taken" | "invalid" | "outofhours" | "past">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rafraîchissement automatique de la file d'attente (chaque minute)
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const takenSlots = getTakenSlots(selectedDate, todayConfirmedSlots);
  // Filtrer la file d'attente pour ne garder que les rendez-vous à venir ou en cours
  const activeQueue = queue.filter(r => !isPastSlot(r.slot, new Date(r.date)));
  const myQueuePos = activeQueue.findIndex(r => r.id === existingBooking?.id) + 1;
  const DAYS = getNext7Days();

  // Validation horaire personnalisé
  useEffect(() => {
    if (!customMode || customTime.length < 5) { setCustomStatus("idle"); return; }
    if (!isValidTime(customTime)) { setCustomStatus("invalid"); return; }
    if (!isInHours(customTime)) { setCustomStatus("outofhours"); return; }
    if (isPastSlot(customTime, selectedDate)) { setCustomStatus("past"); return; }
    if (takenSlots.has(customTime)) { setCustomStatus("taken"); return; }
    setCustomStatus("valid");
    setSelectedSlot(customTime);
  }, [customTime, customMode, selectedDate, takenSlots]);

  // Réinitialise le créneau si on change de date
  useEffect(() => {
    resetSlot();
  }, [selectedDate]);

  useEffect(() => { if (phoneError) setPhoneError(""); }, [phone]);

  const handleConfirm = async () => {
    console.log("🔘 Bouton confirmer cliqué !");
    console.log("Données actuelles:", { name, phone, selectedService, selectedSlot, selectedDate });

    if (!name || !selectedService || !selectedSlot) {
      alert(`⚠️ Champs manquants :\n${!name ? "- Nom\n" : ""}${!selectedService ? "- Service\n" : ""}${!selectedSlot ? "- Créneau" : ""}`);
      return;
    }
    if (!isValidPhone(phone)) {
      setPhoneError("Numéro invalide. Saisissez un numéro valide (ex. +227 90 00 00 00).");
      return;
    }

    setIsSubmitting(true);
    console.log("🚀 Lancement de la procédure de réservation...");

    try {
      // 1. Sauvegarde dans Firebase (Backend)
      const serviceInfo = SERVICES.find(s => s.name === selectedService);
      console.log("📡 Envoi vers Firebase...");

      let docId = existingBooking?.id;

      if (docId) {
        // MODIFICATION d'une réservation existante
        await updateDoc(doc(db, "reservations", docId), {
          service: selectedService,
          price: serviceInfo?.price || "À définir",
          slot: selectedSlot,
          date: selectedDate.toISOString(),
          updatedAt: serverTimestamp(),
          status: "confirmed"
        });
      } else {
        // CRÉATION d'une nouvelle réservation
        const docRef = await addDoc(collection(db, "reservations"), {
          name,
          phone,
          service: selectedService,
          price: serviceInfo?.price || "À définir",
          slot: selectedSlot,
          date: selectedDate.toISOString(),
          createdAt: serverTimestamp(),
          status: "confirmed"
        });
        docId = docRef.id;
      }

      console.log("✅ Succès Firebase ! ID:", docId);

      // 3. Appel au serveur de notification WhatsApp (Baileys) via l'utilitaire centralisé
      try {
        console.log("📱 Appel au serveur WhatsApp...");
        await sendWhatsAppNotification("/send-notification", {
          name,
          phone,
          service: selectedService,
          slot: selectedSlot,
          date: formatDateFull(selectedDate)
        });
        console.log("💬 Notification WhatsApp envoyée !");
      } catch (err) {
        if (window.location.protocol === "https:") {
          alert("🔴 SÉCURITÉ : Vous êtes sur un site sécurisé (HTTPS), mais le serveur WhatsApp est configuré sur une adresse non sécurisée (http://localhost:3001).\n\nLe navigateur bloque l'envoi. Pour que cela marche sur le site en ligne, vous devez utiliser une adresse HTTPS (Ngrok ou déploiement en ligne).");
        } else {
          alert("🔴 SERVEUR ÉTEINT : Impossible de joindre le serveur WhatsApp sur le port 3001.\n\nAssurez-vous d'avoir lancé 'npm start' dans le dossier 'whatsapp-server'.");
        }
      }

      // 2. Sauvegarde locale (Frontend)
      const bookingData: Booking = {
        id: docId!,
        name,
        phone,
        service: selectedService,
        slot: selectedSlot,
        date: selectedDate.toISOString(),
      };
      saveBooking(bookingData);
      setExistingBooking(bookingData);

      const link = buildWaLink(name, phone, selectedService, selectedSlot, selectedDate);
      setWaLink(link);
      setConfirmed(true);
    } catch (error: any) {
      console.error("Erreur complète:", error);
      alert(`Erreur technique : ${error.message || "Impossible de contacter la base de données"}. Vérifiez que vous avez bien activé Firestore en mode test.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModify = () => {
    if (!existingBooking) return;
    setName(existingBooking.name);
    setPhone(existingBooking.phone);
    setSelectedService(existingBooking.service);
    setSelectedSlot(existingBooking.slot);
    setSelectedDate(new Date(existingBooking.date));
    setShowManage(false);
    setConfirmed(false); // Réinitialise l'état pour afficher le formulaire
    setStep(2); // On ramène à l'étape du créneau
  };

  const handleCancel = async () => {
    if (cancelCount >= 2) return; // Limite à 2 annulations autonomes
    if (!window.confirm("Voulez-vous vraiment annuler votre réservation ?")) return;

    try {
      if (existingBooking?.id) {
        await updateDoc(doc(db, "reservations", existingBooking.id), {
          status: "cancelled"
        });
      }

      clearBooking();
      incrementCancelCount();
      setExistingBooking(null);
      setCancelCount(prev => prev + 1);
      setShowManage(false);
      setConfirmed(false);
      setStep(1);
    } catch (error) {
      console.error("Erreur annulation:", error);
    }
  };

  const resetSlot = () => {
    setSelectedSlot("");
    setCustomTime("");
    setCustomMode(false);
    setCustomStatus("idle");
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications. \n\nSI VOUS ÊTES SUR IPHONE : Vous devez d'abord installer l'app en faisant 'Partager' -> 'Sur l'écran d'accueil'.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "denied") {
        alert("Vous avez bloqué les notifications. Pour les réactiver, allez dans les paramètres de votre navigateur.");
      } else if (result === "granted") {
        alert("Alertes activées ! Vous recevrez un rappel. ✅");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Header */}
      <section className="py-10 md:py-12 bg-muted">
        <div className="w-full px-4 sm:px-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="text-xs font-bold text-primary uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>Réservation en ligne</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mt-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Choisissez votre<br /><span className="text-primary italic">créneau idéal</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="w-full px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

            {/* Left — avantages + file */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeLeft}>
              {/* Queue widget */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-primary rounded-3xl p-6 text-white shadow-2xl shadow-primary/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-200" />
                    <span className="text-sm font-bold text-blue-100" style={{ fontFamily: "DM Mono, monospace" }}>FILE D'ATTENTE EN DIRECT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
                    <Wifi className="w-3 h-3" /> En direct
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {activeQueue.map((r, idx) => (
                    <div key={r.id} className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {r.id === existingBooking?.id ? "Vous" : r.name}
                        </div>
                        <div className="text-[10px] text-blue-200">{r.service} · {r.slot}</div>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-blue-100 font-semibold">En attente</span>
                    </div>
                  ))}

                  {/* Slot "Vide" si aucune réservation */}
                  {activeQueue.length === 0 && (
                    <div className="flex items-center gap-3 bg-white/5 border border-dashed border-white/20 rounded-xl px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-blue-200">
                        1
                      </div>
                      <div className="text-xs text-blue-200/60 italic">La file d'attente est vide</div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-blue-200/50 text-center" style={{ fontFamily: "DM Mono, monospace" }}>
                  Mise à jour automatique · {new Date(currentTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.div>
            </motion.div>

            {/* Right — formulaire */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeRight}
              className="bg-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl md:sticky md:top-24"
            >
              {confirmed ? (
                /* ── Interface de succès (immédiat après réservation) ── */
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Réservation confirmée !</h3>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Notification envoyée à Mme Fatouma
                  </motion.div>

                  <div className="bg-card rounded-2xl px-4 py-3 border border-border text-left space-y-2 mb-6">
                    {[
                      { label: "Service", val: selectedService },
                      { label: "Date", val: formatDateFull(selectedDate) },
                      { label: "Créneau", val: selectedSlot },
                      { label: "Nom", val: name },
                      { label: "Téléphone", val: phone },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono">{label}</span>
                        <span className="font-bold text-foreground text-right max-w-[60%]">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Bloc Rappel Malin ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-primary/5 rounded-2xl p-5 border border-primary/10 mb-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-primary animate-bounce" />
                      <span className="text-sm font-black text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>Rappel Malin</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-4 px-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Ne manquez pas votre séance ! Ajoutez-la à votre agenda pour être prévenue <strong>1h avant</strong>.
                    </p>

                    <div className="flex flex-col gap-2">
                      <motion.a
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        href={generateGoogleCalendarLink(selectedService, selectedDate, selectedSlot)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white border border-border text-foreground font-bold py-2.5 rounded-xl text-xs shadow-sm"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-3.5 h-3.5" alt="" />
                        Google Calendar
                      </motion.a>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => downloadICSFile(selectedService, selectedDate, selectedSlot)}
                        className="flex items-center justify-center gap-2 bg-white border border-border text-foreground font-bold py-2.5 rounded-xl text-xs shadow-sm"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        Apple / Autres Calendriers
                      </motion.button>

                      {permission !== "granted" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={requestNotificationPermission}
                          className="flex items-center justify-center gap-2 bg-primary/10 text-primary font-bold py-2.5 rounded-xl text-xs mt-2 border border-primary/20"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          M'alerter par notification
                        </motion.button>
                      )}
                    </div>
                  </motion.div>

                  <div className="border-t border-border pt-6 mt-6 space-y-3">
                    <button
                      onClick={handleModify}
                      className="w-full flex items-center justify-center gap-2 bg-secondary text-primary font-bold py-3 rounded-xl text-sm"
                    >
                      <Pencil className="w-4 h-4" /> Modifier ce rendez-vous
                    </button>

                    {cancelCount < 2 && (
                      <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" /> Annuler la réservation
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setConfirmed(false);
                      setStep(preselected ? 2 : 1);
                      setName(""); setPhone(""); setPhoneError("");
                      setSelectedService(preselected);
                      const d = new Date(); d.setHours(0, 0, 0, 0);
                      setSelectedDate(d);
                      resetSlot();
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground mt-8 block w-full"
                  >
                    Faire une autre réservation distincte
                  </button>
                </motion.div>
              ) : existingBooking && showManage ? (
                /* ── Interface de gestion de réservation existante ── */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-black text-xl text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>Ma Réservation</h3>
                  </div>

                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1" style={{ fontFamily: "DM Mono, monospace" }}>Service</div>
                        <div className="text-lg font-black text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{existingBooking.service}</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                        Confirmé
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5" style={{ fontFamily: "DM Mono, monospace" }}>Date</div>
                        <div className="text-sm font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{formatDateLabel(new Date(existingBooking.date))}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5" style={{ fontFamily: "DM Mono, monospace" }}>Heure</div>
                        <div className="text-sm font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{existingBooking.slot}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5" style={{ fontFamily: "DM Mono, monospace" }}>Cliente</div>
                      <div className="text-sm font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{existingBooking.name}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleModify}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      <Pencil className="w-4 h-4" /> Modifier mon créneau
                    </motion.button>

                    {cancelCount < 2 ? (
                      <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        <X className="w-4 h-4" /> Annuler la réservation
                      </button>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>Annulations limitées</span>
                        </div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-500 leading-relaxed" style={{ fontFamily: "Poppins, sans-serif" }}>
                          Vous avez atteint la limite de 2 annulations autonomes. Pour toute nouvelle modification, veuillez nous contacter sur WhatsApp.
                        </p>
                        <a
                          href={`https://wa.me/${WA_OWNER}`}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Contacter le salon
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowManage(false);
                      setStep(1);
                      setName(""); setPhone(""); setPhoneError("");
                      setSelectedService("");
                      resetSlot();
                    }}
                    className="w-full mt-8 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Faire une autre réservation distincte
                  </button>
                </motion.div>
              ) : (
                <div>
                  {/* Stepper */}
                  <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <motion.div
                          animate={{ backgroundColor: step >= s ? "#1877f2" : "transparent" }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            step >= s ? "text-white border-primary" : "text-muted-foreground border-border bg-card"
                          }`}
                        >
                          {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                        </motion.div>
                        {s < 3 && <div className={`h-0.5 w-10 transition-colors duration-500 ${step > s ? "bg-primary" : "bg-border"}`} />}
                      </div>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>Étape {step}/3</span>
                  </div>

                  {/* ── Étape 1 : Service ── */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <h3 className="font-black text-xl text-foreground mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Quel service ?</h3>
                      <div className="space-y-2">
                        {SERVICES.map((s) => (
                          <motion.button key={s.id} whileHover={{ x: 3 }} onClick={() => setSelectedService(s.name)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                              selectedService === s.name ? "border-primary bg-secondary text-primary" : "border-border bg-card hover:border-blue-200"
                            }`}
                          >
                            <span className="flex items-center gap-3 text-sm font-semibold"><span>{s.emoji}</span>{s.name}</span>
                            <span className="text-xs text-muted-foreground">{s.price}</span>
                          </motion.button>
                        ))}
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => selectedService && setStep(2)} disabled={!selectedService}
                        className="mt-4 w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >Continuer <ChevronRight className="inline w-4 h-4" /></motion.button>
                    </motion.div>
                  )}

                  {/* ── Étape 2 : Date + Créneau ── */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <h3 className="font-black text-xl text-foreground mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Date & créneau</h3>
                      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                        <Clock className="w-3.5 h-3.5" /> Salon ouvert de 10h30 à 20h00
                      </p>

                      {/* ── Sélecteur de date ── */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Choisissez une date
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {DAYS.map((d) => {
                            const isSelected = isSameDay(d, selectedDate);
                            const isToday = isSameDay(d, new Date());
                            return (
                              <motion.button
                                key={d.toISOString()}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setSelectedDate(d)}
                                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-center transition-all min-w-[58px] ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-card border-border hover:border-primary hover:text-primary"
                                }`}
                              >
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? "text-blue-200" : "text-muted-foreground"}`} style={{ fontFamily: "DM Mono, monospace" }}>
                                  {isToday ? "auj." : d.toLocaleDateString("fr-FR", { weekday: "short" })}
                                </span>
                                <span className={`font-black text-base leading-tight ${isSelected ? "text-white" : "text-foreground"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                                  {d.getDate()}
                                </span>
                                <span className={`text-[9px] ${isSelected ? "text-blue-200" : "text-muted-foreground"}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                                  {d.toLocaleDateString("fr-FR", { month: "short" })}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Toggle créneaux / horaire perso ── */}
                      <div className="flex items-center gap-1.5 bg-card rounded-full p-1 border border-border mb-4">
                        <button
                          onClick={() => { setCustomMode(false); setCustomTime(""); setCustomStatus("idle"); if (customMode) setSelectedSlot(""); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full transition-all ${
                            !customMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <Clock className="w-3.5 h-3.5" /> Créneaux disponibles
                        </button>
                        <button
                          onClick={() => { setCustomMode(true); setSelectedSlot(""); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-full transition-all ${
                            customMode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Mon horaire
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {!customMode ? (
                          /* ── Grille de créneaux ── */
                          <motion.div key="grid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                              {TIMESLOTS.map((slot) => {
                                const isTaken = takenSlots.has(slot.time);
                                const isPast = isPastSlot(slot.time, selectedDate);
                                const isBlocked = isTaken || isPast;
                                const isSelected = selectedSlot === slot.time;
                                return (
                                  <motion.button key={slot.time}
                                    whileHover={!isBlocked ? { scale: 1.04 } : {}}
                                    whileTap={!isBlocked ? { scale: 0.94 } : {}}
                                    onClick={() => { if (!isBlocked) setSelectedSlot(slot.time); }}
                                    disabled={isBlocked}
                                    className={`relative py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all flex flex-col items-center gap-0.5 ${
                                      isBlocked
                                        ? "bg-muted/60 text-muted-foreground/40 border-transparent cursor-not-allowed"
                                        : isSelected
                                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                                          : "bg-card border-border hover:border-primary hover:text-primary"
                                    }`}
                                  >
                                    <span>{slot.time}</span>
                                    {isPast && (
                                      <span className="text-[9px] font-bold bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded-full leading-none">
                                        Passé
                                      </span>
                                    )}
                                    {!isPast && isTaken && (
                                      <span className="text-[9px] font-bold bg-red-100 dark:bg-red-900/40 text-red-500 px-1.5 py-0.5 rounded-full leading-none">
                                        Pris
                                      </span>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap mt-3 text-[10px] text-muted-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />Sélectionné</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 dark:bg-red-900/40 inline-block border border-red-200 dark:border-red-800" />Pris</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block border border-border" />Passé</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-card inline-block border border-border" />Libre</span>
                            </div>
                          </motion.div>
                        ) : (
                          /* ── Horaire personnalisé ── */
                          <motion.div key="custom" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <div className={`relative rounded-2xl border-2 transition-all overflow-hidden ${
                              customStatus === "valid" ? "border-green-400" :
                              customStatus === "taken" || customStatus === "past" ? "border-red-400" :
                              customStatus === "invalid" || customStatus === "outofhours" ? "border-amber-400" :
                              "border-border"
                            }`}>
                              <div className="bg-muted px-4 pt-4 pb-2 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                  customStatus === "valid" ? "bg-green-100 dark:bg-green-900/40" :
                                  customStatus === "taken" || customStatus === "past" ? "bg-red-100 dark:bg-red-900/40" :
                                  "bg-secondary"
                                }`}>
                                  <Clock className={`w-5 h-5 transition-colors ${
                                    customStatus === "valid" ? "text-green-600" :
                                    customStatus === "taken" || customStatus === "past" ? "text-red-500" :
                                    "text-primary"
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs font-bold text-foreground mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                                    Saisissez votre horaire souhaité
                                  </div>
                                  <input
                                    type="time"
                                    value={customTime}
                                    min="10:30"
                                    max="20:00"
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-base font-black text-foreground outline-none focus:border-primary transition-colors"
                                    style={{ fontFamily: "Poppins, sans-serif" }}
                                  />
                                </div>
                                {customTime && (
                                  <button onClick={resetSlot} className="w-7 h-7 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors flex-shrink-0">
                                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                )}
                              </div>

                              <AnimatePresence>
                                {customStatus !== "idle" && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className={`px-4 py-2.5 flex items-center gap-2 text-xs font-semibold ${
                                      customStatus === "valid" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" :
                                      customStatus === "taken" || customStatus === "past" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                      "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                    }`}
                                    style={{ fontFamily: "Poppins, sans-serif" }}
                                  >
                                    {customStatus === "valid" && <span className="flex items-center gap-2"><Check className="w-4 h-4 flex-shrink-0" /> Ce créneau est disponible — parfait !</span>}
                                    {customStatus === "taken" && <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> Ce créneau est déjà pris. Choisissez un autre horaire.</span>}
                                    {customStatus === "past" && <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> Cet horaire est déjà passé aujourd'hui.</span>}
                                    {customStatus === "invalid" && <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> Format invalide. Utilisez HH:MM (ex. 14:30).</span>}
                                    {customStatus === "outofhours" && <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> Le salon est ouvert de 10h30 à 20h00.</span>}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="mt-3 bg-card rounded-xl border border-border px-3 py-2.5">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2" style={{ fontFamily: "DM Mono, monospace" }}>
                                Déjà réservés — {formatDateLabel(selectedDate)}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {[...takenSlots].filter(t => !isPastSlot(t, selectedDate)).sort().map((t) => (
                                  <span key={t} className="text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2 mt-4">
                        <button onClick={() => { setStep(1); resetSlot(); }} className="flex-1 border border-border text-foreground font-semibold py-3 rounded-xl hover:bg-muted text-sm flex items-center justify-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Retour
                        </button>
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => selectedSlot && (customMode ? customStatus === "valid" : true) && setStep(3)}
                          disabled={!selectedSlot || (customMode && customStatus !== "valid")}
                          className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-40 text-sm"
                        >Continuer</motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Étape 3 : Coordonnées ── */}
                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <h3 className="font-black text-xl text-foreground mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Vos coordonnées</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Prénom & Nom</label>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Aïssatou Diallo"
                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Numéro de téléphone</label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ex. +227 90 00 00 00"
                            className={`w-full bg-card border rounded-xl px-4 py-3 text-sm outline-none transition-colors text-foreground ${
                              phoneError ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"
                            }`}
                          />
                          <AnimatePresence>
                            {phoneError && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-semibold"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                              >
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{phoneError}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-3 text-xs space-y-1.5">
                          <div className="text-muted-foreground font-medium">Récapitulatif</div>
                          <div className="font-bold text-foreground">{selectedService}</div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateFull(selectedDate)} · {selectedSlot}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setStep(2)} className="flex-1 border border-border text-foreground font-semibold py-3 rounded-xl hover:bg-muted text-sm flex items-center justify-center gap-1">
                          <ChevronLeft className="w-4 h-4" /> Retour
                        </button>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} disabled={!name || !phone || isSubmitting}
                          className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl disabled:opacity-40 text-sm flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Envoi...
                            </span>
                          ) : (
                            "Confirmer"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}


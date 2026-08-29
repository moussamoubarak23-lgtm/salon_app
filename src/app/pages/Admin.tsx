import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, User, Phone, Scissors, CreditCard, Bell, CheckCircle2, Trash2, Info } from "lucide-react";
import { ManifestManager } from "../components/ManifestManager";
import { UnifiedInstallPrompt } from "../components/ui/UnifiedInstallPrompt";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  service: string;
  price: string;
  slot: string;
  date: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: Timestamp;
};

// ─── Helpers date/heure (doublon pour admin) ───
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function slotToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function isPastSlot(time: string, dateStr: string): boolean {
  const now = new Date();
  const date = new Date(dateStr);
  if (!isSameDay(date, now)) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return slotToMins(time) <= nowMins;
}

export function Admin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isInitialLoad = useRef(true);
  const prevCount = useRef(0);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    const q = query(
      collection(db, "reservations"),
      where("status", "in", ["confirmed", "cancelled"]), // On écoute aussi les annulations
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];

      // Gestion fine des changements pour les alertes
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as Reservation;

          if (change.type === "added") {
            // NOUVELLE RÉSERVATION
            playAlertSound("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            sendNotification("Nouvelle Réservation ! 🔔", `${data.name} - ${data.service} à ${data.slot}`);
          }
          else if (change.type === "modified") {
            // MODIFICATION PAR LA CLIENTE
            if (data.status === "cancelled") {
              playAlertSound("https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3");
              sendNotification("Réservation ANNULÉE ❌", `${data.name} a annulé son rendez-vous.`);
            } else {
              playAlertSound("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
              sendNotification("Réservation Modifiée ✏️", `${data.name} a changé son créneau pour ${data.slot}`);
            }
          }
        });
      }

      setReservations(docs);
      setLoading(false);
      isInitialLoad.current = false;
      prevCount.current = docs.length;
    }, (error) => {
      console.error("Erreur Firestore Admin:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const playAlertSound = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.log("Audio play blocked - Interaction required", e));
  };

  const sendNotification = async (title: string, body: string) => {
    if (Notification.permission !== "granted") return;

    // Sur mobile/PWA, on utilise le Service Worker pour plus de fiabilité
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        vibrate: [200, 100, 200],
      });
    } else {
      // Fallback web classique
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  // Rafraîchissement automatique pour masquer les expirés
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // Check toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const visibleReservations = reservations; // On affiche tout pour le suivi réel

  const handleComplete = async (id: string) => {
    if (!window.confirm("Marquer comme terminée ? Le client quittera la file d'attente.")) return;
    try {
      await updateDoc(doc(db, "reservations", id), { status: "completed" });
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette réservation ?")) return;
    try {
      await deleteDoc(doc(db, "reservations", id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications. \n\nSI VOUS ÊTES SUR IPHONE : Vous devez d'abord installer l'app en faisant 'Partager' -> 'Sur l'écran d'accueil'.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "denied") {
        alert("Vous avez bloqué les notifications pour ce site. \n\nPour les activer, allez dans les paramètres de votre navigateur (cliquez sur le petit cadenas à côté de l'adresse du site).");
      } else if (result === "granted") {
        alert("Alertes activées avec succès ! ✅");
        new Notification("Zara Beauté", { body: "Les alertes sont maintenant actives." });
      }
    } catch (e) {
      alert("Erreur technique : " + e);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-muted/30">
      <ManifestManager />
      <UnifiedInstallPrompt />
      <div className="max-w-4xl mx-auto px-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: "Fraunces, serif" }}>Tableau de bord</h1>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Suivi des réservations en temps réel</p>
          </div>

          <div className="flex items-center gap-3">
            {permission !== "granted" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requestPermission && requestPermission()}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <Bell className="w-3.5 h-3.5" />
                Activer les alertes
              </motion.button>
            )}
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-xs font-bold font-mono">{reservations.length} total</span>
            </div>
          </div>
        </header>

        {/* Info interaction pour le son */}
        <AnimatePresence>
          {permission === "granted" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed" style={{ fontFamily: "Outfit, sans-serif" }}>
                <strong>Note sur le son :</strong> Les navigateurs bloquent le son automatique.
                Veuillez cliquer au moins une fois sur la page après l'avoir ouverte pour être sûre que l'alerte sonore retentisse lors d'une nouvelle réservation.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse" style={{ fontFamily: "Outfit, sans-serif" }}>
              Connexion à Firebase en cours...
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {visibleReservations.map((res, index) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${
                    res.status === "cancelled" ? "border-red-200 bg-red-50/30 grayscale-[0.5]" :
                    isPastSlot(res.slot, res.date) ? "border-amber-200 bg-amber-50/20" : "border-border"
                  }`}
                >
                  {/* Badge de Rang / Status */}
                  <div className={`absolute top-0 left-0 text-white text-[10px] font-black px-3 py-1 rounded-br-xl z-10 ${
                    res.status === "cancelled" ? "bg-red-500" :
                    isPastSlot(res.slot, res.date) ? "bg-amber-500 animate-pulse" : "bg-primary"
                  }`}>
                    {res.status === "cancelled" ? "ANNULÉ" :
                     isPastSlot(res.slot, res.date) ? "🕒 EXPIRE / RETARD" : `RANG #${index + 1}`}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>{res.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {res.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Scissors className="w-4 h-4" /> {res.service}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" /> {new Date(res.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" /> {res.slot}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                      <div className="flex items-center gap-1.5 text-primary font-black text-lg" style={{ fontFamily: "Fraunces, serif" }}>
                        <CreditCard className="w-4 h-4" /> {res.price}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {res.status !== "cancelled" ? (
                          <button
                            onClick={() => handleComplete(res.id)}
                            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terminer
                          </button>
                        ) : (
                          <div className="text-red-500 text-xs font-black uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                            Annulé par le client
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="flex items-center gap-1.5 bg-muted hover:bg-red-50 text-muted-foreground hover:text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-border"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </button>
                      </div>

                      <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">
                        Reçu à : {res.createdAt?.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleReservations.length === 0 && (
              <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                <p className="text-muted-foreground italic">Aucune réservation pour le moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

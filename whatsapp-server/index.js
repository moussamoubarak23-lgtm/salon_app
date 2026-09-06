import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: ["https://moussamoubarak23-lgtm.github.io", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

let sock;
let isPairing = false;
let currentPairingCode = "En attente...";
let codeTimestamp = "";

app.get('/', (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>🚀 Serveur Zara WhatsApp Actif</h1>
            <p>Le serveur est prêt à envoyer vos notifications.</p>
            <p>Pour lier votre compte, allez sur <a href="/code" style="color:blue; font-weight:bold;">/code</a></p>
        </div>
    `);
});

app.get('/code', (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>Code de jumelage WhatsApp</h1>
            <div style="font-size:48px; font-weight:bold; background:#f0f0f0; padding:20px; display:inline-block; border-radius:10px; letter-spacing:5px; border: 2px solid #007bff; margin-bottom:10px;">
                ${currentPairingCode}
            </div>
            <p style="color:#007bff; font-weight:bold;">Généré à : ${codeTimestamp}</p>
            <div style="max-width:500px; margin:20px auto; text-align:left; background:#fff9e6; padding:20px; border-radius:10px; border:1px solid #ffeeba;">
                <b>Comment faire :</b><br>
                1. Ouvrez WhatsApp sur votre téléphone<br>
                2. Allez dans <b>Réglages</b> > <b>Appareils connectés</b><br>
                3. Appuyez sur <b>Lier un appareil</b><br>
                4. <b>IMPORTANT :</b> Cliquez sur <span style="color:blue;">"Lier avec le numéro de téléphone"</span> tout en bas de l'écran.<br>
                5. Entrez le code affiché ci-dessus.<br>
            </div>
            <p style="color:#666; font-size:12px;">Si le code ne marche pas, rafraîchissez cette page pour en obtenir un nouveau.</p>
        </div>
    `);
});

async function connectToWhatsApp() {
    const sessionDir = './auth_info_baileys';

    // S'ASSURER QUE LE DOSSIER EXISTE TOUJOURS
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    console.log(`\n--- 🔄 TENTATIVE DE CONNEXION ---`);

    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // RÉACTIVÉ POUR LE TEST LOCAL
        mobile: false,
        browser: ["Zara Beauté", "Chrome", "1.0.0"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n--- 📲 SCANNEZ LE QR CODE CI-DESSOUS ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`Connexion fermée (raison: ${reason})`);

            // Si erreur de session, on nettoie
            if ([401, 403, 428, 515].includes(reason) || reason === DisconnectReason.loggedOut) {
                console.log("❌ Erreur critique de session. Nettoyage...");
                if (fs.existsSync(sessionDir)) {
                    try {
                        // On attend un tout petit peu que les fichiers soient libérés
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        fs.rmSync(sessionDir, { recursive: true, force: true });
                        fs.mkdirSync(sessionDir, { recursive: true });
                    } catch (e) { console.log("Note: Nettoyage manuel suggéré."); }
                }
            }

            console.log("Reconnexion dans 15 secondes...");
            setTimeout(connectToWhatsApp, 15000);
            isPairing = false;
            currentPairingCode = "Serveur en pause (Reconnexion)...";
        }
        else if (connection === 'open') {
            console.log('\n--- ✅ WHATSAPP CONNECTÉ AVEC SUCCÈS ! ---');
            currentPairingCode = "DÉJÀ CONNECTÉ ✅";
            isPairing = false;
        }

        if (!sock.authState.creds.registered && !isPairing && (connection === 'connecting' || connection === undefined)) {
            isPairing = true;
            const phoneNumber = process.env.OWNER_PHONE;
            if (phoneNumber) {
                try {
                    // Délai plus long pour stabiliser le socket sur Back4app
                    await new Promise(resolve => setTimeout(resolve, 15000));
                    if (sock.authState.creds.registered) return;

                    console.log(`Génération du code pour ${phoneNumber}...`);
                    const code = await sock.requestPairingCode(phoneNumber);
                    currentPairingCode = code;
                    codeTimestamp = new Date().toLocaleTimeString('fr-FR');
                } catch (err) {
                    console.log("Échec génération code. WhatsApp sature peut-être (attendre 20 min).");
                    isPairing = false;
                    currentPairingCode = "ÉCHEC (Attendez 20 min)";
                }
            }
        }
    });
}

app.post('/send-notification', async (req, res) => {
    const { name, phone, service, slot, date } = req.body;
    if (!sock) return res.status(500).json({ error: 'WhatsApp non connecté' });
    try {
        let formattedPhone = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        const message = `🌟 *Confirmation - Centre Zara*\n\nBonjour *${name}*,\nVotre RDV est confirmé :\n✂️ *${service}*\n📅 *${date}* à *${slot}*\n\nÀ bientôt ! ✨`;
        await sock.sendMessage(formattedPhone, { text: message });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Échec envoi' });
    }
});

app.post('/send-order', async (req, res) => {
    const { name, phone, product, qty, total, delivery } = req.body;
    if (!sock) return res.status(500).json({ error: 'WhatsApp non connecté' });
    try {
        let formattedPhone = phone.replace(/\D/g, '') + '@s.whatsapp.net';
        const message = `🛍️ *Commande - Boutique Zara*\n\nBonjour *${name}*,\nProduit : *${product}* (x${qty})\nTotal : *${total}*\nMode : *${delivery}*\n\nMme Fatouma vous contactera. ✨`;
        await sock.sendMessage(formattedPhone, { text: message });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Échec envoi' });
    }
});

app.post('/send-contact', async (req, res) => {
    const { name, phone, subject, message: userMsg } = req.body;
    if (!sock) return res.status(500).json({ error: 'WhatsApp non connecté' });
    try {
        const ownerPhone = process.env.OWNER_PHONE;
        if (ownerPhone) {
            let formattedOwner = ownerPhone.replace(/\D/g, '') + '@s.whatsapp.net';
            const ownerMsg = `✉️ *Nouveau Message*\n👤 *Nom :* ${name}\n📞 *Tél :* ${phone}\n📌 *Sujet :* ${subject}\n💬 *Msg :* ${userMsg}`;
            await sock.sendMessage(formattedOwner, { text: ownerMsg });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Échec envoi' });
    }
});

app.listen(port, () => {
    console.log(`API prête sur le port ${port}`);
});

connectToWhatsApp();

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

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let sock;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`Utilisation de WhatsApp v${version.join('.')}, latest: ${isLatest}`);

    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('--- SCANNEZ CE QR CODE AVEC VOTRE WHATSAPP ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connexion fermée due à ', lastDisconnect.error, ', reconnexion: ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('--- CONNEXION WHATSAPP ÉTABLIE ---');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Endpoint pour envoyer les notifications
app.post('/send-notification', async (req, res) => {
    const { name, phone, service, slot, date } = req.body;

    console.log(`\n--- NOUVELLE REQUÊTE DE NOTIFICATION ---`);
    console.log(`Client: ${name}`);
    console.log(`Numéro: ${phone}`);
    console.log(`Service: ${service}`);

    if (!sock) {
        console.error('Erreur: WhatsApp n\'est pas encore connecté.');
        return res.status(500).json({ error: 'WhatsApp non connecté' });
    }

    try {
        // Formater le numéro (enlever les espaces, +, etc.)
        let formattedPhone = phone.replace(/\D/g, '');

        if (!formattedPhone.endsWith('@s.whatsapp.net')) {
            formattedPhone += '@s.whatsapp.net';
        }

        console.log(`Envoi du message à: ${formattedPhone}...`);

        const message = `🌟 *Confirmation de Réservation - Centre Zara*\n\n` +
            `Bonjour *${name}*,\n\n` +
            `Votre rendez-vous est confirmé :\n` +
            `✂️ *Service :* ${service}\n` +
            `📅 *Date :* ${date}\n` +
            `🕐 *Heure :* ${slot}\n\n` +
            `Nous avons hâte de vous recevoir ! ✨\n\n` +
            `_Ceci est un message automatique._`;

        await sock.sendMessage(formattedPhone, { text: message });
        console.log(`✅ Message envoyé avec succès à ${name}`);

        // Optionnel : Envoyer aussi à la gérante (Zara)
        const ownerPhone = process.env.OWNER_PHONE;
        if (ownerPhone) {
            let formattedOwner = ownerPhone.replace(/\D/g, '') + '@s.whatsapp.net';
            const ownerMsg = `🔔 *Nouvelle Réservation*\n\n` +
                `👤 *Client :* ${name}\n` +
                `📞 *Tél :* ${phone}\n` +
                `✂️ *Service :* ${service}\n` +
                `📅 *Date :* ${date}\n` +
                `🕐 *Heure :* ${slot}`;
            await sock.sendMessage(formattedOwner, { text: ownerMsg });
            console.log(`✅ Notification envoyée à la gérante`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('❌ Erreur lors de l\'envoi:', err);
        res.status(500).json({ error: 'Échec de l\'envoi du message' });
    }
});

// Endpoint pour les commandes de la boutique
app.post('/send-order', async (req, res) => {
    const { name, phone, product, qty, total, delivery } = req.body;

    console.log(`\n--- NOUVELLE COMMANDE BOUTIQUE ---`);
    console.log(`Client: ${name}, Produit: ${product}`);

    if (!sock) return res.status(500).json({ error: 'WhatsApp non connecté' });

    try {
        let formattedPhone = phone.replace(/\D/g, '') + '@s.whatsapp.net';

        const message = `🛍️ *Confirmation de Commande - Boutique Zara*\n\n` +
            `Bonjour *${name}*,\n\n` +
            `Votre commande est enregistrée :\n` +
            `📦 *Produit :* ${product}\n` +
            `🔢 *Quantité :* ${qty}\n` +
            `💰 *Total :* ${total}\n` +
            `🚚 *Mode :* ${delivery === 'retrait' ? 'Retrait au salon' : 'Livraison'}\n\n` +
            `Mme Fatouma vous contactera très bientôt pour finaliser. Merci ! ✨`;

        await sock.sendMessage(formattedPhone, { text: message });

        // Notification gérante
        const ownerPhone = process.env.OWNER_PHONE;
        if (ownerPhone) {
            let formattedOwner = ownerPhone.replace(/\D/g, '') + '@s.whatsapp.net';
            const ownerMsg = `🛒 *Nouvelle Commande Boutique*\n\n` +
                `👤 *Client :* ${name}\n` +
                `📞 *Tél :* ${phone}\n` +
                `🛍️ *Produit :* ${product} (x${qty})\n` +
                `💰 *Montant :* ${total}\n` +
                `📍 *Mode :* ${delivery}`;
            await sock.sendMessage(formattedOwner, { text: ownerMsg });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Erreur envoi commande:', err);
        res.status(500).json({ error: 'Échec de l\'envoi' });
    }
});

// Endpoint pour les messages de contact
app.post('/send-contact', async (req, res) => {
    const { name, phone, subject, message: userMsg } = req.body;

    console.log(`\n--- NOUVEAU MESSAGE CONTACT ---`);
    console.log(`De: ${name} (${phone})`);

    if (!sock) return res.status(500).json({ error: 'WhatsApp non connecté' });

    try {
        // On n'envoie pas forcément de confirmation au client ici (optionnel)
        // Mais on prévient IMPÉRATIVEMENT la gérante
        const ownerPhone = process.env.OWNER_PHONE;
        if (ownerPhone) {
            let formattedOwner = ownerPhone.replace(/\D/g, '') + '@s.whatsapp.net';
            const ownerMsg = `✉️ *Nouveau Message Contact*\n\n` +
                `👤 *Nom :* ${name}\n` +
                `📞 *Tél :* ${phone}\n` +
                `📌 *Sujet :* ${subject}\n` +
                `💬 *Message :*\n${userMsg}`;
            await sock.sendMessage(formattedOwner, { text: ownerMsg });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Erreur envoi contact:', err);
        res.status(500).json({ error: 'Échec de l\'envoi' });
    }
});

app.listen(port, () => {
    console.log(`Serveur API prêt sur http://localhost:${port}`);
});

connectToWhatsApp();

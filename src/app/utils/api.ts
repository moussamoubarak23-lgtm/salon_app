/**
 * Configuration de l'URL du serveur WhatsApp.
 *
 * En local : utilisez "http://localhost:3001"
 * En production : remplacez par votre URL HTTPS (ex: Ngrok ou Render)
 */
export const WHATSAPP_SERVER_URL = " https://fast-dancers-read.loca.lt";

// Fonction utilitaire pour les appels API
export async function sendWhatsAppNotification(endpoint: string, data: any) {
    try {
        const response = await fetch(`${WHATSAPP_SERVER_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Erreur serveur");
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur WhatsApp (${endpoint}):`, error);
        throw error;
    }
}

# Extension WhatsApp - Boutique & Contact

J'ai étendu la logique de notifications WhatsApp automatiques à l'ensemble du site. Désormais, les commandes de produits et les messages de contact passent également par votre serveur discret.

## Améliorations par page

### 1. Boutique (`Boutique.tsx`)
- **Automatisation** : Le bouton "Envoyer la commande" ne redirige plus vers l'application WhatsApp. Il envoie la commande directement au serveur en arrière-plan.
- **Micro-interactions** : Ajout d'un indicateur de chargement ("Envoi...") pendant la communication avec le serveur.
- **Fallback Intelligent** : Si votre serveur est éteint, le site bascule automatiquement sur l'ancien système (lien `wa.me`) pour ne jamais perdre de vente.

### 2. Contact (`Contact.tsx`)
- **Nouveau Formulaire** : Création d'un formulaire de contact moderne (Nom, Téléphone, Objet, Message).
- **Envoi Direct** : Le message est transmis instantanément à la gérante sur son WhatsApp via le serveur Baileys.
- **Expérience Fluide** : Un message de succès élégant s'affiche une fois le message transmis.

### 3. Backend (`whatsapp-server/index.js`)
- **Nouveaux Endpoints** :
    - `POST /send-order` : Formate les messages pour les commandes (Produit, Quantité, Prix Total, Mode de retrait).
    - `POST /send-contact` : Formate les messages pour les demandes d'informations.
- **Logs de Suivi** : Le terminal affiche maintenant clairement le type de demande reçue (COMMANDE ou MESSAGE CONTACT).

## Comment tester ?

1.  **Serveur** : Assurez-vous que votre serveur WhatsApp est allumé (`npm start` dans le dossier `whatsapp-server`).
2.  **Boutique** : Allez dans la boutique, choisissez un produit et remplissez le formulaire. Cliquez sur "Confirmer".
3.  **Contact** : Allez sur la page contact, remplissez le nouveau formulaire et envoyez.
4.  **Vérification** : Regardez votre terminal serveur et votre compte WhatsApp.

> [!TIP]
> N'oubliez pas de rafraîchir le fichier `dist-prototype/index-prototype.html` pour voir ces changements dans votre prototype interactif.

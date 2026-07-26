# Plan d'optimisation de la Responsivité

Le projet dispose déjà d'une base responsive (utilisation de Tailwind CSS, menu mobile), mais certains éléments visuels (notamment sur la page d'accueil) peuvent déborder ou paraître disproportionnés sur de très petits écrans. Ce plan vise à affiner l'expérience mobile.

## Changements Proposés

### 1. [Optimisation de la Page d'Accueil](file:///C:/Users/dell/salon_app/src/app/pages/Home.tsx)
- **Hero Section :**
    - Ajuster la taille de l'image principale pour qu'elle soit fluide (`max-w-sm` au lieu de `w-80`).
    - Gérer les badges flottants (`File d'attente`, `Prochain créneau`) qui utilisent des marges négatives et peuvent causer un défilement horizontal sur mobile.
    - Réduire les tailles de police des titres (`h1`) sur mobile pour éviter les coupures de mots maladroites.
- **Espacements :** Réduire les paddings verticaux (`py-24` -> `py-12`) sur mobile pour un rendu plus compact.

### 2. [Affinage de la Navigation](file:///C:/Users/dell/salon_app/src/app/components/Navbar.tsx)
- S'assurer que le menu mobile couvre bien l'écran et que les interactions sont fluides.
- Ajuster la taille du logo ou des textes pour les petits écrans.

### 3. [Amélioration de la Page de Réservation](file:///C:/Users/dell/salon_app/src/app/pages/Reservation.tsx)
- Le widget de file d'attente (Queue widget) peut être imposant sur mobile. On s'assurera qu'il s'adapte bien en largeur.
- Optimiser la grille des créneaux horaires pour qu'elle reste lisible sur mobile (passer de 3 à 2 colonnes si nécessaire sur très petits écrans).

### 4. [Boutique et Modales](file:///C:/Users/dell/salon_app/src/app/pages/Boutique.tsx)
- Vérifier que la modale de commande (`OrderModal`) s'affiche parfaitement sur mobile (utilisation de `items-end` pour un effet "drawer").
- Ajuster la grille des produits.

### 5. [Footer](file:///C:/Users/dell/salon_app/src/app/components/Footer.tsx)
- Passer la grille des liens en une seule colonne sur mobile si l'espace est restreint.

## Plan de Vérification

### Tests Manuels
- Utiliser l'inspecteur de navigateur pour tester les résolutions suivantes :
    - **Mobile (320px - 480px) :** Vérifier l'absence de scroll horizontal et la lisibilité.
    - **Tablette (768px) :** Vérifier le passage en mode 2 colonnes.
    - **Desktop (1024px+) :** Vérifier que le design original est préservé.

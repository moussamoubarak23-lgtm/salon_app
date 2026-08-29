# Plan d'implémentation : Prototype Standalone "Double Expérience" (Fichier Unique)

L'objectif est de générer un fichier HTML unique (`zara-showcase.html`) totalement autonome et fonctionnel hors-ligne, permettant de présenter l'application dans des cadres réalistes (iPhone et MacBook).

## Caractéristiques du Prototype

### 1. Fichier Unique & Offline
- Utilisation de `vite-plugin-singlefile` pour embarquer tout le code et les styles.
- Les polices et icônes essentielles seront incluses.
- **Données Simulées** : Désactivation des appels Firebase réels au profit de données de test intégrées pour garantir le fonctionnement sans internet.

### 2. Interface de Présentation Haute-Fidélité
- **Fond Luxueux** : Un arrière-plan avec un dégradé de la charte Zara.
- **Sélecteur de Vue** : Un commutateur élégant pour passer du mode Mobile au mode Ordinateur.
- **Cadres Réalistes** :
    - **iPhone 15 Pro** (CSS) : Avec encoche et bords arrondis.
    - **MacBook Pro** (CSS) : Pour la vue bureau complète.

## Changements Proposés

### 1. [Infrastructure] Configuration de Build
- Création de `vite.config.prototype.ts` :
    - `plugins`: [react(), tailwindcss(), singleFile()]
    - `build.outDir`: 'dist-prototype'
- Mise à jour de `package.json` : Ajout de `"build:prototype": "vite build --config vite.config.prototype.ts"`.

### 2. [Composants] Maquettes CSS (`src/app/components/ui/MockupFrames.tsx`)
- Développement des structures CSS pour les périphériques.
- Intégration de l'application réelle dans ces cadres via une navigation interne (sans iframe pour éviter les problèmes de fichier unique).

### 3. [Page] Point d'entrée Prototype (`src/app/ShowcaseEntry.tsx`)
- Ce fichier sera le point d'entrée unique pour le build du prototype.
- Il contiendra le sélecteur de vue et affichera les composants de la page d'accueil, réservation, etc.

## Plan de Travail

### [ ] Phase 1 : Préparation du Build
- Configurer le nouveau fichier Vite et le script npm.

### [ ] Phase 2 : Design des Mockups
- Coder les cadres iPhone et MacBook en Tailwind CSS.

### [ ] Phase 3 : Logique de Navigation Prototype
- Créer un système de navigation simplifié qui ne dépend pas d'un serveur pour le fichier unique.

## Vérification
- Lancer `npm run build:prototype`.
- Ouvrir le fichier généré dans `dist-prototype/index.html`.
- Vérifier que tout le design Zara est présent et interactif sans connexion.

# Plan d'implémentation - File d'attente dynamique en temps réel

L'objectif est d'automatiser le nettoyage de la file d'attente sur la page client dès qu'un créneau horaire est dépassé, tout en aidant l'administrateur à identifier les retards.

## Changements proposés

### 1. Page Réservation (`Reservation.tsx`)

#### [MODIFIER] [Reservation.tsx](file:///C:/Users/dell/salon_app/src/app/pages/Reservation.tsx)
- Ajouter un état local `now` qui se met à jour toutes les 60 secondes via un `setInterval`.
- Filtrer la liste `queue` affichée dans le widget de file d'attente pour ne conserver que les rendez-vous dont l'heure n'est pas encore passée (`!isPastSlot(r.slot, new Date(r.date))`).
- Cela garantit que la file d'attente reste "fraîche" sans action manuelle.

### 2. Page Administration (`Admin.tsx`)

#### [MODIFIER] [Admin.tsx](file:///C:/Users/dell/salon_app/src/app/pages/Admin.tsx)
- Ajouter une distinction visuelle pour les réservations dont l'heure est passée mais qui n'ont pas été marquées comme terminées.
- Afficher un badge **"EXPIRED / EN RETARD"** et appliquer une bordure ambrée.
- Cela permet à l'admin de voir qu'il a oublié de valider un client.

## Plan de vérification

### Manuel
- [ ] Créer une réservation pour un créneau très proche (ex: dans 2 min).
- [ ] Vérifier qu'elle apparaît dans la file d'attente client.
- [ ] Attendre que l'heure passe.
- [ ] Vérifier qu'elle disparaît de la file client mais reste visible (avec une alerte) dans l'Admin.

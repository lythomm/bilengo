# 05 — Validation 1-Clic Conducteur & Mises à Jour Temps Réel

**What to build:** Route de validation `/booking/confirm?token=<validationToken>` permettant au conducteur de confirmer la réservation en 1 clic, décompte atomique des places disponibles, réactivité en temps réel (subscriptions Convex) sur l'ensemble des écrans, et annulations.

**Blocked by:** 04 — Recherche de Trajet & Demande de Réservation Passager

**Status:** resolved

- [x] Lorsque le conducteur clique sur le lien reçu par WhatsApp/SMS (`/booking/confirm?token=...`), la réservation passe instantanément en statut `confirmed`.
- [x] Le nombre de places disponibles sur le trajet est automatiquement décrémenté en base de données.
- [x] L'interface utilisateur de la page d'événement se met à jour en temps réel sans rechargement de page via Convex.
- [x] Le conducteur ou le passager peut annuler un trajet/réservation, ce qui remet à jour le nombre de places en temps réel.

# 04 — Recherche de Trajet & Demande de Réservation Passager

**What to build:** Recherche et filtrage des trajets par ville de départ sur la page d'événement publique, demande de réservation de place par le passager, et génération du lien de message WhatsApp (avec fallback SMS / Web Share API) contenant le token de validation 1-clic pour le conducteur.

**Blocked by:** 03 — Page Événement Publique & Publication de Trajet Conducteur

**Status:** ready-for-agent

- [ ] Les passagers peuvent rechercher et filtrer la liste des trajets par lieu de départ ou proximité.
- [ ] Le passager peut sélectionner un trajet et demander une place en fournissant son prénom et son téléphone.
- [ ] L'application génère un `validationToken` unique et pré-remplit un message WhatsApp (ou SMS/Web Share) destiné au conducteur avec le lien de confirmation 1-clic.
- [ ] La réservation passe en statut `pending` (en attente de confirmation).

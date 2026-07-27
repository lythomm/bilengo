# 03 — Page Événement Publique & Publication de Trajet Conducteur

**What to build:** Page d'événement publique accessible sans compte via l'URL `/e/<slug>`, persistance de la session participant en cookie (30 jours), et formulaire permettant à un conducteur de publier un trajet de covoiturage.

**Blocked by:** 02 — Auth Organisateur via ConvexAuth & Création d'Événement

**Status:** resolved

- [x] Tout utilisateur ouvrant l'URL d'événement `/e/<slug>` accède directement aux détails de l'événement sans devoir créer de compte ni entrer de mot de passe.
- [x] Le prénom et le téléphone du participant sont enregistrés dans un cookie d'une durée de 30 jours lors de sa première action.
- [x] Un conducteur peut proposer un trajet vers l'événement en renseignant son adresse de départ (autocomplétée), l'heure de départ et le nombre de places offertes.
- [x] Le nouveau trajet apparaît immédiatement dans la liste de l'événement.

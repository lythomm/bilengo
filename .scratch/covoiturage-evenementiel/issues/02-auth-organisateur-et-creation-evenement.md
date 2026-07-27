# 02 — Auth Organisateur via ConvexAuth & Création d'Événement

**What to build:** Inscription et connexion des organisateurs via **ConvexAuth**, formulaire de création d'événement avec autocomplétion de l'adresse de destination, contrôle du quota freemium de participants (< 50 gratuits), et tableau de bord d'administration organisateur.

**Blocked by:** 01 — Setup Projet, Convex & ConvexAuth

**Status:** ready-for-agent

- [ ] L'organisateur peut s'inscrire et se connecter avec email et mot de passe via ConvexAuth.
- [ ] L'organisateur connecté peut créer un événement avec le nom, l'adresse exacte (autocomplétée via l'API BAN / OpenStreetMap), et la date/heure.
- [ ] La mutation de création d'événement applique la règle freemium (< 50 participants autorisés en version gratuite).
- [ ] L'organisateur accède à son tableau de bord d'administration pour visualiser ses événements créés et copier le lien public.

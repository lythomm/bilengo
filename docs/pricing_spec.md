# Spécification du Modèle de Pricing (Pay-per-Event)

## 1. Résumé du Besoin & Modèle
- **Modèle :** Pay-per-Event (Paiement unique par événement, sans abonnement récurrent).
- **Cible :** Organisateurs d'événements B2C (Mariages, anniversaires, galas, événements asso/pro).
- **Logique :** Tier gratuit permettant de tester et de gérer les petits événements (jusqu'à 50 invités). Déblocage des capacités supérieures par événement via un paiement unique.

---

## 2. Grille Tarifaire Validée

| Tranche d'invités | Tarif TTC / Événement | Description / Usage type |
| :--- | :--- | :--- |
| **0 – 50 invités** | **0 € (Gratuit)** | Découverte, anniversaires intimistes, repas de famille |
| **51 – 100 invités** | **14,99 €** | Fêtes, soirées d'anniversaire, petits mariages |
| **101 – 250 invités** | **24,99 €** | Mariages standards, grands anniversaires |
| **251 – 500 invités** | **79,99 €** | Grands mariages, événements associatifs & galas |
| **501 – 1000+ invités** | **149,99 €** | Festivals, très grands galas, rassemblements massifs |

---

## 3. Registre des Décisions (Decision Log)

| Décision | Option Choisie | Alternatives considérées | Raison du choix |
| :--- | :--- | :--- | :--- |
| **Modèle économique** | Pay-per-event | Abonnement SaaS mensuel, Système de crédits | Évite la friction d'abonnement pour des particuliers qui n'organisent des événements qu'une ou deux fois par an. |
| **Quota Gratuit** | 50 invités | 20 invités, 100 invités | 50 est suffisant pour valider le produit (onboarding) sans cannibaliser les mariages/grandes soirées. |
| **Positionnement Prix** | Premium sur gros volumes (14,99 € à 149,99 €) | Micro-prix (9,99 € à 69,99 €) | Les événements de >250 et >500 personnes ont des budgets globaux élevés (plusieurs milliers d'euros), ce qui rend le coût de 79,99 € / 149,99 € très marginal et très rentable pour le produit. |
| **Gestion du dépassement** | Hard-lock / Blocage strict (déjà implémenté) | Soft-limit avec blocage des features d'envoi | Simplicité d'expérience et protection directe contre les abus. |

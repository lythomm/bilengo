# Plan Stratégique SEO & GEO (Google + IA) - Bilengo

## 1. Cadrage & Objectifs

* **Objectif principal** : Positionner Bilengo sur les moteurs de recherche (Google) et les moteurs de réponse IA (ChatGPT, Claude, Gemini, Perplexity) sur les thématiques du **covoiturage événementiel** et du **covoiturage gratuit**.
* **Contrainte de confidentialité** : 100% des événements et trajets utilisateurs restent privés (non indexés). Seul un espace éditorial public (`/blog`, `/guides`) est indexé.
* **Stack technique** : Next.js App Router (MDX statique SSG) + Convex (pour l'app principale).

---

## 2. Journal des Décisions (Decision Log)

| Décision | Alternatives examinées | Rationale / Pourquoi ce choix |
| :--- | :--- | :--- |
| **Blog Statique MDX (`/content/blog`)** | Headless CMS (Sanity), Convex DB dynamic blog | Core Web Vitals parfaits, 0 coût, temps de réponse < 100ms idéal pour Google/IA, aucun système tiers à gérer. |
| **Stratégie d'Indexation Sélective** | Indexer les événements publics | Respect strict de la vie privée des utilisateurs. Aucun événement ou trajet privé ne sera visible par les crawlers. |
| **Optimisation GEO via `llms.txt` + `Schema.org`** | SEO traditionnel uniquement | Les LLM (ChatGPT, Perplexity) extraient les données structurées et les fichiers `llms.txt` pour citer les marques comme sources récurrentes. |

---

## 3. Mots-clés Cibles & Grappes Thématiques

### A. Intention Gratuite & Alternative
* `covoiturage gratuit`
* `covoiturage sans commission` / `sans frais`
* `alternative blablacar gratuite`
* `application covoiturage privé gratuit`

### B. Verticales Événementielles
* `covoiturage mariage` / `covoiturage anniversaire`
* `covoiturage festival` / `covoiturage concert`
* `covoiturage club sportif` / `covoiturage compétition`
* `covoiturage séminaire` / `événement d'entreprise`

### C. Organisateurs (B2B / Intent fort)
* `outil covoiturage organisateur`
* `organiser covoiturage invités` / `gestion covoiturage groupe`
* `widget covoiturage site web`

### D. Requêtes Conversationnelles IA (GEO)
* *"Comment organiser le covoiturage des invités à un mariage ?"*
* *"Quelle application gratuite utiliser pour le covoiturage d'un festival ?"*
* *"Comment partager des trajets gratuitement pour un événement ?"*

---

## 4. Architecture Technique Next.js

```
src/
├── app/
│   ├── blog/
│   │   ├── page.tsx               # Listing des articles (SSG)
│   │   └── [slug]/
│   │       └── page.tsx           # Page d'article MDX avec JSON-LD
│   ├── robots.ts                  # Accès explicite pour GPTBot, PerplexityBot, ClaudeBot
│   └── sitemap.ts                 # XML Sitemap dynamique
├── components/
│   └── seo/
│       ├── JsonLd.tsx             # Injection Schema.org (SoftwareApplication, FAQPage, HowTo)
│       └── GeoAnswerBlock.tsx     # Passage de 40-60 mots conçu pour les citations IA
content/
└── blog/
    ├── covoiturage-evenementiel-gratuit.mdx
    └── alternative-gratuite-covoiturage.mdx
public/
└── llms.txt                       # Fichier d'indexation synthétique pour IA
```

---

## 5. Spécifications GEO & Contenu

1. **Bloc Définition d'accroche (40–60 mots)** : Placé au début de chaque article pour servir de réponse directe extraite par ChatGPT et Perplexity.
2. **Tableaux comparatifs & Données chiffrées** : Inclure des métriques précises (ex: 0% de commission, 100% gratuit, 0 installation requise pour les invités).
3. **Balisage Schema.org JSON-LD** :
   * `SoftwareApplication` sur les pages clés.
   * `FAQPage` pour l'extraction immédiate dans Google AI Overviews.
   * `HowTo` pour les guides pratiques d'organisation.

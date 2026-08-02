# Spécification d'Architecture : Centralisation du Pricing & Gestion des Tiers

## 1. Résumé de la Compréhension (Understanding Summary)
- **Problème** : Les informations tarifaires et les tranches d'invités étaient dispersées dans plusieurs composants UI (`PricingSection`, `UpdateQuotaModal`, `CreateEventModal`), rendant les modifications de prix complexes et sujettes aux erreurs.
- **Solution** : Créer une source de vérité unique (`src/config/pricing.ts`) et associer chaque événement à un `tierId` neutre en base de données.
- **Bénéfice clé** : Modifications de tarifs/noms rétroactives et centralisées en 1 seul endroit du code, sans casser la logique métier existante basée sur `maxParticipants`.

---

## 2. Registre des Décisions (Decision Log)

| Décision | Option Choisie | Alternatives Considérées | Raison du choix |
| :--- | :--- | :--- | :--- |
| **Source de vérité des prix** | Fichier Config TS unique (`src/config/pricing.ts`) | Duplication dans chaque composant UI, Stockage dynamique en DB | Centralisation simple, typage fort TypeScript, zéro coût de requête DB pour lire les tarifs. |
| **Schéma de Données (`events`)** | Hybride (`tierId` + `maxParticipants`) | `maxParticipants` seul, `tierId` seul | `tierId` offre la flexibilité marketing et les mises à jour rétroactives de libellés. `maxParticipants` garantit la stabilité du droit acquis et la rétrocompatibilité 100% avec les vérifications de quota actuelles. |

---

## 3. Architecture Technique Proposée

### A. Fichier de Configuration Unique (`src/config/pricing.ts`)

```typescript
export interface PricingTier {
  id: string;             // ex: 'free', 'tier_50', 'tier_100'
  quota: number;          // ex: 25, 50, 100
  label: string;          // ex: '50'
  countText: string;      // ex: '50 invités'
  price: string;          // ex: '9,99 €'
  priceCents: number;     // ex: 999
  isFree?: boolean;
  badge?: string | null;
  highlight?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  { id: "free", quota: 25, label: "25", countText: "25 invités", price: "0 €", priceCents: 0, isFree: true, badge: "Gratuit" },
  { id: "tier_50", quota: 50, label: "50", countText: "50 invités", price: "9,99 €", priceCents: 999 },
  { id: "tier_100", quota: 100, label: "100", countText: "100 invités", price: "14,99 €", priceCents: 1499, badge: "Conseillé", highlight: true },
  { id: "tier_150", quota: 150, label: "150", countText: "150 invités", price: "29,99 €", priceCents: 2999 },
  { id: "tier_250", quota: 250, label: "250", countText: "250 invités", price: "39,99 €", priceCents: 3999, badge: "Populaire", highlight: true },
  { id: "tier_500", quota: 500, label: "500", countText: "500 invités", price: "69,99 €", priceCents: 6999 },
  { id: "tier_1000", quota: 1000, label: "1000+", countText: "1000+ invités", price: "119,99 €", priceCents: 11999, badge: "Gros volume" },
];

export const DEFAULT_FREE_TIER = PRICING_TIERS[0];
```

### B. Schéma Convex (`convex/schema.ts`)

```typescript
// Ajout optionnel du champ tierId dans la table events
events: defineTable({
  // ... champs existants ...
  maxParticipants: v.number(),
  tierId: v.optional(v.string()), // ex: 'free', 'tier_50', 'tier_100'
})
```

---

## 4. Prochaines Étapes / Plan d'Implémentation

1. Créer le fichier `src/config/pricing.ts`.
2. Mettre à jour `UpdateQuotaModal.tsx`, `PricingSection.tsx`, `CreateEventModal.tsx` et `CreateEventClient.tsx` pour consommer `PRICING_TIERS` depuis la source unique.
3. Ajouter `tierId` au schéma `convex/schema.ts` et aux mutations de création/mise à jour d'événement (`convex/events.ts`).

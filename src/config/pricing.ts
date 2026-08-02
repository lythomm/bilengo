export interface PricingTier {
  id: string;
  quota: number;
  label: string;
  countText: string;
  price: string;
  priceCents: number;
  isFree?: boolean;
  badge?: string | null;
  highlight?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    quota: 25,
    label: "25",
    countText: "25 invités",
    price: "0 €",
    priceCents: 0,
    isFree: true,
    badge: "Gratuit",
  },
  {
    id: "tier_50",
    quota: 50,
    label: "50",
    countText: "50 invités",
    price: "9,99 €",
    priceCents: 999,
  },
  {
    id: "tier_100",
    quota: 100,
    label: "100",
    countText: "100 invités",
    price: "14,99 €",
    priceCents: 1499,
    badge: "Conseillé",
    highlight: true,
  },
  {
    id: "tier_150",
    quota: 150,
    label: "150",
    countText: "150 invités",
    price: "29,99 €",
    priceCents: 2999,
  },
  {
    id: "tier_250",
    quota: 250,
    label: "250",
    countText: "250 invités",
    price: "39,99 €",
    priceCents: 3999,
    badge: "Populaire",
    highlight: true,
  },
  {
    id: "tier_500",
    quota: 500,
    label: "500",
    countText: "500 invités",
    price: "69,99 €",
    priceCents: 6999,
  },
  {
    id: "tier_1000",
    quota: 1000,
    label: "1000+",
    countText: "1000+ invités",
    price: "119,99 €",
    priceCents: 11999,
    badge: "Gros volume",
  },
];

export const DEFAULT_FREE_TIER = PRICING_TIERS[0];

export function getTierByQuota(quota: number): PricingTier {
  return (
    PRICING_TIERS.find((t) => t.quota === quota) ||
    PRICING_TIERS.find((t) => t.quota >= quota) ||
    PRICING_TIERS[PRICING_TIERS.length - 1]
  );
}

export function getTierById(id?: string): PricingTier | undefined {
  if (!id) return undefined;
  return PRICING_TIERS.find((t) => t.id === id);
}

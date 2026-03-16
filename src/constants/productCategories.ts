export const PRODUCT_CATEGORIES = [
  "Roasted Makhana",
  "Flavored Makhana",
  "Organic Snacks",
  "Combo Packs",
  "Diet Snacks",
  "Gift Packs",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

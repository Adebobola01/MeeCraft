export const PRODUCT_CATEGORIES = ["Shoes", "Bags"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_TYPES_BY_CATEGORY: Record<ProductCategory, string[]> = {
  Shoes: ["Sandals", "Flats", "Heels", "Other"],
  Bags: ["Totes", "Crossbody bags", "Clutches", "Other"],
};

export const FULFILLMENT_MODES = ["READY_TO_SHIP", "MADE_TO_ORDER"] as const;

export type FulfillmentMode = (typeof FULFILLMENT_MODES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.some((category) => category === value);
}

export function isProductType(category: string, value: string) {
  return (
    isProductCategory(category) &&
    PRODUCT_TYPES_BY_CATEGORY[category].some((productType) => productType === value)
  );
}

export function isFulfillmentMode(value: string): value is FulfillmentMode {
  return FULFILLMENT_MODES.some((mode) => mode === value);
}

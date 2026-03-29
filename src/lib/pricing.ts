export interface PricingSettings {
  gstRate: number;
  serviceCharge: number;
  deliveryCharge: number;
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  gstRate: 0.18,
  serviceCharge: 12,
  deliveryCharge: 39,
};

export const GST_RATE = DEFAULT_PRICING_SETTINGS.gstRate;

export function normalizePricingSettings(
  value?: Partial<PricingSettings> | null
): PricingSettings {
  return {
    gstRate:
      typeof value?.gstRate === "number" && value.gstRate >= 0
        ? value.gstRate
        : DEFAULT_PRICING_SETTINGS.gstRate,
    serviceCharge:
      typeof value?.serviceCharge === "number" && value.serviceCharge >= 0
        ? value.serviceCharge
        : DEFAULT_PRICING_SETTINGS.serviceCharge,
    deliveryCharge:
      typeof value?.deliveryCharge === "number" && value.deliveryCharge >= 0
        ? value.deliveryCharge
        : DEFAULT_PRICING_SETTINGS.deliveryCharge,
  };
}

export function computeOrderTotals(
  subtotal: number,
  discountAmount: number,
  pricing?: Partial<PricingSettings> | null
) {
  const normalizedPricing = normalizePricingSettings(pricing);
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * normalizedPricing.gstRate * 100) / 100;
  const serviceCharge =
    Math.round(normalizedPricing.serviceCharge * 100) / 100;
  const deliveryCharge =
    Math.round(normalizedPricing.deliveryCharge * 100) / 100;
  const total =
    Math.round((taxable + gst + serviceCharge + deliveryCharge) * 100) / 100;

  return {
    taxable,
    gst,
    gstRate: normalizedPricing.gstRate,
    serviceCharge,
    deliveryCharge,
    total,
  };
}

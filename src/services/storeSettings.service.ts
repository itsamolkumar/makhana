import {
  DEFAULT_PRICING_SETTINGS,
  PricingSettings,
  normalizePricingSettings,
} from "@/lib/pricing";
import StoreSettings from "@/models/store-settings.model";

export async function getStorePricingSettings(): Promise<PricingSettings> {
  let config = await StoreSettings.findOne().lean<PricingSettings | null>();

  if (!config) {
    const created = await StoreSettings.create(DEFAULT_PRICING_SETTINGS);
    config = created.toObject();
  }

  return normalizePricingSettings(config);
}

export async function updateStorePricingSettings(
  input: PricingSettings
): Promise<PricingSettings> {
  const normalized = normalizePricingSettings(input);

  const updated = await StoreSettings.findOneAndUpdate(
    {},
    normalized,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean<PricingSettings>();

  return normalizePricingSettings(updated);
}

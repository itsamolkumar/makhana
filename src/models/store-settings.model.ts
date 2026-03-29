import { Schema, model, models } from "mongoose";
import { DEFAULT_PRICING_SETTINGS } from "@/lib/pricing";

export interface IStoreSettings {
  gstRate: number;
  serviceCharge: number;
  deliveryCharge: number;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    gstRate: {
      type: Number,
      default: DEFAULT_PRICING_SETTINGS.gstRate,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      default: DEFAULT_PRICING_SETTINGS.serviceCharge,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: DEFAULT_PRICING_SETTINGS.deliveryCharge,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings =
  models.StoreSettings || model("StoreSettings", storeSettingsSchema);

export default StoreSettings;

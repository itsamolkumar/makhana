import mongoose, { Schema, model, models } from "mongoose";

export interface ICoupon {

  code: string;

  discountType: "percentage" | "fixed";

  discountValue: number;

  minOrder: number;

  maxDiscount?: number;

  expiry: Date;

  usageLimit?: number;

  usedCount: number;

  isActive: boolean;

}

const couponSchema = new Schema<ICoupon>(
  {

    code: {

      type: String,

      required: true,

      unique: true,

      uppercase: true

    },

    discountType: {

      type: String,

      enum: ["percentage", "fixed"],

      required: true

    },

    discountValue: {

      type: Number,

      required: true

    },

    minOrder: {

      type: Number,

      default: 0

    },

    maxDiscount: {

      type: Number

    },

    expiry: {

      type: Date,

      required: true

    },

    usageLimit: {

      type: Number

    },

    usedCount: {

      type: Number,

      default: 0

    },

    isActive: {

      type: Boolean,

      default: true

    }

  },

  { timestamps: true }

);

couponSchema.index({ code: 1 });

const Coupon = models.Coupon || model("Coupon", couponSchema);

export default Coupon;
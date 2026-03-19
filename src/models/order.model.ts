import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  landmark?: string;
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId;

  orderItems: IOrderItem[];

  shippingAddress: IShippingAddress;

  paymentMethod: "razorpay" | "cod";

  paymentStatus: "pending" | "paid" | "failed";

  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";

  totalPrice: number;

  shippingPrice?: number;

  couponCode?: string;

  couponDiscount?: number;

  deliveredAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    orderItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        name: {
          type: String,
          required: true
        },

        price: {
          type: Number,
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        image: {
          type: String
        }
      }
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      pincode: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String }
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true
    },

    totalPrice: {
      type: Number,
      required: true
    },

    shippingPrice: {
      type: Number,
      default: 0
    },

    couponCode: {
      type: String
    },

    couponDiscount: {
      type: Number,
      default: 0
    },

    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ createdAt: -1 });

const Order = models.Order || model("Order", orderSchema);

export default Order;
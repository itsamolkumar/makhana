import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IOrderStatusTimeline {
  status: "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned";
  timestamp: Date;
  description?: string;
  location?: string;
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;

  orderNumber: string;

  user: mongoose.Types.ObjectId;

  orderItems: IOrderItem[];

  shippingAddress: IShippingAddress;

  billingAddress?: IShippingAddress;

  paymentMethod: "razorpay" | "cod" | "upi" | "netbanking";

  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  paymentId?: string;

  orderStatus: "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "returned";

  statusTimeline?: IOrderStatusTimeline[];

  subtotal: number;

  tax: number;

  gstRate?: number;

  serviceCharge: number;

  shippingPrice: number;

  couponCode?: string;

  couponDiscount: number;

  discount?: number;

  totalPrice: number;

  trackingNumber?: string;

  deliveryBoy?: mongoose.Types.ObjectId;

  notes?: string;

  cancellationReason?: string;

  returnReason?: string;

  deliveredAt?: Date;

  cancelledAt?: Date;

  estimatedDelivery?: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

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
        },

        sku: {
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
      landmark: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },

    billingAddress: {
      fullName: { type: String },
      mobile: { type: String },
      pincode: { type: String },
      state: { type: String },
      city: { type: String },
      area: { type: String },
      landmark: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "upi", "netbanking"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true
    },

    paymentId: {
      type: String
    },

    orderStatus: {
      type: String,
      enum: ["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "confirmed",
      index: true
    },

    statusTimeline: [
      {
        status: {
          type: String,
          enum: ["confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"]
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        description: { type: String },
        location: { type: String }
      }
    ],

    subtotal: {
      type: Number,
      required: true
    },

    tax: {
      type: Number,
      default: 0
    },

    gstRate: {
      type: Number,
      default: 0.18
    },

    serviceCharge: {
      type: Number,
      default: 0
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

    discount: {
      type: Number,
      default: 0
    },

    totalPrice: {
      type: Number,
      required: true
    },

    trackingNumber: {
      type: String,
      sparse: true
    },

    deliveryBoy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    notes: {
      type: String
    },

    cancellationReason: {
      type: String
    },

    returnReason: {
      type: String
    },

    deliveredAt: {
      type: Date
    },

    cancelledAt: {
      type: Date
    },

    estimatedDelivery: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
// Removed duplicate indexes - paymentStatus, orderStatus, and orderNumber already have index: true

const Order = models.Order || model("Order", orderSchema);

export default Order;

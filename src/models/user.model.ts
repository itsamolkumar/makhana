import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;

  name: string;

  email: string;

  password?: string;

  mobile?: string;

  role: "user" | "deliveryBoy" | "admin";

  image?: string;
  isVerified: boolean;
  isBlocked?: boolean;
  tokenVersion: number;
  addresses?: {
    fullName: string;
    mobile: string;
    pincode: string;
    state: string;
    city: string;
    area: string;
    landmark?: string;
    isDefault?: boolean;
  }[];

  location?: {
    type: "Point";
    coordinates: number[];
  };
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      select: false
    },

    mobile: {
      type: String
    },

    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user"
    },

    image: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    tokenVersion: {
      type: Number,
      default: 0
    },

    addresses: [
      {
        fullName: { type: String, required: true },

        mobile: { type: String, required: true },

        pincode: { type: String, required: true },

        state: { type: String, required: true },

        city: { type: String, required: true },

        area: { type: String, required: true },

        landmark: { type: String },

        isDefault: { type: Boolean, default: false }
      }
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },

      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ location: "2dsphere" });

// Prevent Mongoose from caching the old schema in Next.js development mode
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model("User", userSchema);

export default User;
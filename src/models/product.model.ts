import mongoose, { Schema, model, models } from "mongoose";

export interface IProduct {
_id?: mongoose.Types.ObjectId;
  name: string;

  slug: string;

  description?: string;

  price: number;

  category: string;

  images?: string[];

  weight: string;

  stock: number;

  ratings: number;

  numReviews: number;

  isActive: boolean;

}

const productSchema = new Schema<IProduct>(

  {

    name: {

      type: String,

      required: true,

      trim: true

    },

    slug: {

      type: String,

      required: true,

      unique: true,

      trim: true

    },

    description: {

      type: String

    },

    price: {

      type: Number,

      required: true

    },

    category: {

      type: String,

      required: true

    },

    images: [

      {

        type: String

      }

    ],

    weight: {

      type: String,

      required: true

    },

    stock: {

      type: Number,

      required: true,

      default: 0

    },

    ratings: {

      type: Number,

      default: 0

    },

    numReviews: {

      type: Number,

      default: 0

    },

    isActive: {

      type: Boolean,

      default: true

    }

  },

  {

    timestamps: true

  }

);


// Indexes for performance

productSchema.index({ slug: 1 });

productSchema.index({ category: 1 });

productSchema.index({ createdAt: -1 });

productSchema.index({ price: 1 });

const Product = models.Product || model("Product", productSchema);

export default Product;
import mongoose, { Schema, model, models } from "mongoose";

export interface ICartItem {

  product: mongoose.Types.ObjectId;

  quantity: number;

}

export interface ICart {

  _id?: mongoose.Types.ObjectId;

  user: mongoose.Types.ObjectId;

  items: ICartItem[];

}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {

      type: Schema.Types.ObjectId,

      ref: "Product",

      required: true

    },

    quantity: {

      type: Number,

      required: true,

      default: 1,

      min: 1

    }

  },
  {
    _id: false
  }
);

const cartSchema = new Schema<ICart>(
  {

    user: {

      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,

      unique: true

    },

    items: [cartItemSchema]

  },
  {
    timestamps: true
  }
);


// Index for faster cart lookup

cartSchema.index({ user: 1 });


const Cart = models.Cart || model("Cart", cartSchema);

export default Cart;
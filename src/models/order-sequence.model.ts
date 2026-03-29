import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderSequence {
  _id?: mongoose.Types.ObjectId;
  dateKey: string;
  currentValue: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSequenceSchema = new Schema<IOrderSequence>(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const OrderSequence = models.OrderSequence || model<IOrderSequence>("OrderSequence", orderSequenceSchema);

export default OrderSequence;

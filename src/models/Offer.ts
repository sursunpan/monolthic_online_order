import mongoose, { Document, Schema } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidaity: Date;
  promoCode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, required: true },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "vendor",
      },
    ],
    title: { type: String, required: true },
    description: { type: String },
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: Date,
    endValidaity: Date,
    promoCode: { type: String, required: true },
    promoType: { type: String, required: true },
    bank: [
      {
        type: String,
      },
    ],
    bins: [
      {
        type: Number,
      },
    ],
    pincode: { type: String, required: true },
    isActive: Boolean,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const OfferModel = mongoose.model<OfferDoc>("offer", OfferSchema);
export { OfferModel };

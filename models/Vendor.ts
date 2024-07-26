import mongoose, { Schema, Document, Model } from "mongoose";

interface VendorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: [string];
  rating: number;
  //   foods: any;
}

const VendorSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    foodType: [String],
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailable: Boolean,
    coverImage: [String],
    rating: Number,
    // food: [
    //   {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: "food",
    //   },
    // ],
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password, delete ret.salt, delete ret.__v;
      },
    },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Vendor = mongoose.model<VendorDoc>("vendor", VendorSchema);

export { Vendor };

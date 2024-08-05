import mongoose, { Document, Schema } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string;
  vendorId: string;
  items: [any];
  totalAmount: number;
  paidAmount: number;
  orderDate: Date;
  orderStauts: string;
  remarks: string;
  deliveryId: string;
  readyTime: number;
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    vendorId: String,
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: Number,
    OrderDate: Date,
    orderStatus: String,
    remarks: String,
    deliveryId: String,
    readyTime: Number,
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

const Order = mongoose.model<OrderDoc>("order", OrderSchema);
export { Order };

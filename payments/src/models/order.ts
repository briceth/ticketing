import mongoose from 'mongoose';
import { OrderStatus } from '@ms-ticketing-bth/common';

interface OrderAttrs {
  id: string;
  userId: string;
  version: number;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  id: string;
  userId: string;
  version: number;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    price: { type: Number, required: true },
  },
  {
    optimisticConcurrency: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id; // to be mongo agnostic
        delete ret._id;
      },
    },
  }
);

orderSchema.set('versionKey', 'version');

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

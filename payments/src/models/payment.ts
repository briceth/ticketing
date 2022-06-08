import mongoose from 'mongoose';

interface PaymentAttrs {
  stripeId: string;
  orderId: string;
}

interface PaymentDoc extends mongoose.Document {
  stripeId: string;
  orderId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true },
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

paymentSchema.set('versionKey', 'version');

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };

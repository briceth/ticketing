import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@ms-ticketing-bth/common';
import { PaymentCreatedPublisher } from '../events/publishers/paymentCreatedPublisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../natsWrapper';
import { stripe } from '../stripe';

const router = express.Router();

const schema = z.object({
  body: z.object({
    token: z.string({ required_error: 'token id is required' }).min(1),
    orderId: z.string({ required_error: 'orderId id is required' }).min(1),
  }),
});

router.post(
  '/api/payments',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('order not found');
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError('User is not authorized to initiate this payment');
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({ orderId, stripeId: charge.id });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };

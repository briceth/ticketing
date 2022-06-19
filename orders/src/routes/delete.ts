import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  UnauthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ms-ticketing-bth/common';
import { Order, OrderStatus } from '../models/order';
import { natsWrapper } from '../natsWrapper';
import { OrderCancelledPublisher } from '../events/publishers/orderCancelledPublisher';

const router = express.Router();

const schema = z.object({
  params: z.object({
    orderId: z.string({ required_error: 'valid orderId is required' }).length(24),
  }),
});

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('order not found');
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError('user is not authorized to delete this order');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };

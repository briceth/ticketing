import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  UnauthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ms-ticketing-bth/common';
import { Order } from '../models/order';

const router = express.Router();

const schema = z.object({
  params: z.object({
    orderId: z.string({ required_error: 'valid orderId is required' }).length(24),
  }),
});

router.get(
  '/api/orders/:orderId',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError('order not found');
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError('user is not authorized to access this order');
    }

    res.send(order);
  }
);

export { router as showOrderRouter };

import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@ms-ticketing-bth/common';

import { Order } from '../models/order';
import { Ticket } from '../models/ticket';

import { OrderCreatedPublisher } from '../events/publishers/orderCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

// env var
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const schema = z.object({
  body: z.object({
    ticketId: z.string({ required_error: 'ticketId is required' }).min(1),
  }),
});

router.post(
  '/api/orders',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('ticket not found');
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket.id,
    });
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(), // utc timestamp
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };

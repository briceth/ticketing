import express, { Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, validateRequest } from '@ms-ticketing-bth/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticketCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

const schema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }).min(1),
    price: z.number({ required_error: 'price must be greater than 5' }).gt(5),
  }),
});

router.post(
  '/api/tickets',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    if (!req.currentUser?.id) {
      throw new Error('User must be sign in.');
    }

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser.id,
    });
    await ticket.save();
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

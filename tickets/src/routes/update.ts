import express, { Request, Response } from 'express';
import { z } from 'zod';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@ms-ticketing-bth/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticketUpdatedPublisher';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

const schema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }).min(1),
    price: z.number({ required_error: 'price must be greater than 5' }).gt(5),
  }),
});

router.put(
  '/api/tickets/:id',
  requireAuth,
  validateRequest(schema),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError('User is not authorized to update this ticket');
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };

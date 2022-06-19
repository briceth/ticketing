import express, { Request, Response } from 'express';
import { NotFoundError, validateRequest } from '@ms-ticketing-bth/common';
import { Ticket } from '../models/ticket';
import { z } from 'zod';

const router = express.Router();

const schema = z.object({
  params: z.object({
    id: z.string({ required_error: 'valid id is required' }).length(24),
  }),
});

router.get('/api/tickets/:id', validateRequest(schema), async (req: Request, res: Response) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  res.send(ticket);
});

export { router as showTicketRouter };

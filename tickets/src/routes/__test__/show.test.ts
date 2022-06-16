import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const createTicket = async () => {
  const ticket = Ticket.build({
    title: 'title',
    price: 10,
    userId: '123456789',
  });

  await ticket.save();
  return ticket;
};

it('returns a 404 if the ticket is not found', async () => {
  await request(app).get('/api/tickets/000000000000000000000000').expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const ticket = await createTicket();

  const response = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .set('Cookie', signin())
    .expect(200);

  expect(response.body.title).toEqual('title');
  expect(response.body.price).toEqual(10);
});

import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const createTicket = async () => {
  const ticket = Ticket.build({
    title: 'title_1',
    price: 10,
    userId: '123456789',
  });

  await ticket.save();
};

it('returns a list of tickets', async () => {
  await createTicket();
  await createTicket();

  const reponse = await request(app).get(`/api/tickets`).set('Cookie', signin()).expect(200);

  expect(reponse.body.length).toEqual(2);
});

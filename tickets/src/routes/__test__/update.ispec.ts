import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../natsWrapper';

const createTicket = async ({ userId }: { userId?: string } = {}) => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'title_1',
    price: 10,
    userId: userId || id,
  });

  await ticket.save();
  return ticket;
};

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'title',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const ticket = await createTicket();

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', signin())
    .send({
      title: 'title',
      price: 20,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const ticket = await createTicket();

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', signin())
    .send({
      title: '',
      price: 20,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const cookie = signin(id);
  const ticket = await createTicket({ userId: id });

  const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  expect(response.body.title).toEqual('new title');
  expect(response.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const cookie = signin(id);
  const ticket = await createTicket({ userId: id });

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects if ticket is reserved', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const cookie = signin(id);
  const ticket = await createTicket({ userId: id });

  ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(400);
});

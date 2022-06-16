import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  //create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // save the ticket to the db
  await ticket.save();

  // fetch the ticket twice
  const first = await Ticket.findById(ticket.id);
  const second = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  first!.set({ price: 10 });
  second!.set({ price: 15 });

  // save the first fetched ticket
  await first!.save();

  // save the second fetched ticket
  expect(second!.save()).rejects.toThrow();
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  ticket.set({ price: 25 });
  await ticket.save();
  expect(ticket.version).toEqual(1);

  ticket.set({ price: 30 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

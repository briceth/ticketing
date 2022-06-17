import mongoose from 'mongoose';
import { serverConfig } from './config';
import { app } from './app';
import { natsWrapper } from './natsWrapper';
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener';
import { TicketUpdatedListener } from './events/listeners/ticketUpdatedListener';
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener';
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener';

const start = async () => {
  console.log('starting orders service...');

  const config = serverConfig(process.env);

  await natsWrapper.connect(config.NATS_CLUSTER_ID, config.NATS_CLIENT_ID, config.NATS_URL);
  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListener(natsWrapper.client).listen();
  new ExpirationCompleteListener(natsWrapper.client).listen();
  new PaymentCreatedListener(natsWrapper.client).listen();

  await mongoose.connect(config.MONGO_URI);

  console.log('connected to mongodb');

  app.listen(3000, () => {
    console.log('Listening on port 3000.');
  });
};

start().catch((error) => {
  console.log(error);
  process.exit();
});

import mongoose from 'mongoose';
import { app } from './app';
import { serverConfig } from './config';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('starting payments service...');

  const config = serverConfig(process.env);

  await natsWrapper.connect(config.NATS_CLUSTER_ID, config.NATS_CLIENT_ID, config.NATS_URL);
  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  new OrderCreatedListener(natsWrapper.client).listen();
  new OrderCancelledListener(natsWrapper.client).listen();

  // const url = `mongodb://${admin}:${password}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
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

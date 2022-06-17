import { serverConfig } from './config';
import { OrderCreatedListener } from './events/listener/orderCreatedListener';
import { natsWrapper } from './natsWrapper';

const start = async () => {
  console.log('starting expiration service...');

  const config = serverConfig(process.env);

  await natsWrapper.connect(config.NATS_CLUSTER_ID, config.NATS_CLIENT_ID, config.NATS_URL);
  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  new OrderCreatedListener(natsWrapper.client).listen();
};

start().catch((error) => {
  console.log(error);
  process.exit();
});

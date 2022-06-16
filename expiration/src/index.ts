import { serverConfig } from './config';
import { OrderCreatedListener } from './events/listener/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log('starting expiration service...');

  const config = serverConfig(process.env);

  try {
    await natsWrapper.connect(config.NATS_CLUSTER_ID, config.NATS_CLIENT_ID, config.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }
};

start();

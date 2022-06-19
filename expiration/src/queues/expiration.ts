import Queue from 'bull';
import { serverConfig } from '../config';
import { ExpirationCompletePublisher } from '../events/publishers/expirationCompletePublisher';
import { natsWrapper } from '../natsWrapper';

interface Payload {
  orderId: string;
}

const config = serverConfig(process.env);

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: config.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId: job.data.orderId });
});

export { expirationQueue };

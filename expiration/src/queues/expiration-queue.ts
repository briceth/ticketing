import Queue from 'bull';
import { serverConfig } from '../config';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const config = serverConfig(process.env);

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: config.REDIS_HOST,
  },
});

expirationQueue.process((job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId: job.data.orderId });
});

export { expirationQueue };

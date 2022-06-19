import Stripe from 'stripe';
import { serverConfig } from './config';

const config = serverConfig(process.env);

export const stripe = new Stripe(config.STRIPE_KEY, {
  apiVersion: '2020-08-27',
  typescript: true,
});

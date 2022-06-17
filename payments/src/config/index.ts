import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.string({ required_error: 'NODE_ENV must be defined' }),
  JWT_KEY: z.string({ required_error: 'JWT_KEY must be defined' }),
  MONGO_URI: z.string({ required_error: 'MONGO_URI must be defined' }),
  NATS_CLIENT_ID: z.string({ required_error: 'NATS_CLIENT_ID must be defined' }),
  NATS_URL: z.string({ required_error: 'NATS_URL must be defined' }),
  NATS_CLUSTER_ID: z.string({ required_error: 'NATS_CLUSTER_ID must be defined' }),
  STRIPE_KEY: z.string({ required_error: 'STRIPE_KEY must be defined' }),
});

type serverConfig = z.infer<typeof configSchema>;

export function serverConfig(env: NodeJS.ProcessEnv): serverConfig {
  return configSchema.parse(env);
}

import 'express-async-errors';
import { serverConfig } from './config';
import express from 'express';
import cookieSession from 'cookie-session';
import { json } from 'body-parser';

import { currentUser, errorHandler, NotFoundError } from '@ms-ticketing-bth/common';
import { createChargeRouter } from './routes/new';

const config = serverConfig(process.env);

const app = express();
app.set('trust proxy', true); // aware of ingress nginx
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: config.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

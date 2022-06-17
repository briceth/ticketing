import 'express-async-errors';
import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { serverConfig } from './config';

import { errorHandler, NotFoundError } from '@ms-ticketing-bth/common';

import { currentUserRouter } from './routes/currentUser';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', () => {
  throw new NotFoundError('not found');
});

app.use(errorHandler);

export { app };

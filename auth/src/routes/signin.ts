import express, { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@ms-ticketing-bth/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

const schema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is not valid' }).email(),
    password: z.string({ required_error: 'password is not valid' }).min(4),
  }),
});

router.post('/api/users/signin', validateRequest(schema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  const passwordMatch = await Password.compare(existingUser.password, password);
  if (!passwordMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt: userJwt,
  };

  res.status(200).send(existingUser);
});

export { router as signinRouter };

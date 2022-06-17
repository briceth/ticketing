import { z } from 'zod';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@ms-ticketing-bth/common';
import { User } from '../models/user';

const router = express.Router();

const schema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is not valid' }).email(),
    password: z.string({ required_error: 'password is not valid' }).min(4).max(20),
  }),
});

router.post('/api/users/signup', validateRequest(schema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email in use');
  }

  const user = User.build({ email, password });
  await user.save();

  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt: userJwt,
  };

  res.status(201).send(user);
});

export { router as signupRouter };

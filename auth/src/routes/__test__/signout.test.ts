import request from 'supertest';
import { app } from '../../app';

// make same tests as signup

it('clears the cookie after the signing out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@mail.com', password: 'password' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signout')
    .send({ email: 'test@mail.com', password: 'password' })
    .expect(200);

  expect(response.get('Set-Cookie')[0]).toBe(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});

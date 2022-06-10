import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log('starting auth service ...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    // const url = `mongodb://${admin}:${password}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
    await mongoose.connect(process.env.MONGO_URI);

    console.log('connected to mongodb');
  } catch (error) {
    console.log(error);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000.');
  });
};

start();

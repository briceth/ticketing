import mongoose from 'mongoose';
import { app } from './app';
import { serverConfig } from './config';

const start = async () => {
  console.log('starting auth service ...');

  const config = serverConfig(process.env);

  await mongoose.connect(config.MONGO_URI);

  console.log('connected to mongodb');

  app.listen(3000, () => {
    console.log('Listening on port 3000.');
  });
};

start().catch((error) => {
  console.log(error);
  process.exit();
});

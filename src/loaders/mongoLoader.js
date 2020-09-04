import mongoose from 'mongoose';
import config from '../config/index.js';

export default async function mongoInit() {
  const { url } = config.database;

  const db = await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  console.log('Mongo initialized.');
  return db.connection.db;
}

import mongoInit from './mongoLoader.js';
import serverInit from './serverLoader.js';
import socketInit from './socketLoader.js';
import fillDB from './fillDB.js';

export default async function loadersInit(app, socketSubscriptions) {
  await mongoInit();
  console.log('Database Initialized.');
  await fillDB();
  console.log('DB Filled with initial position.');
  await serverInit(app);
  console.log('Server Initialized.');
  socketInit(socketSubscriptions);
}

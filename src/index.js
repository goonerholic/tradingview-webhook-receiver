import express from 'express';
import loadersInit from './loaders/index.js';
import socketSubscriptions from './subscription/socket/index.js';

(async function startServer() {
  const app = express();
  await loadersInit(app, socketSubscriptions);
})();

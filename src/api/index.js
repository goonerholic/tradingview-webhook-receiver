import express from 'express';
//import settings from './settings.js';
import tv from './tv.js';
import result from './result.js';

const api = express.Router();

api.use('/tv', tv);
api.use('/result', result);
//api.use('/settings', settings);

export default api;

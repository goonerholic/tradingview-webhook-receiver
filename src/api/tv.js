import express from 'express';
import { display, validate, call } from './controllers/tv.ctrl.js';

const tv = express.Router();

tv.get('/', display);
tv.post('/', validate, call);

export default tv;

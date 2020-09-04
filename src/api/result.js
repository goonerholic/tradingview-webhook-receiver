import express from 'express';
import { listResult } from './controllers/result.ctrl.js';

const result = express.Router();

result.get('/', listResult);

export default result;

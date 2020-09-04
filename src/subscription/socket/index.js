import { onPosition } from './onPosition.js';
import { onOrder } from './onOrder.js';

const socketSubscriptions = {
  position: onPosition,
  order: onOrder,
};

export default socketSubscriptions;

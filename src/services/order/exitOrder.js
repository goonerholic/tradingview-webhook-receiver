import { placeOrder } from '../../lib/bitmex.js';

export const exitOrder = async (symbol, currentQty, price, timeout) => {
  const side = currentQty > 0 ? 'Sell' : 'Buy';
  try {
    const exitOrder = await placeOrder({
      symbol,
      side,
      price,
      orderQty: Math.abs(currentQty),
      text: `${side === 'Buy' ? 'Short' : 'Long'} Exit.`,
      timeout,
    });
    if (!exitOrder) return;
    return exitOrder;
  } catch (e) {
    console.error('exitOrder', e);
  }
};

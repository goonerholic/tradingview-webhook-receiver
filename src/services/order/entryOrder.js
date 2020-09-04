import {
  placeOrder,
  getMargin,
  marketOrder,
  limitOrder,
} from '../../lib/bitmex.js';

export const entryOrder = async ({
  symbol,
  sizeType,
  size,
  price,
  side,
  timeout,
  leverage,
  type,
}) => {
  const { availableMargin } = await getMargin();

  let orderQty = size;
  if (sizeType === 'percent') {
    const tempQty = Math.floor(availableMargin * leverage * price * size);
    const digit = Math.pow(10, tempQty.toString().length - 2);
    orderQty = Math.floor(tempQty / digit) * digit;
  }

  const text = `${side === 'Buy' ? 'Long' : 'Short'} Entry`;
  let entryOrder;
  if (type === 'Market') {
    entryOrder = await marketOrder({ symbol, side, orderQty, text });
  } else if (type === 'Limit') {
    entryOrder = await limitOrder({ symbol, side, orderQty, price, text });
  } else {
    entryOrder = await placeOrder({
      symbol,
      side,
      price,
      orderQty,
      text: `${side === 'Buy' ? 'Long' : 'Short'} Entry`,
      timeout,
    });
  }
  if (!entryOrder) return;
  return entryOrder;
};

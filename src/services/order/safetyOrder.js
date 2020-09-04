import { stopMarket, limitOrder } from '../../lib/bitmex.js';

export const safetyOrder = async (
  symbol,
  targetLevel,
  stopLevel,
  currentQty,
  avgEntryPrice,
) => {
  const coeff = Math.abs(currentQty) / currentQty;
  const stopPx = Math.floor(avgEntryPrice * (1 - (coeff * stopLevel) / 100));
  const targetPx = Math.floor(
    avgEntryPrice * (1 + (coeff * targetLevel) / 100),
  );

  const side = coeff > 0 ? 'Sell' : 'Buy';
  const orderQty = Math.abs(currentQty);
  try {
    await stopMarket({
      symbol,
      side,
      stopPx,
      orderQty,
      text: 'Stop',
    });
    await limitOrder({
      symbol,
      side,
      orderQty,
      price: targetPx,
      text: 'Target',
      execInst: 'ReduceOnly',
    });
  } catch (e) {
    console.error('safetyOrder', e);
  }
};

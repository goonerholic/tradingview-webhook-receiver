import { getMargin } from '../../lib/bitmex.js';

export const updateResult = async (symbol, model) => {
  const [result] = await model.findBySymbol(symbol).limit(1);
  let { total, won, lost, netPnl } = result;
  const { walletBalance } = await getMargin();
  total++;
  const pnl = walletBalance - result.walletBalance;
  netPnl += pnl.toFixed(5) * 1;
  if (pnl > 0) {
    won++;
  } else {
    lost++;
  }

  return await model.create({
    symbol,
    total,
    won,
    lost,
    netPnl,
    walletBalance,
  });
};

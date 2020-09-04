import { getPosition, getMargin } from '../lib/bitmex.js';
import config from '../config/index.js';
import Position from '../models/position.js';
import Result from '../models/result.js';

const { symbol } = config.settings;

export default async function fillDB() {
  try {
    const { walletBalance } = await getMargin();

    await Position.deleteMany();
    const results = await Result.findBySymbol('XBTUSD');
    if (!results.length) {
      await Result.create({
        symbol,
        total: 0,
        won: 0,
        lost: 0,
        netPnl: 0,
        walletBalance,
      });
    }
  } catch (e) {
    console.error('initialize', e);
  }
}

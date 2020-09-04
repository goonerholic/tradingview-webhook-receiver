import { exitOrder } from '../order/exitOrder.js';
import Signal from '../../models/signal.js';
import { getPosition, cancelAll } from '../../lib/bitmex.js';
import config from '../../config/index.js';
import { entryOrder } from '../order/entryOrder.js';

const { leverage, timeout, size } = config.settings;

export async function handleTVSignal(symbol, side, price) {
  try {
    let exit, entry;
    const [position] = await getPosition(symbol);
    if (position && position.isOpen) {
      const { currentQty } = position;
      if (
        (currentQty > 0 && side === 'Buy') ||
        (currentQty < 0 && side === 'Sell')
      ) {
        return `같은 사이드에 포지션이 존재합니다.`;
      }
      exit = await exitOrder(symbol, currentQty, price, timeout);
    }

    await Signal.create({ symbol, side, price });
    await cancelAll(symbol, 'cancel');
    entry = await entryOrder({
      symbol,
      sizeType: 'percent',
      size,
      price,
      side,
      timeout,
      leverage,
    });
    if (!entry) {
      let count = 0;
      while (count < 5) {
        entry = await entryOrder({
          symbol,
          sizeType: 'percent',
          size,
          price,
          side,
          timeout,
          leverage,
          type: 'Market',
        });

        if (entry) break;
        count++;
      }
      if (!entry) return console.log('주문 실패');
    }
    return `주문 완료 - exit: ${exit ? 1 : 0}, entry: 1`;
  } catch (e) {
    console.error('handleTVSignal', e);
  }
}

export async function listSignals(symbol) {
  try {
    const signals = await Signal.findBySymbol(symbol);

    return signals;
  } catch (e) {
    console.error('listSignals', e);
  }
}

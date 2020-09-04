import { checkPosition } from '../../services/position/checkPosition.js';
import { updateResult } from '../../services/position/updateResult.js';
import Result from '../../models/result.js';
import { safetyOrder } from '../../services/order/safetyOrder.js';
import { cancelAll } from '../../lib/bitmex.js';
import config from '../../config/index.js';
import Signal from '../../models/signal.js';
import Position from '../../models/position.js';

const { target, stop } = config.settings;

let state = {
  isOpen: false,
  currentQty: 0,
  avgEntryPrice: null,
};

export const onPosition = async (data, symbol) => {
  try {
    if (!data.length) {
      console.log('No data!');
      return;
    }
    //console.log(state);
    const position = checkPosition(data, state); // returns timestamp, isOpen, currentQty, avgEntryPrice when position updated.
    if (!position) return;
    console.log('포지션이 변경되었습니다.');
    const { isOpen, currentQty, avgEntryPrice } = position;
    state = { isOpen, currentQty, avgEntryPrice };
    await cancelAll(symbol);
    if (!isOpen) {
      console.log('포지션이 종료되었습니다.');
      await updateResult(symbol, Result);
      return;
    }

    const [signal] = await Signal.findBySymbol(symbol).limit(1);
    await safetyOrder(symbol, target, stop, currentQty, signal.price);
    await Position.create({
      symbol,
      isOpen,
      currentQty,
      avgEntryPrice,
    });
    console.log('포지션이 DB에 기록되었습니다.');
  } catch (e) {
    console.error(e);
  }
};

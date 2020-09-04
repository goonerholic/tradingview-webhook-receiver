import Position from '../../models/position.js';

export const checkPosition = (data, state) => {
  const [position] = data.slice(-1);
  const { isOpen, currentQty, avgEntryPrice, timestamp } = position;
  try {
    if (
      isOpen === state.isOpen &&
      currentQty === state.currentQty &&
      avgEntryPrice === state.avgEntryPrice
    )
      return;
    return { timestamp, isOpen, currentQty, avgEntryPrice };
  } catch (e) {
    console.error(e);
  }
};

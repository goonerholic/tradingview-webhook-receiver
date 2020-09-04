import Order from '../../models/order.js';

export const onOrder = async (data, symbol) => {
  const [order] = data.slice(-1);
  if (!order) return;
  if (order.workingIndicator) return;
  if (order.ordStatus === 'Canceled') {
    console.log('주문이 취소되었습니다.');
    return;
  }
  if (order.ordStatus === 'New') {
    console.log(`${order.text} - 주문이 제출되었습니다.(${order.ordType})`);
    return;
  }
  if (order.ordStatus === 'Filled') {
    const {
      timestamp,
      orderID,
      orderQty,
      side,
      price,
      ordType,
      text,
      ordStatus,
    } = order;
    console.log(`${order.text} - 주문이 체결되었습니다.(${order.ordType})`);

    await Order.create({
      symbol,
      timestamp,
      orderID,
      orderQty,
      side,
      price,
      ordType,
      ordStatus,
      text,
    });
  }
};

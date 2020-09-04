import express from 'express';
import {
  getPosition,
  getMargin,
  placeOrder,
  stopMarket,
  cancelAll,
  limitOrder,
} from './lib/bitmex.js';
import config from './config/index.js';
import BitMEXClient from 'bitmex-realtime-api';
import Order from './models/order.js';

const { port, keyword } = config;
const { symbol, leverage, timeout, stop, target } = config.settings;
const { testnet, key, secret, testnet_key, testnet_secret } = config.bitmex;

let state = {
  isOpen: false,
  currentQty: 0,
  avgEntryPrice: null,
};

const strategyInfo = {
  total: 4,
  won: 3,
  lost: 1,
  netPnl: 0.01392,
  walletBalance: 0,
};

getMargin().then(
  ({ walletBalance }) => {
    strategyInfo.walletBalance = walletBalance * 1;
  },
  reason => {
    console.log(`Error: ${reason}`);
  },
);

const client = new BitMEXClient({
  testnet,
  apiKeyID: testnet ? testnet_key : key,
  apiKeySecret: testnet ? testnet_secret : secret,
});

client.addStream(symbol, 'order', async data => {
  const [order] = data.slice(-1);

  if (order.workingIndicator) return;
  if (order.ordStatus === 'Canceled') {
    await Order.findOneAndUpdate(
      { orderID: order.orderID },
      { ordStatus: order.ordStatus },
    );
    return;
  }

  const {
    symbol,
    timestamp,
    orderID,
    orderQty,
    side,
    price,
    ordType,
    text,
  } = order;

  await Order.create({
    symbol,
    timestamp,
    orderID,
    orderQty,
    side,
    price,
    ordType,
    text,
  });
});

client.addStream(symbol, 'position', async data => {
  const [position] = data.slice(-1);
  const { isOpen, currentQty, avgEntryPrice } = position;
  const temp = {
    isOpen,
    currentQty,
    avgEntryPrice,
  };
  if (JSON.stringify(state) === JSON.stringify(temp)) return;
  state = temp;
  await cancelAll(symbol, 'canceled');
  const { walletBalance } = await getMargin();
  if (strategyInfo.walletBalance === 0)
    strategyInfo.walletBalance = walletBalance;
  if (isOpen) {
    const coeff = Math.abs(currentQty) / currentQty;
    try {
      const stopOrder = await stopMarket(
        symbol,
        coeff > 0 ? 'Sell' : 'Buy',
        Math.floor(avgEntryPrice * (1 - coeff * (stop / 100))),
        Math.abs(currentQty),
        'Stop',
      );
      const targetOrder = await limitOrder({
        symbol,
        side: coeff > 0 ? 'Sell' : 'Buy',
        orderQty: Math.abs(currentQty),
        price: Math.floor(avgEntryPrice * (1 + coeff * (target / 100))),
        text: 'Target',
        execInst: 'ReduceOnly',
      });
      console.log('타겟, 스탑 주문이 제출되었습니다.');
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log('포지션이 종료되었습니다.');
    strategyInfo.total++;
    const { walletBalance: marginAfterClose } = await getMargin();
    const profit = marginAfterClose - strategyInfo.walletBalance;
    /* eslint-disable */
    strategyInfo.walletBalance = marginAfterClose;
    strategyInfo.netPnl += profit.toFixed(5) * 1;
    if (profit > 0) strategyInfo.won++;
    if (profit < 0) strategyInfo.lost++;
  }
});

client.addStream(symbol, 'trade', async data => {
  const [trade] = data.slice(-1);
});

const app = express();

const trade = async (req, res) => {
  try {
    const { side, price, validation } = req.body;
    if (validation !== keyword) {
      res.status(401).send(`Unauthorized.`);
      return;
    }
    const [position] = await getPosition(symbol);

    if (position && position.isOpen) {
      const { currentQty } = position;
      if (
        (currentQty > 0 && side === 'Buy') ||
        (currentQty < 0 && side === 'Sell')
      ) {
        res.status(200).send('이미 포지션이 있습니다.');
        return;
      }
      const exitOrder = await placeOrder({
        symbol,
        side,
        orderQty: Math.abs(currentQty),
        text: `${side === 'Buy' ? 'Short' : 'Long'} Exit.`,
        timeout,
      });
      if (!exitOrder) return;
      console.log('포지션이 종료되었습니다.');
    }

    const { availableMargin } = await getMargin();
    let orderQty = Math.floor(availableMargin * leverage * price * 0.9);
    const digit = Math.pow(10, orderQty.toString().length - 1);
    orderQty = Math.floor(orderQty / digit) * digit;

    const entryOrder = await placeOrder({
      symbol,
      side,
      orderQty,
      text: `${side === 'Buy' ? 'Long' : 'Short'} Entry`,
      timeout,
    });
    if (!entryOrder) return;
    console.log('진입 주문이 체결되었습니다.');
    res.status(200).send('거래가 정상적으로 동작하였습니다.');
  } catch (e) {
    res.status(500).send('서버 에러');
    console.error(e);
  }
};

const showResult = (req, res) => {
  res.send(strategyInfo);
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', trade);
app.get('/', showResult);
app.listen(port, () => console.log(`Server is listening on port ${port}.`));

(async function main() {
  await mongoInit();
  serverInit();
  socketInit();
})();

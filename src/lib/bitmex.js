import axios from 'axios';
import crypto from 'crypto';
import qs from 'qs';
import config from '../config/index.js';

export const client = async (method, endPoint, data = {}) => {
  const PATH = '/api/v1/';
  // if you do not want to use process environment, just assign your key, secret to the variables directly
  const { key, secret, testnet_key, testnet_secret, testnet } = config.bitmex;

  const baseUrl = testnet
    ? 'https://testnet.bitmex.com'
    : 'https://www.bitmex.com';

  const expires = Math.round(Date.now() / 1000) + 60;
  const path = PATH + endPoint;
  let query = '',
    postBody = '';

  if (method === 'GET') query = '?' + qs.stringify(data);
  else postBody = JSON.stringify(data);

  const signature = crypto
    .createHmac('sha256', testnet ? testnet_secret : secret)
    .update(method + path + query + expires + postBody)
    .digest('hex');

  // prettier-ignore
  const headers = {
		'content-type': 'application/json',
		'accept': 'application/json',
		'api-expires': expires,
		'api-key': testnet ? testnet_key : key,
		'api-signature': signature,
    }

  const url = baseUrl + path + query;

  const options = {
    method,
    headers,
  };

  if (method !== 'GET') options.data = postBody;

  try {
    const response = await axios(url, options);
    if ('error' in response.data) throw new Error(response.error.message);
    return response.data;
  } catch (e) {
    if (e.response) {
      console.error('Error:', e.response.data.error.message);
    } else if (e.request) {
      console.error(e.request);
    } else {
      console.error(e);
    }
  }
};

export const getCandles = async ({ symbol, binSize, count, endTime }) => {
  try {
    const result = await client('GET', 'trade/bucketed', {
      symbol,
      binSize,
      count,
      reverse: true,
      endTime,
      columns: [
        'symbol',
        'timestamp',
        'open',
        'high',
        'low',
        'close',
        'volume',
      ],
    });

    if (!result || !result.length) {
      throw new Error('Invalid request data');
    }
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const getMargin = async () => {
  try {
    const result = await client('GET', 'user/margin', {
      currenty: 'XBt',
    });
    const { availableMargin, walletBalance } = result;
    return {
      availableMargin: (availableMargin * 10e-9).toFixed(5),
      walletBalance: (walletBalance * 10e-9).toFixed(5),
    };
  } catch (e) {
    console.error(e);
  }
};

export const placeOrder = async ({
  symbol,
  side,
  price,
  orderQty,
  text,
  timeout,
  execInst,
}) => {
  try {
    const limit = await limitOrder({
      symbol,
      side,
      orderQty,
      price,
      text,
      execInst,
    });
    if (!limit) throw 'Error: failed to place order';
    
    const order = await new Promise(resolve => {
      setTimeout(async () => {
        resolve(await getOrderByOrderID(symbol, limit.orderID));
      }, timeout);
    });
    
    if (order[0].leavesQty === 0) return order[0];
    await cancelOrder(order[0].orderID);
    
    const market = await marketOrder({
      symbol,
      side,
      orderQty: order[0].leavesQty,
      text,
      execInst,
    });
    return market;
  } catch (e) {
    console.error(e);
  }
};

export const getPosition = async symbol => {
  try {
    return await client('GET', 'position', {
      filter: { symbol },
      columns: [
        'currentQty',
        'isOpen',
        'avgEntryPrice',
        'breakEvenPrice',
        'unrealisedPnl',
        'unrealisedPnlPcnt',
      ],
    });
  } catch (e) {
    console.error(e);
  }
};

export const getQuote = async symbol => {
  try {
    const result = await client('GET', 'instrument', {
      symbol,
      columns: ['askPrice', 'bidPrice', 'lastPrice'],
      count: 1,
      reverse: true,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const limitOrder = async ({
  symbol,
  side,
  orderQty,
  price,
  text,
  execInst = '',
}) => {
  try {
    const result = await client('POST', 'order', {
      symbol,
      side,
      orderQty,
      price,
      text,
      execInst,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const marketOrder = async ({
  symbol,
  side,
  orderQty,
  text = '',
  execInst = '',
}) => {
  try {
    const result = await client('POST', 'order', {
      symbol,
      side,
      orderQty,
      text,
      execInst,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const trailingStopOrder = async ({
  symbol,
  side,
  orderQty,
  pegOffsetValue,
  text,
  execInst,
}) => {
  try {
    const result = await client('POST', 'order', {
      symbol,
      side,
      orderQty,
      pegOffsetValue,
      pegPriceType: 'TrailingStopPeg',
      text,
      execInst,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const stopMarket = async ({ symbol, side, stopPx, orderQty, text }) => {
  try {
    const result = await client('POST', 'order', {
      symbol,
      side,
      stopPx,
      orderQty,
      ordType: 'Stop',
      execInst: 'LastPrice',
      text,
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const getOrderByOrderID = async (symbol, orderID) => {
  try {
    const result = await client('GET', 'order', {
      symbol,
      filter: { orderID },
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const getOrderByText = async (symbol, text) => {
  try {
    const result = await client('GET', 'order', {
      symbol,
      filter: { text },
      reverse: true,
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const cancelOrder = async orderID => {
  try {
    const result = await client('DELETE', 'order', {
      orderID,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

export const getOpenOrders = async (symbol, filter) => {
  try {
    const result = await client('GET', 'order', {
      symbol,
      filter: { ...filter, ordStatus: 'New' },
      reverse: true,
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const cancelAll = async (symbol, text) => {
  try {
    const result = await client('DELETE', 'order/all', {
      symbol,
      text,
    });

    return result;
  } catch (e) {
    console.error(e);
  }
};

export const bulkOrder = async orders => {
  try {
    const result = await client('POST', 'order/bulk', {
      orders,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

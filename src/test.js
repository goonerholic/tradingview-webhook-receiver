import config from './config/index.js';
import BitMEXClient from 'bitmex-realtime-api';

const { testnet, key, secret, testnet_key, testnet_secret } = config.bitmex;
const { symbol, leverage, timeout } = config.settings;

const client = new BitMEXClient({
  testnet,
  apiKeyID: testnet ? testnet_key : key,
  apiKeySecret: testnet ? testnet_secret : secret,
});

client.addStream(symbol, 'position', async data => {
  const [position] = data.slice(-1);

  const { isOpen, currentQty, avgEntryPrice } = position;
  console.log({ isOpen, currentQty, avgEntryPrice });
});

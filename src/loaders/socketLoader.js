import BitMEXClient from 'bitmex-realtime-api';
import config from '../config/index.js';

export default async function socketInit(subscriptions) {
  const { key, secret, testnet_key, testnet_secret, testnet } = config.bitmex;
  const { symbol } = config.settings;

  const client = new BitMEXClient({
    apiKeyID: testnet ? testnet_key : key,
    apiKeySecret: testnet ? testnet_secret : secret,
    testnet,
  });

  for (let event in subscriptions) {
    client.addStream(symbol, event, subscriptions[event]);
  }

  return client;
}

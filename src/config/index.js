import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT,
  keyword: process.env.KEYWORD,
  bitmex: {
    key: process.env.BITMEX_KEY,
    secret: process.env.BITMEX_SECRET,
    testnet_key: process.env.TESTNET_KEY,
    testnet_secret: process.env.TESTNET_SECRET,
    testnet: process.env.TESTNET === 'true' ? true : false,
  },
  settings: {
    size: process.env.ORDER_SIZE,
    leverage: process.env.LEVERAGE,
    timeout: process.env.TIMEOUT,
    symbol: process.env.SYMBOL,
    stop: process.env.STOP,
    target: process.env.TARGET,
  },
  database: {
    url: process.env.DB_URI,
    id: process.env.DB_ID,
    password: process.env.DB_PASSWORD,
  },
};

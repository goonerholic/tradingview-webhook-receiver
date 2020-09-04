import config from '../../config/index.js';
import { handleTVSignal, listSignals } from '../../services/tvSignal/index.js';
const { keyword } = config;

export const validate = (req, res, next) => {
  const { validation } = req.body;
  if (validation !== keyword) {
    res.status(401).send(`Unauthorized.`);
    return;
  }
  next();
};

export const call = async (req, res) => {
  const { symbol, side, price } = req.body;
  if (!side || !price || !symbol) {
    res.status(400).send('Bad request.');
  }

  try {
    console.log(
      `Tradingview 시그널이 도착했습니다. side: ${side}, price: ${price}`,
    );
    const result = await handleTVSignal(symbol, side, price);
    console.log(result);
    if (!result) {
      res.status(500).send(`Request Failed.`);
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(`Server Error.`);
    console.error(e);
  }
};

export const display = async (req, res) => {
  const { symbol } = req.query;
  const signals = await listSignals(symbol);
  if (!signals) {
    res.status(500).send(`No data available.`);
    return;
  }
  res.status(200).send(signals);
};

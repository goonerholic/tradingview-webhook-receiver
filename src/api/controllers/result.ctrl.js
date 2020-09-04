import Result from '../../models/result.js';

export const listResult = async (req, res) => {
  const { symbol } = req.query;
  const result = await Result.findBySymbol(symbol);

  if (!result) {
    res.status(500).send('Server Error.');
  }
  res.status(200).send(result);
};

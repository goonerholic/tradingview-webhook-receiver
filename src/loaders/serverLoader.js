import bodyParser from 'body-parser';
import config from '../config/index.js';
import api from '../api/index.js';

export default async function serverInit(app) {
  const { port } = config;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/api', api);

  app.listen(port, () => console.log(`Server is listening on port ${port}.`));
}

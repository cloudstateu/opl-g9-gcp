const { v4: uuidv4 } = require('uuid');

module.exports = (app) => {
  app.get('/healthz', (_, res) => {
    res.json({ status: 'ok', data: process.env });
  });

  app.post('/', (req, res) => {
    const result = { order: { id: uuidv4() } };
    req.log.info({ ...result, message: 'Order created' });

    res.json(result);
  });

  app.post('/:orderId/status', (req, res) => {
    const orderId = req.params.orderId;
    const status = req.body.status;
    req.log.info({ order: { id: orderId, status }, message: `Order status updated. New status: ${status}` });

    res.sendStatus(201);
  });

  return app;
};

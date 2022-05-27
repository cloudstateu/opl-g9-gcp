if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
}

const express = require('express');
const lb = require('@google-cloud/logging-bunyan');

async function startServer() {
  const { _logger, mw } = await lb.express.middleware({
    logName: 'orders'
  });

  const app = express();
  app.use(mw);
  app.use(express.json());

  const router = express.Router();
  const routes = require('./routes')(router, {});

  app.use(`/${process.env.GAE_SERVICE}`, routes);

  app.use((err, req, res, _next) => {
    req.log.error(err);
    res.status(500).json({ status: 'fail', error: err.message });
  });

  const port = process.env.PORT || 8080;
  app.listen(port, console.log(`Application is listening on port ${port}...`));
}

startServer();

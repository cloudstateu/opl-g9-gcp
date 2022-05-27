if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
}

const express = require('express');
const bunyan = require('bunyan');
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

const loggingBunyan = new LoggingBunyan();
const logger = bunyan.createLogger({
  name: 'payments',
  streams: [ loggingBunyan.stream('info') ]
});

const app = express();
app.use(express.json());

const router = express.Router();
const routes = require('./routes')(router, logger, {});

app.use(`/${process.env.GAE_SERVICE}`, routes);

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ status: 'fail', error: err.message });
});

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Application is listening on port ${port}...`));

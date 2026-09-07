'use strict';
/**
 * @file Main entrypoint for the webring
 * @author Asteria Hart <asteria@strawbs.io>
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import Logger from './logger.js';
import config from './config.js';
import { RingError, ErrorCode } from './errors.js';

import ringRouter from './routes/ring.js';
import integrationRouter from './routes/integration.js';

const PORT = config.get('web.port');

async function bootstrap() {
  console.log(`log level: ${config.get('logging.level')}`);
  Logger.setLevel(config.get('logging.level'));
  const app = express();
  // set headers and basic security stuff
  app.use(helmet());
  app.use(cors());
  // we parse json here
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // do the thing!
  app.use((req, res, next) => {
    Logger.info(`[START]\t${req.method} ${req.path}`);
    const originalSend = res.send;
    res.send = (...args) => {
      Logger.info(`[END]\t\t${req.method} ${req.path} (${res.statusCode})`);
      return originalSend.apply(res, args);
    };

    const originalRedir = res.redirect;

    res.redirect = (...args) => {
      Logger.info(`[REDIR]\t${req.method} ${req.path} -> (${args[0]})`);
      return originalRedir.apply(res, args);
    };

    next();
  });

  app.use('/integration', integrationRouter);
  app.use('/ring', ringRouter);

  app.use((error, req, res, next) => {
    if (error instanceof RingError && error.httpError) {
      Logger.warn(error.message);
      return res.status(error.httpError).json({
        error: error.message,
        errorCode: error.errorCode,
      });
    }
    Logger.error(error.message);
    return res.status(500).json({
      error: error.message,
      errorCode: ErrorCode.GenericError,
    });
  });

  app.listen(PORT);
  return app;
}

(async () => {
  await bootstrap();
  Logger.info(`Listening on port ${PORT}`);
})();

'use strict';
/**
 * @file Main entrypoint for the webring
 * @author Asteria Hart <asteria@strawbs.io>
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config.js';
import Ring from './ring/index.js';
import {
  RingError,
  NotFoundError,
  BadRequestError,
  ErrorCode,
} from './errors.js';
import { IntegrationId } from './integrations/common.js';
import IntegrationEntrypointMap from './integrations/index.js';

import ringRouter from './routes/ring.js';
import integrationRouter from './routes/integration.js';

const PORT = config.get('web.port');

async function bootstrap() {
  const app = express();
  // set headers and basic security stuff
  app.use(helmet());
  app.use(cors());
  // we parse json here
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // do the thing!
  app.use((req, res, next) => {
    console.log(
      `${new Date().toISOString()}:[START]\t${req.method} ${req.path}`,
    );
    const originalSend = res.send;
    res.send = (...args) => {
      console.log(
        `${new Date().toISOString()}:[END]\t\t${req.method} ${req.path} (${res.statusCode})`,
      );
      return originalSend.apply(res, args);
    };

    const originalRedir = res.redirect;

    res.redirect = (...args) => {
      console.log(
        `${new Date().toISOString()}:[REDIR]\t${req.method} ${req.path} -> (${args[0]})`,
      );
      return originalRedir.apply(res, args);
    };

    next();
  });

  // Integration router needs to be mounted first to avoid attempting to
  // validate the "integration" segment as a direction key
  app.use('/', integrationRouter);
  app.use('/', ringRouter);

  app.use((error, req, res, next) => {
    console.error(error.message, error.stack);
    if (error instanceof RingError && error.httpError) {
      return res.status(error.httpError).json({
        error: error.message,
        errorCode: error.errorCode,
      });
    }
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
  console.log(`Listening on port ${PORT}`);
})();

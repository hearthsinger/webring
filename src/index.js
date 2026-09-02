'use strict';
/**
 * @file Main entrypoint for the webring
 * @author Asteria Hart <asteria@strawbs.io>
 */
import express from 'express';
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

const PORT = config.get('web.port');

async function bootstrap() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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

  app.get('/:key/:direction', (req, res, next) => {
    const { key, direction } = req.params;

    try {
      if (!['next', 'prev'].includes(direction)) {
        throw new BadRequestError(
          'Invalid ring direction - expected one of "prev" or "next"',
        );
      }

      if (!Ring.hasMember(key)) {
        throw new NotFoundError('Invalid ring member');
      }

      return res.redirect(Ring.getMember(key)[direction].url);
    } catch (err) {
      next(err);
    }
  });

  app.get('/:key/integration/:integrationId', async (req, res, next) => {
    const { key, integrationId: intId } = req.params;

    try {
      if (!(intId in IntegrationId)) {
        throw new BadRequestError('Invalid integration');
      }

      if (!Ring.hasMember(key)) {
        throw new NotFoundError('Invaild ring member');
      }
      const member = Ring.getMember(key);
      if (!member.hasIntegration(intId)) {
        throw new NotFoundError('No integration configuraton for this member');
      }

      const func = IntegrationEntrypointMap[intId];
      const integrationRes = await func(member);
      return res.status(200).json(integrationRes);
    } catch (err) {
      next(err);
    }
  });

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

'use strict';
/**
 * @file routes for the integration api
 */

import { Router } from 'express';

import {
  validateIntegrationIdMiddleware,
  validateMemberMiddleware,
} from './utils/validation.js';
import { BadRequestError, NotFoundError, UnknownError } from '../errors.js';

import Ring from '../ring/index.js';
import IntegrationEntrypointMap from '../integrations/index.js';

const router = Router();

router.use('/:key/integration/:integrationId', validateMemberMiddleware);
router.use('/:key/integration/:integrationId', validateIntegrationIdMiddleware);

router.get('/:key/integration/:integrationId', async (req, res, next) => {
  const { key, integrationId: intId } = req.params;

  try {
    const member = Ring.getMember(key);
    if (!member.hasIntegration(intId)) {
      throw new NotFoundError('No integration configuration for this member');
    }

    const func = IntegrationEntrypointMap[intId];
    const callRes = await func(member);
    return res.status(200).json(callRes);
  } catch (err) {
    next(err);
  }
});

export default router;

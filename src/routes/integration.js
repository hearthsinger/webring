'use strict';
/**
 * @file routes for the integration api
 * @author Asteria Hart <asteria@strawbs.io>
 */

import { Router } from 'express';

import {
  validateIntegrationIdMiddleware,
  validateMemberMiddleware,
} from './utils/validation.js';
import { NotFoundError } from '../errors.js';

import Ring from '../ring/index.js';
import IntegrationEntrypointMap from '../integrations/index.js';

const router = Router();

router.use('/:key/:integrationId', validateMemberMiddleware);
router.use('/:key/:integrationId', validateIntegrationIdMiddleware);

router.get('/:key/:integrationId', async (req, res, next) => {
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

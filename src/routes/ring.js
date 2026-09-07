'use strict';
/**
 * @file routes driving webring navigation
 */

import { Router } from 'express';

import Ring from '../ring/index.js';
import { BadRequestError, NotFoundError, UnknownError } from '../errors.js';

import {
  validateDirectionMiddleware,
  validateMemberMiddleware,
} from './utils/validation.js';

const router = Router();

router.use('/:key/:direction', validateDirectionMiddleware);
router.use('/:key/:direction', validateMemberMiddleware);

router.get('/members', (req, res, next) => {
  try {
    const memberJSON = Array.from(Ring).map((member) => member.toJSON());

    return res.status(200).json({
      total: Ring.size,
      members: memberJSON,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:key/:direction', (req, res, next) => {
  try {
    const { key, direction } = req.params;
    return res.redirect(Ring.getMember(key)[direction].url);
  } catch (err) {
    console.error('Unknown error post-validation', err);
    next(new UnknownError());
  }
});

export default router;

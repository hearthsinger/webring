'use strict';
/**
 * @file shared validators
 */
import Ring from '../../ring/index.js';
import { IntegrationId } from '../../integrations/common.js';

import { UnknownError, BadRequestError, NotFoundError } from '../../errors.js';

/**
 * @enum {string} Valid ring directions
 */
const Direction = {
  Next: 'next',
  Prev: 'prev',
};

/**
 * Express middlware to validate ring direction params
 */
export const validateDirectionMiddleware = (req, res, next) => {
  try {
    const { direction } = req.params;
    if (!direction) {
      throw new UnknownError(
        'Server expected a direction param for this operation and received none.',
      );
    }
    if (![Direction.Prev, Direction.Next].includes(direction)) {
      throw new BadRequestError(
        'Invalid ring direction - expected one of "prev" or "next"',
      );
    }
    return next();
  } catch (err) {
    next(err);
  }
};

/**
 * Express middleware to validate ring membership
 */
export const validateMemberMiddleware = (req, res, next) => {
  try {
    const { key } = req.params;
    if (!key) {
      throw new UnknownError(
        'Server expected a key param for this operation and received none.',
      );
    }
    if (!Ring.hasMember(key)) {
      throw new NotFoundError('Invalid ring member');
    }
    return next();
  } catch (err) {
    next(err);
  }
};

/**
 * Express middleware to validate integration ids
 */
export const validateIntegrationIdMiddleware = (req, res, next) => {
  try {
    const { integrationId: intId } = req.params;
    if (!intId) {
      throw new UnknownError(
        'Server expected an integrationId param for this operation and received none.',
      );
    }
    if (!(intId in IntegrationId)) {
      throw new BadRequestError('Invalid integration');
    }
    next();
  } catch (err) {
    next(err);
  }
};

'use strict';
/**
 * @file Contains the mapping/entrypoint for the integration functions.
 * @author Asteria Hart <asteria@strawbs.io>
 */
import { IntegrationId } from './common.js';

import doLastFm from './lastfm.js';

/** @typedef {import('../ring/index.js').RingMember} RingMember */
/** @typedef {Object.<IntegrationId, Function>} IntegrationEntrypointMap */

/**
 * Holds a mapping of integration id constants to the function entrypoints
 * that should be called to "invoke" each integration.
 *
 * These functions should all accept a single {@link RingMember} parameter,
 * and return a JSON-appropriate response.
 *
 * @type {IntegrationEntrypointMap}
 */
const IntegrationEntrypointById = {
  [IntegrationId.LastFM]: doLastFm,
};

export default IntegrationEntrypointById;

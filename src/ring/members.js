import path from 'node:path';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

/**
 * @typedef {import('../integrations/common.js').IntegrationId} IntegrationId
 */

/**
 * @typedef {Object.<IntegrationId, Object>} IntegrationConfig
 */

/**
 * @typedef {Object} RingMemberDefinition
 * @property {string} title - the human-readable title of the site in the ring
 * @property {string} url - the URL of the site
 * @property {string} owner - the handle of the owner of the site
 * @property {IntegrationConfig} integrations keyed by {@link IntegrationId}
 * @property {RingMember} [node] - set by the {@link Ring} constructor for O(1) lookups
 */

/**
 * @typedef {Object.<string, RingMemberDefinition>} RingDefintion
 */

/**
 * Quick parser to grab the members.yaml and load into JS
 * rather than maintaining the list in JS source.
 *
 * @returns {RingDefintion} The parsed ring
 */
export function parseMembersYaml(filename = 'members.yaml') {
  const filepath = path.join(import.meta.dirname, filename);
  const content = readFileSync(filepath, 'utf8');

  return load(content).members;
}

const members = parseMembersYaml();

export default members;

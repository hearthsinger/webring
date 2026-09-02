'use strict';
/**
 * @fileoverview contains the webring definition and Ring class
 * @author Asteria Hart <asteria@strawbs.io>
 */

import members from './members.js';
import {
  IntegrationRuntimeError,
  RingDataError,
  RingMemberError,
} from '../errors.js';
import { IntegrationId } from '../integrations/common.js';

/**
 * @classdesc Doubly-linked list node class representing ring members
 * @class
 */
class RingMember {
  _key = null;
  _data = {};
  _prev = null;
  _next = null;

  /**
   * Validates ring member data, throwing if the data is malformed
   *
   * @static
   *
   * @throws {Error} Throws an error if the ring member data is missing a required attribute
   */
  static checkValidRingMember(maybeRingMember) {
    if (Array.isArray(maybeRingMember) || typeof maybeRingMember !== 'object') {
      throw new RingMemberError(
        'Ring member must be an object with the `title`, `url`, and `owner` attributes',
      );
    }

    ['title', 'url', 'owner'].forEach((attr) => {
      if (!(attr in maybeRingMember)) {
        throw new RingMemberError(`Ring member data missing \`${attr}\``);
      }
    });
  }

  /**
   * Constructs a new RingMember instance
   *
   * @param {string} key - the key/id for this ring member, appearing in backend api paths
   * @param {RingMemberDefinition} data - the definition for the member
   */
  constructor(key, data) {
    RingMember.checkValidRingMember(data);
    this._data = data;
    this.key = key;
  }

  get url() {
    return this._data.url;
  }

  get owner() {
    return this._data.owner;
  }

  get title() {
    return this._data.title;
  }

  get next() {
    return this._next;
  }

  get prev() {
    return this._prev;
  }

  /**
   * setter for the next node - does not create double-ended connections
   * intentionally since this will be circular by design
   */
  set next(member) {
    this._next = member;
  }

  /**
   * setter for the prev node - does not create double-ended connections
   * intentionally since this will be circular by design
   */
  set prev(member) {
    this._prev = member;
  }

  /**
   * `true` if this member has a configuration set for the provided integrations
   *
   * @param {IntegrationId} integrationId - the integration to check. See {@link IntegrationId}
   *
   * @returns {boolean} `true` if the user has the integration configuration set
   */
  hasIntegration(integrationId) {
    return integrationId in this._data.integrations;
  }

  /**
   * Returns the configuration for the requested integration, if it is set
   *
   * @param {IntegrationId} integrationId - the integration to check. See {@link IntegrationId}
   * @throws {IntegrationRuntimeError} If this user does not have the requested integration set
   *
   * @returns {Object} The configured integration
   */
  getIntegration(integrationId) {
    if (!this.hasIntegration(integrationId)) {
      throw new IntegrationRuntimeError(
        integrationId,
        `Member '${this._key}' has no configuraton for the request integration`,
      );
    }

    return this._data.integrations[integrationId];
  }
}

/**
 * Doubly-linked list that we intentionally loop - i.e. a ring
 * @class
 */
class Ring {
  head = null;
  _ringData = null;
  /**
   * Validates the ring data, only ensures the data is an object with one or
   * more keys. Member validation is performed by the {@link RingMember} class
   *
   * @static
   *
   * @throws {Error} If the ring data is an array or non-object, or if it contains no keys
   */
  static checkValidRingData(maybeRingData) {
    if (Array.isArray(maybeRingData) || typeof maybeRingData !== 'object') {
      throw new RingDataError(
        'Ring data must be an object keyed by ring member slugs',
      );
    }

    if (Object.keys(maybeRingData).length < 1) {
      throw new RingDataError(
        'Ring data must contain one or more member definitions, keyed by slug',
      );
    }
  }

  constructor(ringData) {
    Ring.checkValidRingData(ringData);
    this._ringData = { ...ringData };
    let _prev; // track the previous node
    for (const [member, def] of Object.entries(this._ringData)) {
      // make a new node for the next member
      const newNode = new RingMember(member, def);

      // if we haven't set head, set it
      if (this.head === null) {
        this.head = newNode;
      }

      // if we've assigned a prev (i.e. it's truthy), set this node's prev
      // and prev node's next
      if (!!_prev) {
        newNode.prev = _prev;
        _prev.next = newNode;
      }

      // put the node in mapping for O(1) lookups
      def.node = newNode;
      _prev = newNode; // this node is now the previous
    }

    // we've fallen off the end, connect the loop and assign head.prev to the
    // most recent node (the tail). All this does is save logic elsehwere to
    // check the nullishness of next/prev refs and manually implement the "wrap"
    // in the route logic. We don't like that. We like this.
    this.head.prev = _prev;
    _prev.next = this.head;
  }

  *[Symbol.iterator]() {
    let toReturn = this.head;

    return {
      next: () => {
        let held = toReturn;
        toReturn = toReturn.next;

        return {
          value: held,
          done: toReturn === this.head, // literally, the node is the head node
        };
      },
    };
  }

  /**
   * Return the member node corresponding to the memberId
   *
   * @param {string} memberId - the id of the member
   *
   * @returns {RingMember} The ring member node
   */
  getMember(memberId) {
    return this._ringData[memberId].node;
  }

  /**
   * Returns `true` if the provided memberId corresponds to a member in the ring
   *
   * @param {string} memberId - the id of the member
   *
   * @returns {boolean} `true` if the memberId corresponds to a member, `false` otherwise
   */
  hasMember(memberId) {
    return memberId in this._ringData;
  }
}

const RingSingleton = new Ring(members);

export default RingSingleton;

import config from '../config.js';
import { IntegrationConfigError, IntegrationRuntimeError } from '../errors.js';

import { IntegrationId } from './common.js';

// #region Track

/**
 * @typedef TrackJSON Track information from the last.fm API, reserialized as
 * cleaner JSON
 *
 * @property {string} name - Track name, as reported by last.fm
 * @property {string} artist - Artist name, as reported by last.fm
 * @property {string} album - Album name, as reported by last.fm
 * @property {string} url - Link to the track on last.fm
 * @property {string} date - Last.fm-formatted date for the scrobble, in UTC
 */

/**
 * @classdesc Track dataclass
 */
class Track {
  _raw = null;

  constructor(trackdata) {
    this._raw = trackdata;
  }

  /**
   * Constructor helper to initialize an array of Tracks from a vector API response
   *
   * @param {object[]} tracks - raw track data from the last.fm API
   * @returns {Track[]} The array of tracks, serialized as Track objects
   */
  static fromArray(tracks) {
    return tracks.map((t) => new Track(t));
  }

  /**
   * Private helper to dig string values out of the last.fm track object.
   *
   * Despite coming back to us in JSON, the response is very reminiscent of the
   * source XML, including the embedding of some values we need as attribute-like
   * values within nested objects. Given a property name that corresponds to a
   * top-level key of the raw object, this function returns either the
   * corresponding value (if the value is a non-object value), or digs for the
   * `#text` property of the nested object.
   *
   * @param {string} prop - the value of a key in the raw track object for which to return the textual value
   *
   * @returns {string} The human-readable/usable value of the property
   */
  _getTrackProp(prop) {
    if (!(prop in this._raw)) {
      throw new Error(
        `Unable to parse artist info from last.fm track object - could not find '${propName}'`,
      );
    }

    if (typeof this._raw[prop] === 'object') {
      return this._raw[prop]['#text'];
    }

    return this._raw[prop];
  }

  /**
   * The artist name for this track
   * @readonly
   */
  get artist() {
    return this._getTrackProp('artist');
  }

  /**
   * The album title for this track
   * @readonly
   */
  get album() {
    return this._getTrackProp('album');
  }

  /**
   * The track name
   * @readonly
   */
  get name() {
    return this._getTrackProp('name');
  }

  /**
   * The last.fm URL for this track
   * @readonly
   */
  get url() {
    return this._getTrackProp('url');
  }

  /**
   * The date this track was scrobbled
   * @readonly
   */
  get date() {
    return this._getTrackProp('date');
  }

  /**
   * Returns the track as a friendlier JSON object
   * @returns {TrackJSON} The track as friendly JSON
   */
  toJSON() {
    return {
      name: this.name,
      artist: this.artist,
      album: this.album,
      url: this.url,
      date: this.date,
    };
  }
}

// #endregion Track

// #region Client

/**
 * @classdesc Limited last.fm client wrapper
 */
class LastFMClient {
  _apiKey = config.get('integrations.lastfm.apiKey');
  _baseUrl = 'https://ws.audioscrobbler.com/2.0';
  _username = null;

  constructor(username) {
    if (!this._apiKey) {
      throw new IntegrationConfigError(
        IntegrationId.LastFM,
        'Missing API Key for LastFM',
      );
    }
    this._username = username;
  }

  /**
   * private helper to transform a bucket of options into
   * URLSearchParams for endpoint construction. Performs
   * light transforms on the options (e.g. booleans to integer
   * 0/1 values) and returns a URLSearchParams object
   *
   * @param {object} options - an object of query params to format
   * @param {string} method - the API method being called, also set in the query params
   * @param {boolean} [usermethod=true] - set to `false` to eclude the configured username within the params.
   * @returns {URLSearchParams} the params object
   */
  _optionsToParams(options, method, usermethod = true) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(options)) {
      if (typeof v === 'boolean') {
        params.set(k, v ? 1 : 0);
      } else {
        params.set(k, v);
      }
    }

    if (usermethod) {
      params.set('user', this._username);
    }

    params.set('api_key', this._apiKey);
    params.set('method', method);
    params.set('format', 'json');

    return params;
  }

  /**
   * Calls the user.getRecentTracks function
   *
   * @param {{ limit: number; page: number; extended: boolean; from: null; to: null; }} [options] - the query params for
   * this API call
   *
   * @returns {Promise<Track[]>} The last.fm API response serialized as Track objects
   */
  async getRecentTracks(
    options = {
      limit: 50,
      page: 1,
      extended: false,
      from: null,
      to: null,
    },
  ) {
    const params = this._optionsToParams(options, 'user.getrecenttracks');
    const reqUrl = new URL(`${this._baseUrl}?${params}`);

    const res = await fetch(reqUrl, { method: 'GET' });

    if (!res.ok) {
      const msg = 'received non-2XX attempting to fetch recent track data';
      console.error(msg);
      console.error(await res.text());
      throw new IntegrationRuntimeError(IntegrationId.LastFM, msg);
    }

    try {
      const body = await res.json();
      const tracks = body.recenttracks;
      if (tracks['@attr'].total < 1) {
        return [];
      }

      return Track.fromArray(tracks.track);
    } catch (err) {
      // This is either an issue with the LastFM API or this integration
      throw new IntegrationError(
        IntegrationId.LastFM,
        `Failed to parse API response - ${err.message}`,
      );
    }
  }

  /**
   * Returns a profile {@link URL} for the user provided at instantiation.
   *
   * @returns {URL} A well-formatted profile {@link URL}
   */
  getProfileUrl() {
    return new URL(`https://last.fm/user/${this.username}`);
  }
}

// #endregion Client

/**
 * @typedef {import('../ring.js').RingMember} RingMember
 */

/**
 * The integration runtime functon for the lastfm integration.
 * Returns the requested user's most recent scrobbled track for display
 *
 * @param {RingMember} ringMember - the provided member;
 *
 * @returns {Promise<Object>} LastFM Track data;
 */
async function getNowListening(ringMember) {
  const integration = ringMember.getIntegration(IntegrationId.LastFM);
  const { username } = integration;

  console.log('Constructing lastfm client for user', username);
  const client = new LastFMClient(username);
  const tracks = await client.getRecentTracks({ limit: 1 });

  if (tracks.length < 1) {
    throw new IntegrationRuntimeError(
      IntegrationId.LastFM,
      'Found no track data for requested ring member',
    );
  }

  return tracks[0].toJSON();
}

export default getNowListening;

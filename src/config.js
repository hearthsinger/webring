'use strict';
/**
 * @file app configuraton definition for the webring
 * @author Asteria Hart <asteria@strawbs.io>
 */
import { createRequire } from 'node:module';

import convict from 'convict';

const require = createRequire(import.meta.url);

(function loadEnv() {
  try {
    require('dotenv').config({ quiet: true });
  } catch (err) {
    console.warn(
      'Unable to import dotenv - ignore this in production!',
      err.message,
    );
  }
})();

/**
 * app config object via convict
 */
const config = convict({
  web: {
    port: {
      doc: 'Port on which to host the webring backend.',
      format: 'int',
      default: 8080,
      env: 'PORT',
      arg: 'port',
    },
    host: {
      doc: 'Host/interface to bind for the webring backend.',
      format: 'String',
      default: '0.0.0.0',
      env: 'HOST',
      arg: 'host',
    },
  },
  integrations: {
    lastfm: {
      apiKey: {
        doc:
          'Last.fm API key. The integration only supports read-only actions,' +
          'so no corresponding api secret should be provided',
        format: 'String',
        default: '',
        nullable: true,
        sensitive: true,
        env: 'LASTFM_API_KEY',
      },
    },
  },
});

export default config;

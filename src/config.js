import { createRequire } from 'node:module';

import convict from "convict";

const require = createRequire(import.meta.url);

(function loadEnv() {
  try {
    require('dotenv').config({quiet: true});
  } catch (err) {
    console.warn('Unable to import dotenv - ignore this in production!', err.message);
  }
})();

const config = convict({
  web: {
    port: {
      format: 'int',
      default: 8080,
      env: 'PORT',
      arg: 'port'
    },
    host: {
      format: 'String',
      default: '0.0.0.0',
      env: 'HOST',
      arg: 'host'
    }
  },
  integrations: {
    lastfm: {
      apiKey: {
        format: 'String',
        default: '',
        nullable: true,
        sensitive: true,
        env: 'LASTFM_API_KEY'
      }
    }
  }
});

export default config;


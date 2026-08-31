import { IntegrationId } from './common.js';

import doLastFm from './lastfm.js';

const IntegrationEntrypointById = {
  [IntegrationId.LastFM]: doLastFm
};

export default IntegrationEntrypointById;

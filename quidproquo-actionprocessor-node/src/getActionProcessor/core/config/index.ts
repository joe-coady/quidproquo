import { QPQConfig } from 'quidproquo-core';

import getConfigGetApplicationInfoActionProcessor from './getConfigGetApplicationInfoActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getConfigGetApplicationInfoActionProcessor(qpqConfig),
});

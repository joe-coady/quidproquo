import { QPQConfig } from 'quidproquo-core';

import getWebEntryInvalidateCacheActionProcessor from './getWebEntryInvalidateCacheActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getWebEntryInvalidateCacheActionProcessor(qpqConfig),
});

import { QPQConfig } from 'quidproquo-core';

import getKeyValueStoreDeleteActionProcessor from './getKeyValueStoreDeleteActionProcessor';
import getKeyValueStoreGetActionProcessor from './getKeyValueStoreGetActionProcessor';
import getKeyValueStoreUpsertActionProcessor from './getKeyValueStoreUpsertActionProcessor';
import getKeyValueStoreUpdateActionProcessor from './getKeyValueStoreUpdateActionProcessor';
import getKeyValueStoreQueryActionProcessor from './getKeyValueStoreQueryActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getKeyValueStoreDeleteActionProcessor(qpqConfig),
  ...getKeyValueStoreGetActionProcessor(qpqConfig),
  ...getKeyValueStoreQueryActionProcessor(qpqConfig),
  ...getKeyValueStoreUpdateActionProcessor(qpqConfig),
  ...getKeyValueStoreUpsertActionProcessor(qpqConfig),
});

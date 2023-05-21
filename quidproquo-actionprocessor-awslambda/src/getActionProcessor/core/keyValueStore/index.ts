import { QPQConfig } from 'quidproquo-core';

import getKeyValueStoreDeleteActionProcessor from './getKeyValueStoreDeleteActionProcessor';
import getKeyValueStoreGetActionProcessor from './getKeyValueStoreGetActionProcessor';
import getKeyValueStoreUpsertActionProcessor from './getKeyValueStoreUpsertActionProcessor';
import getKeyValueStoreUpdateActionProcessor from './getKeyValueStoreUpdateActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getKeyValueStoreDeleteActionProcessor(qpqConfig),
  ...getKeyValueStoreGetActionProcessor(qpqConfig),
  ...getKeyValueStoreUpsertActionProcessor(qpqConfig),
  ...getKeyValueStoreUpdateActionProcessor(qpqConfig),
});

import { QPQConfig } from 'quidproquo-core';

import getKeyValueStoreDeleteActionProcessor from './getKeyValueStoreDeleteActionProcessor';
import getKeyValueStoreGetActionProcessor from './getKeyValueStoreGetActionProcessor';
import getKeyValueStoreSetActionProcessor from './getKeyValueStoreSetActionProcessor';
import getKeyValueStoreUpdateActionProcessor from './getKeyValueStoreUpdateActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getKeyValueStoreDeleteActionProcessor(qpqConfig),
  ...getKeyValueStoreGetActionProcessor(qpqConfig),
  ...getKeyValueStoreSetActionProcessor(qpqConfig),
  ...getKeyValueStoreUpdateActionProcessor(qpqConfig),
});

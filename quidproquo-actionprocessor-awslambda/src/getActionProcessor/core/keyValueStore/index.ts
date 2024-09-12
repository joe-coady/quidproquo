import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getKeyValueStoreDeleteActionProcessor } from './getKeyValueStoreDeleteActionProcessor';
import { getKeyValueStoreGetActionProcessor } from './getKeyValueStoreGetActionProcessor';
import { getKeyValueStoreUpsertActionProcessor } from './getKeyValueStoreUpsertActionProcessor';
import { getKeyValueStoreUpdateActionProcessor } from './getKeyValueStoreUpdateActionProcessor';
import { getKeyValueStoreQueryActionProcessor } from './getKeyValueStoreQueryActionProcessor';
import { getKeyValueStoreScanActionProcessor } from './getKeyValueStoreScanActionProcessor';

export const getKeyValueStoreActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getKeyValueStoreDeleteActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreGetActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreUpsertActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreUpdateActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreQueryActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreScanActionProcessor(qpqConfig)),
});

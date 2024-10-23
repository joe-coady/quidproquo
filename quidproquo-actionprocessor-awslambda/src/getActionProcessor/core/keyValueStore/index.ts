import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getKeyValueStoreDeleteActionProcessor } from './getKeyValueStoreDeleteActionProcessor';
import { getKeyValueStoreGetActionProcessor } from './getKeyValueStoreGetActionProcessor';
import { getKeyValueStoreQueryActionProcessor } from './getKeyValueStoreQueryActionProcessor';
import { getKeyValueStoreScanActionProcessor } from './getKeyValueStoreScanActionProcessor';
import { getKeyValueStoreUpdateActionProcessor } from './getKeyValueStoreUpdateActionProcessor';
import { getKeyValueStoreUpsertActionProcessor } from './getKeyValueStoreUpsertActionProcessor';

export const getKeyValueStoreActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getKeyValueStoreDeleteActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreGetActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreUpsertActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreUpdateActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreQueryActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreScanActionProcessor(qpqConfig, dynamicModuleLoader)),
});

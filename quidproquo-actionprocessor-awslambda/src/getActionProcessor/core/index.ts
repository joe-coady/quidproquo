export * from './config';
export * from './event';
export * from './eventBus';
export * from './file';
export * from './graphDatabase';
export * from './keyValueStore';
export * from './queue';
export * from './system';
export * from './userDirectory';

import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getConfigActionProcessor } from './config';
import { getApiGatewayApiEventEventProcessor } from './event';
import { getEventBusActionProcessor } from './eventBus';
import { getFileActionProcessor } from './file';
import { getGraphDatabaseActionProcessor } from './graphDatabase';
import { getKeyValueStoreActionProcessor } from './keyValueStore';
import { getQueueActionProcessor } from './queue';
import { getSystemActionProcessor } from './system';
import { getUserDirectoryActionProcessor } from './userDirectory';

export const getCoreActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getFileActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getKeyValueStoreActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getQueueActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getUserDirectoryActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getEventBusActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getSystemActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getConfigActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getApiGatewayApiEventEventProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),
});

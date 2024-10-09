export * from './file';
export * from './keyValueStore';
export * from './queue';
export * from './userDirectory';
export * from './eventBus';
export * from './system';
export * from './config';
export * from './event';
export * from './graphDatabase';

import { getFileActionProcessor } from './file';
import { getKeyValueStoreActionProcessor } from './keyValueStore';
import { getQueueActionProcessor } from './queue';
import { getUserDirectoryActionProcessor } from './userDirectory';
import { getEventBusActionProcessor } from './eventBus';
import { getSystemActionProcessor } from './system';
import { getConfigActionProcessor } from './config';
import { getApiGatewayApiEventEventProcessor } from './event';
import { getGraphDatabaseActionProcessor } from './graphDatabase';

import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

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

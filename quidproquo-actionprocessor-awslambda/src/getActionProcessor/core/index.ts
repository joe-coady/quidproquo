export * from './file';
export * from './keyValueStore';
export * from './queue';
export * from './userDirectory';
export * from './eventBus';
export * from './system';
export * from './config';
export * from './event';

import { getFileActionProcessor } from './file';
import { getKeyValueStoreActionProcessor } from './keyValueStore';
import { getQueueActionProcessor } from './queue';
import { getUserDirectoryActionProcessor } from './userDirectory';
import { getEventBusActionProcessor } from './eventBus';
import { getSystemActionProcessor } from './system';
import { getConfigActionProcessor } from './config';
import { getApiGatewayApiEventEventProcessor } from './event';

import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

export const getCoreActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getFileActionProcessor(qpqConfig)),
  ...(await getKeyValueStoreActionProcessor(qpqConfig)),
  ...(await getQueueActionProcessor(qpqConfig)),
  ...(await getUserDirectoryActionProcessor(qpqConfig)),
  ...(await getEventBusActionProcessor(qpqConfig)),
  ...(await getSystemActionProcessor(qpqConfig)),
  ...(await getConfigActionProcessor(qpqConfig)),
  ...(await getApiGatewayApiEventEventProcessor(qpqConfig)),
});

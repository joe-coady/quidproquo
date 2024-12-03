import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getEventBusActionProcessor } from './eventBus';
import { getGraphDatabaseActionProcessor } from './graphDatabaseOverride';
import { getQueueActionProcessor } from './queue';

export const getCoreActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getEventBusActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getQueueActionProcessor(qpqConfig, dynamicModuleLoader)),
});

import { getFileActionProcessor } from 'quidproquo-actionprocessor-node';
import { ActionProcessorList, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { ResolvedDevServerConfig } from '../../types';
import { getEventBusActionProcessor } from './eventBus';
import { getGraphDatabaseActionProcessor } from './graphDatabaseOverride';
import { getKeyValueStoreActionProcessor } from './keyValueStore';
import { getLogActionProcessor } from './log';
import { getQueueActionProcessor } from './queue';

export const getCoreActionProcessor = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
  devServerConfig: ResolvedDevServerConfig,
): Promise<ActionProcessorList> => {  
  return {
    ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getEventBusActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getQueueActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getLogActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getFileActionProcessor(devServerConfig.fileStorageConfig)(qpqConfig, dynamicModuleLoader)),
    ...(await getKeyValueStoreActionProcessor(devServerConfig)(qpqConfig, dynamicModuleLoader)),
  };
};

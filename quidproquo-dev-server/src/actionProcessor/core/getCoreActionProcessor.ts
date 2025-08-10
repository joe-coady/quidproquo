import { ActionProcessorList, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';
import { getFileActionProcessor } from 'quidproquo-actionprocessor-node';

import { getEventBusActionProcessor } from './eventBus';
import { getGraphDatabaseActionProcessor } from './graphDatabaseOverride';
import { getLogActionProcessor } from './log';
import { getQueueActionProcessor } from './queue';
import { ResolvedDevServerConfig } from '../../types';

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
  };
};

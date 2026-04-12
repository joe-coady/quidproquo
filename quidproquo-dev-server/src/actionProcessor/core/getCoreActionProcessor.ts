import { getFileActionProcessor } from 'quidproquo-actionprocessor-node';
import { ActionProcessorList, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';
import { getRouteAuthValidationActionProcessor } from 'quidproquo-webserver';

import { ResolvedDevServerConfig } from '../../types';
import { getApiKeyValidationActionProcessor } from './apiKeyValidation';
import { getEventBusActionProcessor } from './eventBus';
import { getGraphDatabaseActionProcessor } from './graphDatabaseOverride';
import { getKeyValueStoreActionProcessor } from './keyValueStore';
import { getLogActionProcessor } from './log';
import { getQueueActionProcessor } from './queue';
import { getUserDirectoryActionProcessor } from './userDirectory';

export const getCoreActionProcessor = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
  devServerConfig: ResolvedDevServerConfig,
): Promise<ActionProcessorList> => {
  return {
    ...(await getApiKeyValidationActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getEventBusActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getQueueActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getLogActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getFileActionProcessor(devServerConfig.fileStorageConfig)(qpqConfig, dynamicModuleLoader)),
    ...(await getKeyValueStoreActionProcessor(devServerConfig)(qpqConfig, dynamicModuleLoader)),
    ...(await getRouteAuthValidationActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getUserDirectoryActionProcessor(qpqConfig, dynamicModuleLoader)),
  };
};

import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreDeleteActionProcessor, 
  QPQConfig, 
  qpqCoreUtils} from 'quidproquo-core';

import { SqliteKvsRepository } from '../../../logic/keyValueStore/SqliteKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const repositoryInstances = new Map<string, SqliteKvsRepository>();

const getRepository = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): SqliteKvsRepository => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  
  if (!repositoryInstances.has(serviceName)) {
    repositoryInstances.set(serviceName, new SqliteKvsRepository(devServerConfig.runtimePath, qpqConfig));
  }
  
  return repositoryInstances.get(serviceName)!;
};

const getProcessKeyValueStoreDelete = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key, sortKey }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const compositeKey = sortKey !== undefined ? `${key}#${sortKey}` : String(key);
      const result = await repository.delete(keyValueStoreName, compositeKey);
      
      if (!result) {
        return actionResultError('ResourceNotFound', `Item with key '${key}' not found`);
      }
      
      return actionResult(undefined);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getKeyValueStoreDeleteActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig, devServerConfig),
});
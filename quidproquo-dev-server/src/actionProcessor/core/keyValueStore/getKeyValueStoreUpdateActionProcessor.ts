import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreUpdateActionProcessor, 
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

const getProcessKeyValueStoreUpdate = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const result = await repository.update(
        keyValueStoreName,
        String(key),
        sortKey ? String(sortKey) : undefined,
        updates
      );
      
      if (result === null) {
        return actionResultError('ResourceNotFound', `Item with key '${key}' not found`);
      }
      
      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getKeyValueStoreUpdateActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig, devServerConfig),
});
import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreGetActionProcessor, 
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

const getProcessKeyValueStoreGet = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const result = await repository.get(keyValueStoreName, key);
      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getKeyValueStoreGetActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig, devServerConfig),
});
import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  QPQConfig, 
  qpqCoreUtils,
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreQueryActionProcessor 
} from 'quidproquo-core';
import { ResolvedDevServerConfig } from '../../../types';
import { SqliteKvsRepository } from '../../../logic/keyValueStore/SqliteKvsRepository';

const repositoryInstances = new Map<string, SqliteKvsRepository>();

const getRepository = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): SqliteKvsRepository => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  
  if (!repositoryInstances.has(serviceName)) {
    repositoryInstances.set(serviceName, new SqliteKvsRepository(devServerConfig.runtimePath, qpqConfig));
  }
  
  return repositoryInstances.get(serviceName)!;
};

const getProcessKeyValueStoreQuery = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const result = await repository.query(
        keyValueStoreName,
        keyCondition,
        options?.filter,
        options?.nextPageKey,
        undefined, // indexName - for basic implementation
        options?.limit,
        options?.sortAscending ?? true
      );
      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getKeyValueStoreQueryActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig, devServerConfig),
});
import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  QPQConfig, 
  qpqCoreUtils,
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreUpsertActionProcessor 
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

const getProcessKeyValueStoreUpsert = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const result = await repository.upsert(keyValueStoreName, item);
      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getKeyValueStoreUpsertActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig, devServerConfig),
});
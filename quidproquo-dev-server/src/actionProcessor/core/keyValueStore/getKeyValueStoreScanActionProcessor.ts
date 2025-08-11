import { 
  ActionProcessorList, 
  ActionProcessorListResolver, 
  QPQConfig, 
  qpqCoreUtils,
  actionResult, 
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType, 
  KeyValueStoreScanActionProcessor 
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

const getProcessKeyValueStoreScan = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig
): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey }) => {
    try {
      const repository = getRepository(qpqConfig, devServerConfig);
      const result = await repository.scan(
        keyValueStoreName,
        filterCondition,
        nextPageKey,
        undefined // limit is not in the scan payload, using default
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

export const getKeyValueStoreScanActionProcessor = (
  devServerConfig: ResolvedDevServerConfig
): ActionProcessorListResolver => async (
  qpqConfig: QPQConfig,
  _dynamicModuleLoader: any
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig, devServerConfig),
});
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreQueryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreQuery = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    try {
      const repository = getKvsRepository(qpqConfig, devServerConfig);
      const result = await repository.query(
        keyValueStoreName,
        keyCondition,
        options?.filter,
        options?.nextPageKey,
        undefined, // indexName - for basic implementation
        options?.limit,
        options?.sortAscending ?? true,
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

export const getKeyValueStoreQueryActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig, devServerConfig),
  });

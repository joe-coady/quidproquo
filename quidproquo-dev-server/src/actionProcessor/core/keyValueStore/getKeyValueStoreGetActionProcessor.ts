import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreGetActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreGet = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key }) => {
    try {
      const repository = getKvsRepository(qpqConfig, devServerConfig);
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

export const getKeyValueStoreGetActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig, devServerConfig),
  });

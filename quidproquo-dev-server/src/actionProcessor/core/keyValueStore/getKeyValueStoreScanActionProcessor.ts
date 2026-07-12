import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreScanActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreScan = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey }) => {
    try {
      const repository = getKvsRepository(qpqConfig, devServerConfig);
      const result = await repository.scan(
        keyValueStoreName,
        filterCondition,
        nextPageKey,
        undefined, // limit is not in the scan payload, using default
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

export const getKeyValueStoreScanActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig, devServerConfig),
  });

import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreScanActionProcessor,
  KeyValueStoreScanErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';
import { resolveScopedPkAttributeOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreScan = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey, options }) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so a scoped
      // scan just iterates the scope's own file - no injected filter needed.
      if (scope !== undefined) {
        resolveScopedPkAttributeOrThrow(qpqConfig, keyValueStoreName, scope);
      }

      const result = await repository.scan(
        keyValueStoreName,
        filterCondition,
        nextPageKey,
        undefined, // limit is not in the scan payload, using default
        scope,
      );

      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreScanErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreScanActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig, devServerConfig),
  });

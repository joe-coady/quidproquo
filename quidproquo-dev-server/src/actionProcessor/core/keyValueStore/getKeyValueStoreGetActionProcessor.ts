import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreGetActionProcessor,
  KeyValueStoreGetErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';
import { resolveScopedPkAttributeOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreGet = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key, options }) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so keys and
      // items stay raw - the scope just selects which file the store reads.
      if (scope !== undefined) {
        resolveScopedPkAttributeOrThrow(qpqConfig, keyValueStoreName, scope);
      }

      return actionResult(await repository.get(keyValueStoreName, key, scope));
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreGetErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreGetActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig, devServerConfig),
  });

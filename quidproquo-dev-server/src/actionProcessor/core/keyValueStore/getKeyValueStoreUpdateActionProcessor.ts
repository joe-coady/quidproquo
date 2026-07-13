import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpdateActionProcessor,
  KeyValueStoreUpdateErrorTypeEnum,
  QPQConfig,
  validateScopedKvsKeyOrThrow,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreUpdate = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates, options }) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so keys and
      // items stay raw - the scope just selects which file the store updates.
      // The key is still validated for AWS parity: a key prod rejects (bad
      // scope, or the reserved scope delimiter in the raw value) must fail
      // locally too.
      validateScopedKvsKeyOrThrow(qpqConfig, keyValueStoreName, scope, key);

      const result = await repository.update(keyValueStoreName, String(key), sortKey ? String(sortKey) : undefined, updates, scope);

      return actionResult(result);
    } catch (error: any) {
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpdateErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpdateErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpdateActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig, devServerConfig),
  });

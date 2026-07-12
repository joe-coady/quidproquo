import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpsertActionProcessor,
  KeyValueStoreUpsertErrorTypeEnum,
  QPQConfig,
  validateScopedKvsItemOrThrow,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so the item is
      // stored raw - the scope just selects which file the store writes to.
      // The item's pk value is still validated for AWS parity: a write prod
      // rejects (bad scope, or the reserved '::' delimiter in the raw value,
      // scoped or not) must fail locally too.
      validateScopedKvsItemOrThrow(qpqConfig, keyValueStoreName, scope, item);

      const result = await repository.upsert(keyValueStoreName, item, { ifNotExists: options?.ifNotExists }, scope);
      return actionResult(result);
    } catch (error: any) {
      return actionResultErrorFromCaughtError(error, {
        ConditionalCheckFailedException: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.Conflict, 'KVS item already exists'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpsertErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpsertErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpsertActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig, devServerConfig),
  });

import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpsertActionProcessor,
  KeyValueStoreUpsertErrorTypeEnum,
  KvsStreamEventType,
  QPQConfig,
  validateScopedKvsItemOrThrow,
} from 'quidproquo-core';

import { emitKvsStreamEvent } from '../../../logic/kvsStream';
import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { toKvsCompositeKey, toKvsStreamKeys } from '../../../logic/keyValueStore/toKvsStreamKeys';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }, session) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so the item is
      // stored raw - the scope just selects which file the store writes to.
      // The item's pk value is still validated for AWS parity: a write prod
      // rejects (bad scope, or the reserved scope delimiter in the raw value,
      // scoped or not) must fail locally too.
      validateScopedKvsItemOrThrow(qpqConfig, keyValueStoreName, scope, item);

      // Read first only to tell an insert from a modify, the one thing the write itself does
      // not reveal. Cheap locally, and it keeps eventType honest for a generic consumer.
      const existing = await repository.get(keyValueStoreName, toKvsCompositeKey(qpqConfig, keyValueStoreName, item), scope);
      const result = await repository.upsert(keyValueStoreName, item, { ifNotExists: options?.ifNotExists }, scope);

      // Stand in for the change stream, AFTER the write has committed - see emitKvsStreamEvent.
      await emitKvsStreamEvent(qpqConfig, session, {
        keyValueStoreName,
        eventType: existing ? KvsStreamEventType.Modify : KvsStreamEventType.Insert,
        scope,
        keys: toKvsStreamKeys(qpqConfig, keyValueStoreName, item),
        newImage: item,
        oldImage: existing ?? undefined,
      });

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

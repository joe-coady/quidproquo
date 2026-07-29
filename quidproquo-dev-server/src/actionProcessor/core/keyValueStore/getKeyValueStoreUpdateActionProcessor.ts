import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpdateActionProcessor,
  KeyValueStoreUpdateErrorTypeEnum,
  KvsStreamEventType,
  QPQConfig,
  validateScopedKvsKeyOrThrow,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { emitKvsStreamEvent } from '../../../logic/kvsStream';
import { toKvsStreamKeys } from '../../../logic/keyValueStore/toKvsStreamKeys';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreUpdate = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates, options }, session) => {
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

      // Stand in for the change stream, AFTER the write has committed. An update always
      // targets an existing item (UpdateItem upserts, but the result is the item as it now
      // stands), so this is always a Modify.
      await emitKvsStreamEvent(qpqConfig, session, {
        keyValueStoreName,
        eventType: KvsStreamEventType.Modify,
        scope,
        keys: toKvsStreamKeys(qpqConfig, keyValueStoreName, result ?? {}),
        newImage: result ?? undefined,
      });

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

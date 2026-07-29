import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreDeleteActionProcessor,
  KeyValueStoreDeleteErrorTypeEnum,
  KvsStreamEventType,
  QPQConfig,
  validateScopedKvsKeyOrThrow,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { emitKvsStreamEvent } from '../../../logic/kvsStream';
import { toKvsStreamKeys } from '../../../logic/keyValueStore/toKvsStreamKeys';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreDelete = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key, sortKey, options }, session) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so keys stay
      // raw - the scope just selects which file the store deletes from. The
      // key is still validated for AWS parity: a key prod rejects (bad scope,
      // or the reserved scope delimiter in the raw value) must fail locally
      // too.
      validateScopedKvsKeyOrThrow(qpqConfig, keyValueStoreName, scope, key);

      const compositeKey = sortKey !== undefined ? `${key}#${sortKey}` : String(key);

      // Grab it before it goes: a Remove record's only payload is what used to be there.
      const removed = await repository.get(keyValueStoreName, compositeKey, scope);
      const result = await repository.delete(keyValueStoreName, compositeKey, scope);

      if (!result) {
        return actionResultError('ResourceNotFound', `Item with key '${key}' not found`);
      }

      // Stand in for the change stream, AFTER the delete has committed.
      await emitKvsStreamEvent(qpqConfig, session, {
        keyValueStoreName,
        eventType: KvsStreamEventType.Remove,
        scope,
        keys: removed ? toKvsStreamKeys(qpqConfig, keyValueStoreName, removed) : {},
        oldImage: removed ?? undefined,
      });

      return actionResult(undefined);
    } catch (error: any) {
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreDeleteErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreDeleteErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreDeleteActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig, devServerConfig),
  });

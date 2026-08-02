import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpsertManyActionProcessor,
  KeyValueStoreUpsertManyErrorTypeEnum,
  KvsStreamEventType,
  QPQConfig,
  validateScopedKvsItemOrThrow,
} from 'quidproquo-core';

import { emitKvsStreamEvent } from '../../../logic/kvsStream';
import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { toKvsCompositeKey, toKvsStreamKeys } from '../../../logic/keyValueStore/toKvsStreamKeys';
import { ResolvedDevServerConfig } from '../../../types';

// The batch sibling of Upsert: ONE action over the same repository the single
// processor uses (its writes are debounced and coalesce on disk, so looping here
// costs memory ops, not file writes). Per-item stream emission is kept — AWS
// streams emit one record per item regardless of how it was written, and local
// projectors must see the same shape. Unconditional, like BatchWriteItem.
const getProcessKeyValueStoreUpsertMany = (
  qpqConfig: QPQConfig,
  devServerConfig: ResolvedDevServerConfig,
): KeyValueStoreUpsertManyActionProcessor<any> => {
  return async ({ keyValueStoreName, items, options }, session) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // Validate EVERY item (scope rules + in-batch duplicate keys) before the
      // first write, for AWS parity: the awslambda processor maps/checks the
      // whole batch eagerly, so a bad item at position 3 means NOTHING lands.
      // Interleaving validation with the write loop would leave items 1-2
      // written and stream-emitted locally where prod writes nothing.
      const seenKeys = new Set<string>();
      for (const item of items) {
        validateScopedKvsItemOrThrow(qpqConfig, keyValueStoreName, scope, item);

        const itemKey = toKvsCompositeKey(qpqConfig, keyValueStoreName, item);
        if (seenKeys.has(itemKey)) {
          return actionResultError(
            KeyValueStoreUpsertManyErrorTypeEnum.DuplicateKey,
            `Duplicate key [${itemKey}] in batch upsert to [${keyValueStoreName}]`,
          );
        }
        seenKeys.add(itemKey);
      }

      for (const item of items) {
        // Read first only to tell an insert from a modify — keeps eventType honest
        // for a generic consumer, exactly as the single Upsert does.
        const existing = await repository.get(keyValueStoreName, toKvsCompositeKey(qpqConfig, keyValueStoreName, item), scope);
        await repository.upsert(keyValueStoreName, item, {}, scope);

        // Stand in for the change stream, AFTER the write has committed - see emitKvsStreamEvent.
        await emitKvsStreamEvent(qpqConfig, session, {
          keyValueStoreName,
          eventType: existing ? KvsStreamEventType.Modify : KvsStreamEventType.Insert,
          scope,
          keys: toKvsStreamKeys(qpqConfig, keyValueStoreName, item),
          newImage: item,
          oldImage: existing ?? undefined,
        });
      }

      return actionResult(void 0);
    } catch (error: any) {
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpsertManyActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.UpsertMany]: getProcessKeyValueStoreUpsertMany(qpqConfig, devServerConfig),
  });

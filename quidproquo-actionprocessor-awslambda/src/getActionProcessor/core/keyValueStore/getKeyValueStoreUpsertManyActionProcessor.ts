import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  getScopedKvsTranslatorOrThrow,
  KeyValueStoreActionType,
  KeyValueStoreUpsertManyActionProcessor,
  KeyValueStoreUpsertManyErrorTypeEnum,
  QPQConfig,
  resolveKvsStoreConfigOrThrow,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { batchPutItems } from '../../../logic/dynamo';

// The batch sibling of Upsert: BatchWriteItem in chunks of 25, partial-acceptance
// retry inside batchPutItems. Streams emit one record per item no matter how it
// was written, so downstream projectors see the same records as N single upserts.
// Unconditional (no ifNotExists — BatchWriteItem carries no conditions).
const getProcessKeyValueStoreUpsertMany = (qpqConfig: QPQConfig): KeyValueStoreUpsertManyActionProcessor<any> => {
  return async ({ keyValueStoreName, items, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);

      // Same-key duplicates are rejected UP FRONT, before anything is written.
      // Dynamo itself only rejects them when both land in the same 25-item
      // chunk — across chunks the later write silently wins — so left to the
      // service the outcome would depend on item position.
      const seenKeys = new Set<string>();
      for (const item of items) {
        const itemKey = [storeConfig.partitionKey, ...storeConfig.sortKeys].map((key) => String(item[key.key])).join('#');
        if (seenKeys.has(itemKey)) {
          return actionResultError(
            KeyValueStoreUpsertManyErrorTypeEnum.DuplicateKey,
            `Duplicate key [${itemKey}] in batch upsert to [${keyValueStoreName}]`,
          );
        }
        seenKeys.add(itemKey);
      }

      // The scope lives inside the stored partition key value, so each item is
      // persisted with a composed pk; reads strip it back off.
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);

      await batchPutItems(
        dynamoTableName,
        items.map((item) => scoped.item(item)),
        region,
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        // Retries exhausted on UnprocessedItems — sustained throttle, a transient
        // fault: callers must see ServiceUnavailable, not a permanent failure.
        BatchWriteUnprocessedItemsError: () =>
          actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.ServiceUnavailable, 'KVS batch write throttled'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpsertManyErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpsertManyActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.UpsertMany]: getProcessKeyValueStoreUpsertMany(qpqConfig),
});

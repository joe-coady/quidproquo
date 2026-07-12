import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  getScopedKvsTranslatorOrThrow,
  KeyValueStoreActionType,
  KeyValueStoreUpsertActionProcessor,
  QPQConfig,
  resolveKvsStoreConfigOrThrow,
} from 'quidproquo-core';
import { KeyValueStoreUpsertErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { putItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);

      const keys = [
        storeConfig.partitionKey,
        ...storeConfig.sortKeys,
        ...storeConfig.indexes.map((i) => i.partitionKey),
        ...storeConfig.indexes.filter((i) => !!i.sortKey).map((i) => i.sortKey!),
      ];

      // The scope lives inside the stored partition key value, so the item is
      // persisted with a composed pk; reads strip it back off.
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);

      await putItem(
        dynamoTableName,
        scoped.item(item),
        keys,
        {
          expires: options?.ttlInSeconds,
          ifNotExistsAttribute: options?.ifNotExists ? storeConfig.partitionKey.key : undefined,
        },
        region,
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        ConditionalCheckFailedException: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.Conflict, 'KVS item already exists'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpsertErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpsertErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpsertActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

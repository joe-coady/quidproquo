import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  KeyValueStoreActionType,
  KeyValueStoreUpsertActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { KeyValueStoreUpsertErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { putItem } from '../../../logic/dynamo';
import { getScopedKvsTranslatorOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find key value store with name "${keyValueStoreName}"`);
    }

    const keys = [
      storeConfig.partitionKey,
      ...storeConfig.sortKeys,
      ...storeConfig.indexes.map((i) => i.partitionKey),
      ...storeConfig.indexes.filter((i) => !!i.sortKey).map((i) => i.sortKey!),
    ];

    try {
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
      });
    }
  };
};

export const getKeyValueStoreUpsertActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

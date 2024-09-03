import {
  QPQConfig,
  qpqCoreUtils,
  KeyValueStoreUpsertActionProcessor,
  actionResult,
  KeyValueStoreActionType,
  ErrorTypeEnum,
  actionResultError,
  actionResultErrorFromCaughtError,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';

import { putItem } from '../../../logic/dynamo';
import { KeyValueStoreUpsertErrorTypeEnum } from 'quidproquo-core';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

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
      await putItem(
        dynamoTableName,
        item,
        keys,
        {
          expires: options?.ttlInSeconds,
        },
        region,
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
      });
    }
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

import {
  QPQConfig,
  qpqCoreUtils,
  KeyValueStoreUpsertActionProcessor,
  actionResult,
  KeyValueStoreActionType,
  ErrorTypeEnum,
  actionResultError,
} from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';

import { putItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpsert = (
  qpqConfig: QPQConfig,
): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    console.log('HERE!');
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `Could not find key value store with name "${keyValueStoreName}"`,
      );
    }

    const keys = [
      storeConfig.partitionKey,
      ...storeConfig.sortKeys,
      ...storeConfig.indexes.map((i) => i.partitionKey),
      ...storeConfig.indexes.filter((i) => !!i.sortKey).map((i) => i.sortKey!),
    ];

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
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

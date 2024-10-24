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

export const getKeyValueStoreUpsertActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreDeleteActionProcessor,
  KeyValueStoreDeleteErrorTypeEnum,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { deleteItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreDelete = (qpqConfig: QPQConfig): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key, sortKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName)!;

    try {
      await deleteItem(dynamoTableName, region, key, storeConfig.partitionKey.key, sortKey, storeConfig.sortKeys[0]?.key);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreDeleteErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreDeleteErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
      });
    }
  };
};

export const getKeyValueStoreDeleteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig),
});

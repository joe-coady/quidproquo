import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreGetActionProcessor,
  KeyValueStoreGetErrorTypeEnum,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { getItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreGet = (qpqConfig: QPQConfig): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const result = await getItem(dynamoTableName, key, region);

      return actionResult(result);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreGetErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreGetErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
      });
    }
  };
};

export const getKeyValueStoreGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig),
});

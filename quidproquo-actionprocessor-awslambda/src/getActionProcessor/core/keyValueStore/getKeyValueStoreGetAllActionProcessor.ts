import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, actionResultError, actionResultErrorFromCaughtError, KeyValueStoreActionType, KeyValueStoreGetAllActionProcessor, KeyValueStoreGetAllErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { getAllItems } from '../../../logic/dynamo';

const getProcessKeyValueStoreGetAll = (qpqConfig: QPQConfig): KeyValueStoreGetAllActionProcessor<any> => {
  return async ({ keyValueStoreName }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const result = await getAllItems(dynamoTableName, region);

      return actionResult(result);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreGetAllErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreGetAllErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
      });
    }
  };
};

export const getKeyValueStoreGetAllActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.GetAll]: getProcessKeyValueStoreGetAll(qpqConfig),
});

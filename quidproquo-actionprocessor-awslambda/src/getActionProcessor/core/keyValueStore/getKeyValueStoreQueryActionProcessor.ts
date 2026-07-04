import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreQueryActionProcessor, KeyValueStoreQueryErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { query } from '../../../logic/dynamo';
import { getDynamoTableIndexByConfigAndQuery } from '../../../logic/dynamo/qpqDynamoOrm';

const getProcessKeyValueStoreQuery = (qpqConfig: QPQConfig): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find key value store with name "${keyValueStoreName}"`);
    }

    try {
      const items = await query<any>(
        dynamoTableName,
        region,
        keyCondition,
        options?.filter,
        options?.nextPageKey,
        getDynamoTableIndexByConfigAndQuery(storeConfig, keyCondition),
        options?.limit,
        options?.sortAscending,
      );

      return actionResult(items);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreQueryErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreQueryErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
      });
    }
  };
};

export const getKeyValueStoreQueryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig),
});

import { ActionProcessorList,ActionProcessorListResolver, actionResultError, ErrorTypeEnum, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType,KeyValueStoreQueryActionProcessor } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { query } from '../../../logic/dynamo';
import { getDynamoTableIndexByConfigAndQuery } from '../../../logic/dynamo/qpqDynamoOrm';

const getProcessKeyValueStoreQuery = (qpqConfig: QPQConfig): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find key value store with name "${keyValueStoreName}"`);
    }

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
  };
};

export const getKeyValueStoreQueryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig),
});

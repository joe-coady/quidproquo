import { QPQConfig, qpqCoreUtils, actionResultError, ErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreQueryActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { query } from '../../../logic/dynamo';
import { getDynamoTableIndexByConfigAndQuery } from '../../../logic/dynamo/qpqDynamoOrm';

const getProcessKeyValueStoreQuery = (
  qpqConfig: QPQConfig,
): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `Could not find key value store with name "${keyValueStoreName}"`,
      );
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

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig),
});

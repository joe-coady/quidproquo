import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreGetAllActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { getAllItems } from '../../../logic/dynamo';

const getProcessKeyValueStoreGetAll = (
  qpqConfig: QPQConfig,
): KeyValueStoreGetAllActionProcessor<any> => {
  return async ({ keyValueStoreName }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const result = await getAllItems(dynamoTableName, region);

    return actionResult(result);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.GetAll]: getProcessKeyValueStoreGetAll(qpqConfig),
});

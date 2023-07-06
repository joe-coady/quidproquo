import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreDeleteActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { deleteItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreDelete = (
  qpqConfig: QPQConfig,
): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key, sortKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await deleteItem(dynamoTableName, region, key, sortKey);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig),
});

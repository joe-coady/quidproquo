import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreUpdateActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { updateItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpdate = (
  qpqConfig: QPQConfig,
): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await updateItem(dynamoTableName, region, updates, key, sortKey);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig),
});

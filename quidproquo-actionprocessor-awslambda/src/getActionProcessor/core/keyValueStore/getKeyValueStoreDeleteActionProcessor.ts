import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { KeyValueStoreDeleteActionProcessor, actionResult, KeyValueStoreActionType } from 'quidproquo-core';
import { deleteItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreDelete = (qpqConfig: QPQConfig): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key, sortKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName)!;

    await deleteItem(dynamoTableName, region, key, storeConfig.partitionKey.key, sortKey, storeConfig.sortKeys[0]?.key);

    return actionResult(void 0);
  };
};

export const getKeyValueStoreDeleteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig),
});

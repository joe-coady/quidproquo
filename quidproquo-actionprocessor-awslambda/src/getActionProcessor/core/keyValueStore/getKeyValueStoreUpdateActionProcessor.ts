import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreUpdateActionProcessor } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { updateItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpdate = (qpqConfig: QPQConfig): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName)!;

    const item = await updateItem(dynamoTableName, region, updates, storeConfig.partitionKey.key, key, storeConfig.sortKeys[0]?.key, sortKey);

    return actionResult(item);
  };
};

export const getKeyValueStoreUpdateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig),
});

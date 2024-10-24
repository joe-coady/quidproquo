import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreGetActionProcessor } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { getItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreGet = (qpqConfig: QPQConfig): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const result = await getItem(dynamoTableName, key, region);

    return actionResult(result);
  };
};

export const getKeyValueStoreGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig),
});

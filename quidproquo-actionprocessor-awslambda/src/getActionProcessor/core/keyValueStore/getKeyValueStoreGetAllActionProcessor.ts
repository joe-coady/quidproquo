import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreGetAllActionProcessor } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { getAllItems } from '../../../logic/dynamo';

const getProcessKeyValueStoreGetAll = (qpqConfig: QPQConfig): KeyValueStoreGetAllActionProcessor<any> => {
  return async ({ keyValueStoreName }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const result = await getAllItems(dynamoTableName, region);

    return actionResult(result);
  };
};

export const getKeyValueStoreGetAllActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.GetAll]: getProcessKeyValueStoreGetAll(qpqConfig),
});

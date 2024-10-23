import { ActionProcessorList,ActionProcessorListResolver, actionResultError, ErrorTypeEnum, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType,KeyValueStoreScanActionProcessor } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { scan } from '../../../logic/dynamo/scan';

const getProcessKeyValueStoreScan = (qpqConfig: QPQConfig): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const items = await scan<any>(dynamoTableName, region, filterCondition, nextPageKey);

    return actionResult(items);
  };
};

export const getKeyValueStoreScanActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig),
});

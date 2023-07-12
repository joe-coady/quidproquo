import { QPQConfig, qpqCoreUtils, actionResultError, ErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreScanActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { scan } from '../../../logic/dynamo/scan';

const getProcessKeyValueStoreScan = (
  qpqConfig: QPQConfig,
): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const items = await scan<any>(dynamoTableName, region, filterCondition, nextPageKey);

    return actionResult(items);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig),
});

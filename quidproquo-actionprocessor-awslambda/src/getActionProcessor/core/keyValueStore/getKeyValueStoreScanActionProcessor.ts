import { QPQConfig, qpqCoreUtils, actionResultError, ErrorTypeEnum } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreScanActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { scan } from '../../../logic/dynamo/scan';

const getProcessKeyValueStoreScan = (
  qpqConfig: QPQConfig,
): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition }) => {
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `Could not find key value store with name "${keyValueStoreName}"`,
      );
    }

    const items = await scan(dynamoTableName, region, filterCondition);

    return actionResult(items);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig),
});

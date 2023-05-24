import { QPQConfig, qpqCoreUtils, actionResultError, ErrorTypeEnum } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreQueryActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { query } from '../../../logic/dynamo';

const getProcessKeyValueStoreQuery = (
  qpqConfig: QPQConfig,
): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName }) => {
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

    await query(dynamoTableName, region);

    return actionResult([]);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig),
});

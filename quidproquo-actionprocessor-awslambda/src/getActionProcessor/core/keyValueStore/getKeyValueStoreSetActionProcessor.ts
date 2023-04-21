import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreSetActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { putItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreSet = (qpqConfig: QPQConfig): KeyValueStoreSetActionProcessor<any> => {
  return async ({ keyValueStoreName, key, value, options }) => {
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await putItem(
      dynamoTableName,
      key,
      value,
      {
        expires: options?.ttl,
      },
      region,
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Set]: getProcessKeyValueStoreSet(qpqConfig),
});

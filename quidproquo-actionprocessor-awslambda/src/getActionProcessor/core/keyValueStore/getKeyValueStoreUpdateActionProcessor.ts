import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreUpdateActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { updateItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpdate = (
  qpqConfig: QPQConfig,
): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, value, options }) => {
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await updateItem(
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
  [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig),
});

import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreDeleteActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { deleteItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreDelete = (
  qpqConfig: QPQConfig,
): KeyValueStoreDeleteActionProcessor => {
  return async ({ keyValueStoreName, key }) => {
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await deleteItem(dynamoTableName, key, region);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Delete]: getProcessKeyValueStoreDelete(qpqConfig),
});

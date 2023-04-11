import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreGetActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { getItem } from '../../../logic/dynamo/getItem';

const getProcessKeyValueStoreGet = (qpqConfig: QPQConfig): KeyValueStoreGetActionProcessor<any> => {
  return async ({ keyValueStoreName, key }) => {
    const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
      keyValueStoreName,
      qpqConfig,
      'kvs',
    );
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const result = await getItem(dynamoTableName, key, region);

    return actionResult(result);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Get]: getProcessKeyValueStoreGet(qpqConfig),
});

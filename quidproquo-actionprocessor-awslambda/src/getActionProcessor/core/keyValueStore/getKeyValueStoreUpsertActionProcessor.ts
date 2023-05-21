import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import {
  KeyValueStoreUpsertActionProcessor,
  actionResult,
  KeyValueStoreActionType,
} from 'quidproquo-core';
import { putItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpsert = (
  qpqConfig: QPQConfig,
): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    // const dynamoTableName = getQpqRuntimeResourceNameFromConfig(
    //   keyValueStoreName,
    //   qpqConfig,
    //   'kvs',
    // );
    // const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    // await putItem(
    //   dynamoTableName,
    //   key,
    //   value,
    //   {
    //     expires: options?.ttlInSeconds,
    //   },
    //   region,
    // );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig),
});

import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, actionResultError, actionResultErrorFromCaughtError, QPQConfig } from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreScanActionProcessor, KeyValueStoreScanErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { scan } from '../../../logic/dynamo/scan';
import { getScopedKvsTranslatorOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreScan = (qpqConfig: QPQConfig): KeyValueStoreScanActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      // A scan has no key condition, so scope is enforced as a begins_with
      // prefix predicate ANDed onto the caller's filter. Still a full-table
      // scan on the Dynamo side - only the results are isolated.
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);

      const items = await scan<any>(dynamoTableName, region, scoped.scanFilter(filterCondition), nextPageKey);

      items.items = items.items.map((item: any) => scoped.strip(item));

      return actionResult(items);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreScanErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreScanErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreScanErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreScanActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Scan]: getProcessKeyValueStoreScan(qpqConfig),
});

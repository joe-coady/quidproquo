import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreGetAllActionProcessor,
  KeyValueStoreGetAllErrorTypeEnum,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { getAllItems } from '../../../logic/dynamo';
import { getScopedKvsTranslatorOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreGetAll = (qpqConfig: QPQConfig): KeyValueStoreGetAllActionProcessor<any> => {
  return async ({ keyValueStoreName, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      // GetAll has no key condition, so scope is enforced as a begins_with
      // prefix filter (a full scan on the Dynamo side either way).
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);

      const result = await getAllItems(dynamoTableName, region, scoped.scanFilter(undefined));

      return actionResult(result.map((item) => scoped.strip(item)));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreGetAllErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreGetAllErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreGetAllErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreGetAllActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.GetAll]: getProcessKeyValueStoreGetAll(qpqConfig),
});

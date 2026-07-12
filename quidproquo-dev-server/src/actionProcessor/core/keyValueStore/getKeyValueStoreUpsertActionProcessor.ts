import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreUpsertActionProcessor,
  KeyValueStoreUpsertErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';

const getProcessKeyValueStoreUpsert = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreUpsertActionProcessor<any> => {
  return async ({ keyValueStoreName, item, options }) => {
    try {
      const repository = getKvsRepository(qpqConfig, devServerConfig);
      const result = await repository.upsert(keyValueStoreName, item, {
        ifNotExists: options?.ifNotExists,
      });
      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {
        ConditionalCheckFailedException: () => actionResultError(KeyValueStoreUpsertErrorTypeEnum.Conflict, 'KVS item already exists'),
      });
    }
  };
};

export const getKeyValueStoreUpsertActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Upsert]: getProcessKeyValueStoreUpsert(qpqConfig, devServerConfig),
  });

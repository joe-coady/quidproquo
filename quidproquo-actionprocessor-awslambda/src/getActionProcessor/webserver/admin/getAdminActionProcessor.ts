import {
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  QpqRuntimeType,
  StoryResult,
  StoryResultMetadata,
} from 'quidproquo-core';

import { AdminGetLogsActionProcessor, AdminActionType } from 'quidproquo-webserver';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';

import { getPagedItemsOverRange } from '../../../logic/dynamo/getPagedItemsOverRange';

const getAdminGetLogsActionProcessor = (qpqConfig: QPQConfig): AdminGetLogsActionProcessor => {
  return async ({ runtimeType, nextPageKey, startIsoDateTime, endIsoDateTime }) => {
    // TODO: Centralize this
    const QPQ_LOG_BUCKET_NAME = 'logs';
    const tableName = getQpqRuntimeResourceNameFromConfig(QPQ_LOG_BUCKET_NAME, qpqConfig, 'log');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const response = await getPagedItemsOverRange(
      tableName,
      region,
      runtimeType,
      startIsoDateTime,
      endIsoDateTime,
      nextPageKey,
    );

    console.log(JSON.stringify(response, null, 2));

    return actionResult(response);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [AdminActionType.GetLogs]: getAdminGetLogsActionProcessor(qpqConfig),
  };
};

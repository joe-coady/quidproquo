import { actionResult, QPQConfig, qpqCoreUtils, StoryResult } from 'quidproquo-core';

import {
  AdminGetLogsActionProcessor,
  AdminGetLogActionProcessor,
  AdminActionType,
} from 'quidproquo-webserver';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';

import { getPagedItemsOverRange } from '../../../logic/dynamo/getPagedItemsOverRange';
import { readTextFile } from '../../../logic/s3/readTextFile';

// TODO: Centralize this
const QPQ_LOG_BUCKET_NAME = 'logs';

const getAdminGetLogsActionProcessor = (qpqConfig: QPQConfig): AdminGetLogsActionProcessor => {
  return async ({ runtimeType, nextPageKey, startIsoDateTime, endIsoDateTime }) => {
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

const getAdminGetLogActionProcessor = (qpqConfig: QPQConfig): AdminGetLogActionProcessor => {
  return async ({ correlationId }) => {
    const bucketName = getQpqRuntimeResourceNameFromConfig(QPQ_LOG_BUCKET_NAME, qpqConfig, 'log');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const logJson = await readTextFile(bucketName, `${correlationId}.json`, region);

    const response = JSON.parse(logJson) as StoryResult<any>;

    return actionResult(response);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [AdminActionType.GetLogs]: getAdminGetLogsActionProcessor(qpqConfig),
    [AdminActionType.GetLog]: getAdminGetLogActionProcessor(qpqConfig),
  };
};

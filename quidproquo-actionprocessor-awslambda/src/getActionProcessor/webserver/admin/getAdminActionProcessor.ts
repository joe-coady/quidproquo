import {
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  StoryResult,
} from 'quidproquo-core';

import { AdminGetLogsActionProcessor, AdminActionType } from 'quidproquo-webserver';

import { executeLambdaByName } from '../../../logic/lambda/executeLambdaByName';

import { getQpqRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';

import { listFiles } from '../../../logic/s3/listFiles';
import { readTextFile } from '../../../logic/s3/readTextFile';

const getAdminGetLogsActionProcessor = (qpqConfig: QPQConfig): AdminGetLogsActionProcessor => {
  return async ({}) => {
    // TODO: Centralize this
    const QPQ_LOG_BUCKET_NAME = 'logs';

    const bucketName = getQpqRuntimeResourceNameFromConfig(QPQ_LOG_BUCKET_NAME, qpqConfig, 'log');
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const files = await listFiles(bucketName, region);

    const contentsJson = await Promise.all(
      files.fileInfos.map((f) => readTextFile(bucketName, f.filepath, region)),
    );

    const actionResults = contentsJson.map((cj) => JSON.parse(cj) as StoryResult<any>);

    return actionResult(actionResults);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [AdminActionType.GetLogs]: getAdminGetLogsActionProcessor(qpqConfig),
  };
};

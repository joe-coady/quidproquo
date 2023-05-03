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

    const actionResultMetadata = contentsJson
      .map((cj) => JSON.parse(cj) as StoryResult<any>)
      .map(
        (sr, i) =>
          ({
            filePath: files.fileInfos[i].filepath,
            generic: '',
            runtimeType: sr.runtimeType,
            startedAt: sr.startedAt,
          } as StoryResultMetadata),
      );

    return actionResult(actionResultMetadata);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [AdminActionType.GetLogs]: getAdminGetLogsActionProcessor(qpqConfig),
  };
};

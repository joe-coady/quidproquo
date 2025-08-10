import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, actionResultError, ErrorTypeEnum, QPQConfig } from 'quidproquo-core';
import { actionResult, FileActionType, FileGenerateTemporaryUploadSecureUrlActionProcessor } from 'quidproquo-core';

import { generatePresignedUploadUrl } from '../../../logic/s3/generatePresignedUploadUrl';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileGenerateTemporaryUploadSecureUrl = (qpqConfig: QPQConfig): FileGenerateTemporaryUploadSecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, contentType }, session) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const url = await generatePresignedUploadUrl(
        s3BucketName,
        filepath,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        expirationMs,
        session.correlation,
        contentType
      );

      return actionResult(url);
    } catch (error: any) {
      return actionResultError(ErrorTypeEnum.GenericError, 'Unable to generate temporary upload secure URL', error);
    }
  };
};

export const getFileGenerateTemporaryUploadSecureUrlActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.GenerateTemporaryUploadSecureUrl]: getProcessFileGenerateTemporaryUploadSecureUrl(qpqConfig),
});

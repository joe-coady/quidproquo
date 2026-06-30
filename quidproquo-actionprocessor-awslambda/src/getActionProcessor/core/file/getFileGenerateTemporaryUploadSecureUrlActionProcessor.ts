import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, actionResultError, ErrorTypeEnum, QPQConfig } from 'quidproquo-core';
import { actionResult, FileActionType, FileGenerateTemporaryUploadSecureUrlActionProcessor, FileGenerateTemporaryUploadSecureUrlErrorTypeEnum } from 'quidproquo-core';

import { generatePresignedUploadUrl } from '../../../logic/s3/generatePresignedUploadUrl';
import { resolveStorageDriveBucketName } from './utils';

// SigV4 presigned URLs cannot expire more than 7 days in the future
const maxExpirationMs = 7 * 24 * 60 * 60 * 1000;

const getProcessFileGenerateTemporaryUploadSecureUrl = (qpqConfig: QPQConfig): FileGenerateTemporaryUploadSecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, contentType }, session) => {
    if (expirationMs > maxExpirationMs) {
      return actionResultError(FileGenerateTemporaryUploadSecureUrlErrorTypeEnum.ExpirationTooLong, 'Expiration exceeds the 7 day maximum for presigned URLs');
    }

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

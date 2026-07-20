import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, actionResultError, actionResultErrorFromCaughtError, QPQConfig } from 'quidproquo-core';
import {
  actionResult,
  composeScopedFilePath,
  FileActionType,
  FileGenerateTemporaryUploadSecureUrlActionProcessor,
  FileGenerateTemporaryUploadSecureUrlErrorTypeEnum,
} from 'quidproquo-core';

import { generatePresignedUploadUrl } from '../../../logic/s3/generatePresignedUploadUrl';
import { resolveStorageDriveBucketName } from './utils';

// SigV4 presigned URLs cannot expire more than 7 days in the future
const maxExpirationMs = 7 * 24 * 60 * 60 * 1000;

const getProcessFileGenerateTemporaryUploadSecureUrl = (qpqConfig: QPQConfig): FileGenerateTemporaryUploadSecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, contentType, contentDisposition, scope }, session) => {
    if (expirationMs > maxExpirationMs) {
      return actionResultError(
        FileGenerateTemporaryUploadSecureUrlErrorTypeEnum.ExpirationTooLong,
        'Expiration exceeds the 7 day maximum for presigned URLs',
      );
    }

    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const url = await generatePresignedUploadUrl(
        s3BucketName,
        composeScopedFilePath(scope, filepath),
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        expirationMs,
        session.correlation,
        contentType,
        contentDisposition,
      );

      return actionResult(url);
    } catch (error: unknown) {
      // Name-keyed, not instanceof: under npm link / module federation the
      // error can come from another copy of quidproquo-core.
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(FileGenerateTemporaryUploadSecureUrlErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getFileGenerateTemporaryUploadSecureUrlActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.GenerateTemporaryUploadSecureUrl]: getProcessFileGenerateTemporaryUploadSecureUrl(qpqConfig),
});

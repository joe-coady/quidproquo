import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, actionResultError, ErrorTypeEnum, InvalidScopeError, QPQConfig } from 'quidproquo-core';
import {
  actionResult,
  composeScopedFilePath,
  FileActionType,
  FileGenerateTemporarySecureUrlActionProcessor,
  FileGenerateTemporarySecureUrlErrorTypeEnum,
} from 'quidproquo-core';

import { generatePresignedUrl } from '../../../logic/s3/generatePresignedUrl';
import { resolveStorageDriveBucketName } from './utils';

// SigV4 presigned URLs cannot expire more than 7 days in the future
const maxExpirationMs = 7 * 24 * 60 * 60 * 1000;

const getProcessFileGenerateTemporarySecureUrl = (qpqConfig: QPQConfig): FileGenerateTemporarySecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs, scope }) => {
    if (expirationMs > maxExpirationMs) {
      return actionResultError(
        FileGenerateTemporarySecureUrlErrorTypeEnum.ExpirationTooLong,
        'Expiration exceeds the 7 day maximum for presigned URLs',
      );
    }

    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const url = await generatePresignedUrl(
        s3BucketName,
        composeScopedFilePath(scope, filepath),
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        expirationMs,
      );

      return actionResult(url);
    } catch (error: any) {
      if (error instanceof InvalidScopeError) {
        return actionResultError(FileGenerateTemporarySecureUrlErrorTypeEnum.InvalidScope, error.message);
      }
      return actionResultError(ErrorTypeEnum.GenericError, 'Unable to generate temporary secure URL', error);
    }
  };
};

export const getFileGenerateTemporarySecureUrlActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [FileActionType.GenerateTemporarySecureUrl]: getProcessFileGenerateTemporarySecureUrl(qpqConfig),
});

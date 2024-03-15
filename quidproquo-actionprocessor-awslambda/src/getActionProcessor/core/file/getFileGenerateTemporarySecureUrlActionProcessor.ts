import { ErrorTypeEnum, QPQConfig, actionResultError, qpqCoreUtils } from 'quidproquo-core';

import {
  FileGenerateTemporarySecureUrlActionProcessor,
  actionResult,
  FileActionType,
} from 'quidproquo-core';
import { generatePresignedUrl } from '../../../logic/s3/generatePresignedUrl';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileGenerateTemporarySecureUrl = (
  qpqConfig: QPQConfig,
): FileGenerateTemporarySecureUrlActionProcessor => {
  return async ({ drive, filepath, expirationMs }) => {
    try {
      const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);
      const url = await generatePresignedUrl(
        s3BucketName,
        filepath,
        qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
        expirationMs,
      );

      return actionResult(url);
    } catch (error: any) {
      return actionResultError(
        ErrorTypeEnum.GenericError,
        'Unable to generate temporary secure URL',
        error,
      );
    }
  };
};

export default (qpqConfig: QPQConfig) => ({
  [FileActionType.GenerateTemporarySecureUrl]: getProcessFileGenerateTemporarySecureUrl(qpqConfig),
});

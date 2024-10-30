import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  FileActionType,
  FileIsColdStorageActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getObjectStorageClass } from '../../../logic/s3/getObjectStorageClass';
import { resolveStorageDriveBucketName } from './utils';

const getProcessFileIsColdStorage = (qpqConfig: QPQConfig): FileIsColdStorageActionProcessor => {
  return async ({ drive, filepath }) => {
    const s3BucketName = resolveStorageDriveBucketName(drive, qpqConfig);

    const isColdStorage =
      (await getObjectStorageClass(s3BucketName, filepath, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig))) === 'cold_storage';

    return actionResult(isColdStorage);
  };
};

export const getFileIsColdStorageActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [FileActionType.IsColdStorage]: getProcessFileIsColdStorage(qpqConfig),
});

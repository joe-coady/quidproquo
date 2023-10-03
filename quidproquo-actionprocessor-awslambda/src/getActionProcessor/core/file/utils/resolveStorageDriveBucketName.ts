import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { getConfigRuntimeResourceNameFromConfigWithServiceOverride } from '../../../../awsNamingUtils';

export const resolveStorageDriveBucketName = (drive: string, qpqConfig: QPQConfig) => {
  const storageDriveConfig = qpqCoreUtils.getStorageDriveByName(drive, qpqConfig);

  if (!storageDriveConfig) {
    throw new Error(`Could not find storage drive config for [${drive}]`);
  }

  return getConfigRuntimeResourceNameFromConfigWithServiceOverride(
    drive,
    qpqConfig,
    storageDriveConfig.owner?.module,
  );
};

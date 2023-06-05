import { QPQConfig, DriveName, CrossServiceResourceName } from 'quidproquo-core';
import { getConfigRuntimeResourceNameFromConfigWithServiceOverride } from '../../../../awsNamingUtils';

export const resolveCrossServiceDriveName = (drive: DriveName): CrossServiceResourceName => {
  if (typeof drive === 'string') {
    return {
      name: drive,
    };
  }

  return drive;
};

export const resolveStorageDriveBucketName = (drive: DriveName, qpqConfig: QPQConfig) => {
  const xServiceDriveName = resolveCrossServiceDriveName(drive);

  return getConfigRuntimeResourceNameFromConfigWithServiceOverride(
    xServiceDriveName.name,
    qpqConfig,
    xServiceDriveName.service,
  );
};

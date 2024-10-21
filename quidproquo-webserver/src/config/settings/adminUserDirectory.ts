import { QPQConfig, QPQConfigAdvancedSettings, QPQConfigAdvancedUserDirectorySettings, defineUserDirectory } from 'quidproquo-core';

export const adminUserDirectoryResourceName = 'qpq-admin';

type QPQConfigAdvancedAdminUserDirectorySettings = Required<Pick<QPQConfigAdvancedUserDirectorySettings, 'owner'>>;

export const defineAdminUserDirectory = (options?: QPQConfigAdvancedAdminUserDirectorySettings): QPQConfig => {
  const configs = [defineUserDirectory(adminUserDirectoryResourceName, options)];

  return configs;
};

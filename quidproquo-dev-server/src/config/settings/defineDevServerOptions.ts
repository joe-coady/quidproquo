import { QPQConfig, QPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';

export enum QPQDevServerConfigSettingType {
  devServerOptions = '@quidproquo-dev-server/config/DevServerOptions',
}

export interface DevServerOptions {
  // Port the service's views dev server listens on locally.
  port?: number;
}

export interface DevServerOptionsQPQConfigSetting extends QPQConfigSetting, DevServerOptions {}

export const defineDevServerOptions = (options: DevServerOptions): DevServerOptionsQPQConfigSetting => ({
  configSettingType: QPQDevServerConfigSettingType.devServerOptions,
  uniqueKey: 'DevServerOptions',

  ...options,
});

export const getDevServerOptions = (qpqConfig: QPQConfig): DevServerOptions => {
  const settings = qpqCoreUtils.getConfigSettings<DevServerOptionsQPQConfigSetting>(qpqConfig, QPQDevServerConfigSettingType.devServerOptions);

  if (settings.length > 1) {
    throw new Error('max one entry of defineDevServerOptions can be used per service');
  }

  return settings[0] ?? {};
};

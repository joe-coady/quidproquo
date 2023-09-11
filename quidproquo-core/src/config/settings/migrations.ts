import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { QpqSourceEntry } from './queue';

export enum DeployTypeEnum {
  Inf = 'inf',
  Web = 'web',
  Api = 'api'
}

export interface Migration {
  deployType: DeployTypeEnum;
  src: QpqSourceEntry;
}

export interface MigrationsQPQConfigSetting extends QPQConfigSetting {
  migrations: Migration[];
  buildPath: string;
}

export const defineMigrations = (
  buildPath: string,
  migrations: Migration[],
): MigrationsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.migrations,
  uniqueKey: 'migrations',

  buildPath,
  migrations
});

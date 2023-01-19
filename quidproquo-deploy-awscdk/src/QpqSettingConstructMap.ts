import { QPQCoreConfigSettingType } from 'quidproquo-core';
import { QpqConstruct } from './constructs/core/QpqConstruct';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqCoreParameterConstruct } from './constructs/QpqCoreParameterConstruct';
import { QpqCoreSecretConstruct } from './constructs/QpqCoreSecretConstruct';
import { QpqCoreStorageDriveConstruct } from './constructs/QpqCoreStorageDriveConstruct';
import { QpqWebserverDomainConstruct } from './constructs/QpqWebserverDomainConstruct';

export type QpqSettingConstructMap = Record<string, typeof QpqConstruct>;

export default {
  [QPQCoreConfigSettingType.parameter]: QpqCoreParameterConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.secret]: QpqCoreSecretConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.storageDrive]: QpqCoreStorageDriveConstruct as typeof QpqConstruct,
  [QPQWebServerConfigSettingType.Dns]: QpqWebserverDomainConstruct as typeof QpqConstruct,
} as QpqSettingConstructMap;

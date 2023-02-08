import { QPQCoreConfigSettingType } from 'quidproquo-core';
import { QpqConstruct } from './constructs/core/QpqConstruct';
import { QPQWebServerConfigSettingType } from 'quidproquo-webserver';

import { QpqCoreParameterConstruct } from './constructs/QpqCoreParameterConstruct';
import { QpqCoreSecretConstruct } from './constructs/QpqCoreSecretConstruct';
import { QpqCoreStorageDriveConstruct } from './constructs/QpqCoreStorageDriveConstruct';
import { QpqCoreRecurringScheduleConstruct } from './constructs/QpqCoreRecurringScheduleConstruct';
import { QpqWebserverApiConstruct } from './constructs/QpqWebserverApiConstruct';
import { QpqWebserverDomainConstruct } from './constructs/QpqWebserverDomainConstruct';
import { QpqWebserverSubdomainRedirectConstruct } from './constructs/QpqWebserverSubdomainRedirectConstruct';
import { QpqWebserverWebEntryConstruct } from './constructs/QpqWebserverWebEntryConstruct';
import { QpqCoreQueueConstruct } from './constructs/QpqCoreQueueConstruct';

export type QpqSettingConstructMap = Record<string, typeof QpqConstruct>;

export default {
  [QPQCoreConfigSettingType.parameter]: QpqCoreParameterConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.secret]: QpqCoreSecretConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.storageDrive]: QpqCoreStorageDriveConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.schedule]: QpqCoreRecurringScheduleConstruct as typeof QpqConstruct,
  [QPQCoreConfigSettingType.queue]: QpqCoreQueueConstruct as typeof QpqConstruct,

  [QPQWebServerConfigSettingType.Api]: QpqWebserverApiConstruct as typeof QpqConstruct,
  [QPQWebServerConfigSettingType.Dns]: QpqWebserverDomainConstruct as typeof QpqConstruct,
  [QPQWebServerConfigSettingType.WebEntry]: QpqWebserverWebEntryConstruct as typeof QpqConstruct,
  [QPQWebServerConfigSettingType.SubdomainRedirect]:
    QpqWebserverSubdomainRedirectConstruct as typeof QpqConstruct,
} as QpqSettingConstructMap;

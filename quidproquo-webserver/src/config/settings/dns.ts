import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface DnsQPQWebServerConfigSetting extends QPQConfigSetting {
  dnsBase: string;
}

export const defineDns = (dnsBase: string): DnsQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Dns,
  uniqueKey: dnsBase,

  dnsBase,
});

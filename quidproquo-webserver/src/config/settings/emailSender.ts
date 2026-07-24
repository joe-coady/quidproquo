import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface EmailSenderQPQWebServerConfigSetting extends QPQConfigSetting {
  rootDomain: string;
}

export const defineEmailSender = (rootDomain: string): EmailSenderQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.EmailSender,
    uniqueKey: rootDomain,

    rootDomain,
  };
};

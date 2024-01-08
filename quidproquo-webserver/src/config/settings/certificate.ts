import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedCertificateSettings extends QPQConfigAdvancedSettings {}

export interface CertificateQPQWebServerConfigSetting extends QPQConfigSetting {
  onRootDomain: boolean;
  subdomain?: string;
}

export const defineCertificate = (
  onRootDomain: boolean,
  subdomain?: string,
  options?: QPQConfigAdvancedCertificateSettings,
): CertificateQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Certificate,
  uniqueKey: `${onRootDomain}${subdomain}`,

  onRootDomain,
  subdomain,
});

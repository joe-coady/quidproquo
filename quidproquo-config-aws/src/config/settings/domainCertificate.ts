import { QPQConfigSetting } from 'quidproquo-core';

import { QPQAwsConfigSettingType } from '../QPQConfig';

export interface DomainCertificateQPQConfigSetting extends QPQConfigSetting {
  /**
   * The base root domain — the un-prefixed apex. At domain stack synth time this is resolved
   * against the config's environment and feature via the same `resolveDomainRoot` logic that
   * `defineApi` uses, so a dev deploy of `rootDomain: "example.com"` ends up issuing a cert
   * against `development.example.com` (or `myfeature.development.example.com`).
   *
   * Pass the same value you pass to `defineApi` / web entry `rootDomain` fields.
   */
  rootDomain: string;
  region: string;
  subdomains: string[];
  includeApex: boolean;
}

export const defineDomainCertificate = (
  rootDomain: string,
  region: string,
  subdomains: string[],
  options?: { includeApex?: boolean },
): DomainCertificateQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.awsDomainCertificate,
  uniqueKey: `${rootDomain}::${region}`,

  rootDomain,
  region,
  subdomains,
  includeApex: options?.includeApex ?? false,
});

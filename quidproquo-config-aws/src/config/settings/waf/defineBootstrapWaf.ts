import { QPQConfigSetting } from 'quidproquo-core';

import { QPQAwsConfigSettingType } from '../../QPQConfig';

export enum WafManagedRuleGroup {
  common = 'common', // AWSManagedRulesCommonRuleSet
  knownBadInputs = 'knownBadInputs', // AWSManagedRulesKnownBadInputsRuleSet
  sqli = 'sqli', // AWSManagedRulesSQLiRuleSet
  ipReputation = 'ipReputation', // AWSManagedRulesAmazonIpReputationList
}

export interface WafRateLimit {
  name: string;

  /** Maximum requests per 5-minute window per source IP before the IP is blocked. */
  limit: number;

  /** Scope the rate limit to uri paths with this prefix (e.g. '/auth'). Omit to rate limit all paths. */
  uriPathStartsWith?: string;
}

export interface BootstrapWafQPQConfigSetting extends QPQConfigSetting {
  /** Managed rule groups to enable. Defaults to common, knownBadInputs and sqli. */
  managedRuleGroups?: WafManagedRuleGroup[];

  /** Rate-based blocking rules (e.g. brute-force throttling on auth endpoints). Defaults to none. */
  rateLimits?: WafRateLimit[];
}

/**
 * Web application firewall for this app+environment, created once in the bootstrap phase:
 * a REGIONAL web acl (attached to each service's api gateway stage) and a CLOUDFRONT web
 * acl in us-east-1 (attached to web-entry and domain-proxy distributions). Services opt
 * into attachment with `defineWafProtection` in their (shared) service config.
 */
export const defineBootstrapWaf = (
  options?: Omit<BootstrapWafQPQConfigSetting, 'configSettingType' | 'uniqueKey'>,
): BootstrapWafQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.bootstrapWaf,
  uniqueKey: 'bootstrapWaf',

  managedRuleGroups: options?.managedRuleGroups,
  rateLimits: options?.rateLimits,
});

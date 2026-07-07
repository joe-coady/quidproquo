import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../../QPQConfig';
import { defineBootstrapWaf, WafManagedRuleGroup } from './defineBootstrapWaf';

describe('defineBootstrapWaf', () => {
  it('builds a waf setting with undefined options when omitted', () => {
    expect(defineBootstrapWaf()).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapWaf,
      uniqueKey: 'bootstrapWaf',
      managedRuleGroups: undefined,
      rateLimits: undefined,
    });
  });

  it('carries through the supplied options', () => {
    const managedRuleGroups = [WafManagedRuleGroup.common, WafManagedRuleGroup.ipReputation];
    const rateLimits = [{ name: 'auth', limit: 100, uriPathStartsWith: '/auth' }];

    expect(defineBootstrapWaf({ managedRuleGroups, rateLimits })).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapWaf,
      uniqueKey: 'bootstrapWaf',
      managedRuleGroups,
      rateLimits,
    });
  });
});

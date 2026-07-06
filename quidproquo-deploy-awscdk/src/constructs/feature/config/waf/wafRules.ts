import { BootstrapWafQPQConfigSetting, WafManagedRuleGroup, WafRateLimit } from 'quidproquo-config-aws';

import { aws_wafv2 } from 'aws-cdk-lib';

const managedRuleGroupVendorNames: Record<WafManagedRuleGroup, string> = {
  [WafManagedRuleGroup.common]: 'AWSManagedRulesCommonRuleSet',
  [WafManagedRuleGroup.knownBadInputs]: 'AWSManagedRulesKnownBadInputsRuleSet',
  [WafManagedRuleGroup.sqli]: 'AWSManagedRulesSQLiRuleSet',
  [WafManagedRuleGroup.ipReputation]: 'AWSManagedRulesAmazonIpReputationList',
};

const defaultManagedRuleGroups: WafManagedRuleGroup[] = [WafManagedRuleGroup.common, WafManagedRuleGroup.knownBadInputs, WafManagedRuleGroup.sqli];

const buildManagedRuleGroupRule = (ruleGroup: WafManagedRuleGroup, priority: number): aws_wafv2.CfnWebACL.RuleProperty => {
  const vendorName = managedRuleGroupVendorNames[ruleGroup];

  return {
    name: vendorName,
    priority,
    overrideAction: { none: {} },
    statement: {
      managedRuleGroupStatement: {
        vendorName: 'AWS',
        name: vendorName,
      },
    },
    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: vendorName,
      sampledRequestsEnabled: true,
    },
  };
};

const buildRateLimitRule = (rateLimit: WafRateLimit, priority: number): aws_wafv2.CfnWebACL.RuleProperty => ({
  name: `rate-limit-${rateLimit.name}`,
  priority,
  action: { block: {} },
  statement: {
    rateBasedStatement: {
      limit: rateLimit.limit,
      aggregateKeyType: 'IP',
      scopeDownStatement: rateLimit.uriPathStartsWith
        ? {
            byteMatchStatement: {
              fieldToMatch: { uriPath: {} },
              positionalConstraint: 'STARTS_WITH',
              searchString: rateLimit.uriPathStartsWith,
              textTransformations: [{ priority: 0, type: 'NONE' }],
            },
          }
        : undefined,
    },
  },
  visibilityConfig: {
    cloudWatchMetricsEnabled: true,
    metricName: `rate-limit-${rateLimit.name}`,
    sampledRequestsEnabled: true,
  },
});

// Shared by the REGIONAL and CLOUDFRONT web acls so both evaluate identical rules.
// Rate limits run first (cheap counters), then the managed rule groups.
export const buildWebAclRules = (wafConfig: BootstrapWafQPQConfigSetting): aws_wafv2.CfnWebACL.RuleProperty[] => {
  const rateLimitRules = (wafConfig.rateLimits || []).map((rateLimit, index) => buildRateLimitRule(rateLimit, index));

  const managedRules = (wafConfig.managedRuleGroups || defaultManagedRuleGroups).map((ruleGroup, index) =>
    buildManagedRuleGroupRule(ruleGroup, rateLimitRules.length + index),
  );

  return [...rateLimitRules, ...managedRules];
};

// App-specific bootstrap extras — WAF, api, and the domain certificates. The
// identity plumbing (defineApplication + defineAwsServiceAccountInfo) is
// provided by quidproquo-deploy-awscdk's workspace CDK app; this fragment must
// not declare its own. Prefix/domain/environment arrive via the deploy context
// (from deploy.config.json + qpq go).
import { defineApi, QPQConfig } from 'quidproquo';
import {
  defineBootstrapWaf,
  defineDomainCertificate,
  WafManagedRuleGroup,
} from 'quidproquo-config-aws';
import { QpqAppDeployContext } from 'quidproquo-deploy-awscdk';

export default ({ domain, region }: QpqAppDeployContext): QPQConfig => [
  defineBootstrapWaf({
    rateLimits: [{ name: 'all-traffic', limit: 2000 }],
    managedRuleGroups: [
      WafManagedRuleGroup.common,
      WafManagedRuleGroup.ipReputation,
      WafManagedRuleGroup.knownBadInputs,
      WafManagedRuleGroup.sqli,
    ],
  }),

  defineApi('api', domain),

  defineDomainCertificate(
    domain,
    'us-east-1',
    ['www', 'views', 'docs', 'storybook'],
    {
      includeApex: true,
    }
  ),
  defineDomainCertificate(domain, region, ['api', 'ws.ws', 'qpqadmin.admin']),
];

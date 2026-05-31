import { DomainCertificateQPQConfigSetting, qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';

import { Construct } from 'constructs';

import { DomainCertificateStack } from './DomainCertificateStack';

/**
 * Collapse all `defineDomainCertificate` entries that share the same (region, rootDomain) into
 * a single merged config.
 *
 * The cert ARN is stored in (and looked up from) SSM keyed by region + root domain, so each
 * (region, rootDomain) pair holds exactly one cert. Distinct root domains in the same region are
 * fine and stay separate; what collides is two entries for the *same* apex in the same region —
 * e.g. a CloudFront cert pinned to `us-east-1` and a regional API cert in the deploy region when
 * that region happens to be `us-east-1`. Since a cert is just a bag of valid SANs, the correct
 * reconciliation is one cert covering the union of every name either entry needs: union the
 * subdomains and OR `includeApex`.
 */
const mergeConfigsByRegionAndDomain = (configs: DomainCertificateQPQConfigSetting[]): DomainCertificateQPQConfigSetting[] => {
  const merged = new Map<string, DomainCertificateQPQConfigSetting>();

  for (const config of configs) {
    const key = `${config.region}::${config.rootDomain}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...config, subdomains: [...config.subdomains] });
      continue;
    }

    existing.subdomains = [...new Set([...existing.subdomains, ...config.subdomains])];
    existing.includeApex = existing.includeApex || config.includeApex;
  }

  return [...merged.values()];
};

/**
 * Build one DomainCertificateStack per (region, rootDomain) across all `defineDomainCertificate`
 * entries in the qpqConfig (entries sharing both are merged — see `mergeConfigsByRegionAndDomain`).
 *
 * Normally you don't call this directly — `DomainQpqServiceStack` invokes it internally so
 * that adding `defineDomainCertificate(...)` entries to the bootstrap qpqConfig is all the
 * user has to do. Exposed here as an escape hatch for advanced setups that want to manage the
 * cert stack siblings themselves.
 */
export const createDomainCertificateStacks = (
  scope: Construct,
  qpqConfig: QPQConfig,
  idPrefix: string,
): DomainCertificateStack[] => {
  const configs = mergeConfigsByRegionAndDomain(qpqConfigAwsUtils.getDomainCertificateConfigs(qpqConfig));

  return configs.map((certificateConfig) => {
    const sanitizedRoot = certificateConfig.rootDomain.replace(/\./g, '-');
    const stackId = `${idPrefix}-cert-${sanitizedRoot}-${certificateConfig.region}`;
    return new DomainCertificateStack(scope, stackId, {
      qpqConfig,
      certificateConfig,
    });
  });
};

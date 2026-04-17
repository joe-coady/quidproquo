import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';

import { Construct } from 'constructs';

import { DomainCertificateStack } from './DomainCertificateStack';

/**
 * Build one DomainCertificateStack per `defineDomainCertificate` entry in the qpqConfig.
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
  const configs = qpqConfigAwsUtils.getDomainCertificateConfigs(qpqConfig);

  return configs.map((certificateConfig) => {
    const sanitizedRoot = certificateConfig.rootDomain.replace(/\./g, '-');
    const stackId = `${idPrefix}-cert-${sanitizedRoot}-${certificateConfig.region}`;
    return new DomainCertificateStack(scope, stackId, {
      qpqConfig,
      certificateConfig,
    });
  });
};

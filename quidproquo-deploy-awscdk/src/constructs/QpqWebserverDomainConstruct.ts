import { aws_route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { qpqWebServerUtils, DnsQPQWebServerConfigSetting } from 'quidproquo-webserver';
import { serviceNeedsServiceHostedZone } from '../qpqDeployAwsCdkUtils';

import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';

export interface QpqWebserverDomainConstructProps
  extends QpqConstructProps<DnsQPQWebServerConfigSetting> {}

export const getEnvironmentDomainName = (qpqConfig: QPQConfig, domain: string): string => {
  const environment = qpqCoreUtils.getApplicationEnvironment(qpqConfig);

  if (environment === 'production') {
    return domain;
  }

  return `${environment}.${domain}`;
};

export class QpqWebserverDomainConstruct extends QpqConstruct<DnsQPQWebServerConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqWebserverDomainConstructProps) {
    super(scope, id, props);

    // Only create a shared hosted zone if we need to
    if (!serviceNeedsServiceHostedZone(this.qpqConfig)) {
      return;
    }

    // example.com
    // dev.example.com
    const featureDomain = getEnvironmentDomainName(props.qpqConfig, props.setting.dnsBase);

    // The hosted zone already setup
    const apexHostedZone = aws_route53.HostedZone.fromLookup(this, this.childId('hosted-zone'), {
      domainName: featureDomain,
    });

    // Root domain name for our service
    // search.example.com
    // search.dev.example.com
    const serviceDomainName = qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    // Create the root hosted zone for our service
    const serviceHostedZone = new aws_route53.HostedZone(
      this,
      this.childId('service-hosted-zone'),
      {
        zoneName: serviceDomainName,
      },
    );

    // Add the new NS Records to the root hosted zone so subdomains can be resolved
    new aws_route53.NsRecord(this, this.childId('ns-records'), {
      zone: apexHostedZone,
      recordName: serviceDomainName,
      values: serviceHostedZone.hostedZoneNameServers || [],
    });
  }
}

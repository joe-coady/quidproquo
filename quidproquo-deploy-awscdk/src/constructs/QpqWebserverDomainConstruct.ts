import { aws_route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { DnsQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';

export interface QpqWebserverDomainConstructProps
  extends QpqConstructProps<DnsQPQWebServerConfigSetting> {}

export const getFeatureDomainName = (qpqConfig: QPQConfig, domain: string): string => {
  const feature = qpqCoreUtils.getAppFeature(qpqConfig);

  if (feature === 'production') {
    return domain;
  }

  return `${feature}.${domain}`;
};

export class QpqWebserverDomainConstruct extends QpqConstruct<DnsQPQWebServerConfigSetting> {
  static getUniqueId(setting: DnsQPQWebServerConfigSetting) {
    return setting.dnsBase;
  }

  constructor(scope: Construct, id: string, props: QpqWebserverDomainConstructProps) {
    super(scope, id, props);

    const appName = qpqCoreUtils.getAppName(props.qpqConfig);

    // example.com
    // dev.example.com
    const featureDomain = getFeatureDomainName(props.qpqConfig, props.setting.dnsBase);

    // The hosted zone already setup
    const apexHostedZone = aws_route53.HostedZone.fromLookup(this, this.childId('hosted-zone'), {
      domainName: featureDomain,
    });

    // Root domain name for our service
    // search.example.com
    // search.dev.example.com
    const serviceDomainName = `${appName}.${featureDomain}`;

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
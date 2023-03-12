import { aws_route53 } from 'aws-cdk-lib';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { qpqWebServerUtils, DnsQPQWebServerConfigSetting } from 'quidproquo-webserver';
import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqWebserverDomainConstructProps extends QpqConstructBlockProps {
  dnsConfig: DnsQPQWebServerConfigSetting;
}

export const getEnvironmentDomainName = (qpqConfig: QPQConfig, domain: string): string => {
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);

  if (environment === 'production') {
    return domain;
  }

  return `${environment}.${domain}`;
};

export class QpqWebserverDomainConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverDomainConstructProps) {
    super(scope, id, props);

    // example.com
    // dev.example.com
    const feature = qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig);
    const environmentDomain = getEnvironmentDomainName(props.qpqConfig, props.dnsConfig.dnsBase);
    const featureDomainName = qpqWebServerUtils.getBaseDomainName(props.qpqConfig);

    // The hosted zone already setup
    // development.example.com
    // staging.example.com
    // example.com
    let apexHostedZone: IHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: feature ? featureDomainName : environmentDomain,
    });

    // Only create a shared hosted zone if we need to
    if (!qpqDeployAwsCdkUtils.serviceNeedsServiceHostedZone(props.qpqConfig)) {
      return;
    }

    // Root domain name for our service
    // search.example.com
    // search.dev.example.com
    const serviceDomainName = qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    // Create the root hosted zone for our service
    const serviceHostedZone = new aws_route53.HostedZone(this, 'service-hosted-zone', {
      zoneName: serviceDomainName,
    });

    // Add the new NS Records to the root hosted zone so subdomains can be resolved
    new aws_route53.NsRecord(this, 'service-ns-records', {
      zone: apexHostedZone,
      recordName: serviceDomainName,
      values: serviceHostedZone.hostedZoneNameServers || [],
    });
  }
}

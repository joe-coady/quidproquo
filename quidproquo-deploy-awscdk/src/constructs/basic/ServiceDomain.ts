import { QPQConfig,qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_route53 } from 'aws-cdk-lib';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../base';

export interface ServiceDomainConstructProps extends QpqConstructBlockProps {
  rootDomain: string;
}

export class ServiceDomainConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: ServiceDomainConstructProps) {
    super(scope, id, props);

    // example.com
    // dev.example.com
    const feature = qpqCoreUtils.getApplicationModuleFeature(props.qpqConfig);
    const environment = qpqCoreUtils.getApplicationModuleEnvironment(props.qpqConfig);
    const service = qpqCoreUtils.getApplicationModuleName(props.qpqConfig);
    const domainRoot = qpqWebServerUtils.getDomainRoot(props.rootDomain, environment, feature);

    // The hosted zone already setup
    // development.example.com
    // joecoady.development.example.com
    // staging.example.com
    // example.com
    let apexHostedZone: IHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: domainRoot,
    });

    // Root domain name for our service
    // search.example.com
    // search.development.example.com
    // search.joecoady.development.example.com
    const serviceDomainName = qpqWebServerUtils.constructServiceDomainName(props.rootDomain, environment, service, feature);

    console.log(`ServiceDomain: ${serviceDomainName} on apex - $${domainRoot}`);

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

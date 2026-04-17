import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_apigateway, aws_certificatemanager, aws_route53, aws_route53_targets } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { lookupDomainCertificate } from './DomainCertificateLookup';

export interface SubdomainNameProps extends QpqConstructBlockProps {
  subdomain: string;
  apexDomain: string;
  rootDomain: string;
}

export class SubdomainName extends QpqConstructBlock {
  public readonly domainName: aws_apigateway.DomainName;
  public readonly certificate: aws_certificatemanager.ICertificate;
  public readonly targetARecord: aws_route53.RecordTarget;
  public readonly deployDomain: string;

  constructor(scope: Construct, id: string, props: SubdomainNameProps) {
    super(scope, id, props);

    this.deployDomain = `${props.subdomain}.${props.apexDomain}`;

    // Always look up the root hosted zone (e.g. development.quidproquojs.com), not
    // a per-service sub-zone. The FQDN may include the service name (e.g.
    // ws.shell.development.quidproquojs.com) but the A record lives in the root zone.
    const hostedZoneDomain = qpqWebServerUtils.resolveDomainRoot(props.rootDomain, props.qpqConfig);
    const apexHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: hostedZoneDomain,
    });

    // Regional API Gateway custom domains need a cert in the deploy region.
    // Look it up from SSM, written by the matching DomainCertificateStack during the domain phase.
    const deployRegion = qpqConfigAwsUtils.getApplicationModuleDeployRegion(props.qpqConfig);
    this.certificate = lookupDomainCertificate(this, deployRegion, props.subdomain);

    this.domainName = new aws_apigateway.DomainName(this, 'domain-name', {
      domainName: this.deployDomain,
      certificate: this.certificate,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
      endpointType: aws_apigateway.EndpointType.REGIONAL,
    });

    this.targetARecord = aws_route53.RecordTarget.fromAlias(new aws_route53_targets.ApiGatewayDomain(this.domainName));

    new aws_route53.ARecord(this, 'a-record', {
      zone: apexHostedZone,
      recordName: this.deployDomain,
      target: this.targetARecord,
    });

    // // Export the names so we can import them later
    // new cdk.CfnOutput(this, 'HostedZoneID', {
    //   value: apexHostedZone.hostedZoneId,
    //   exportName: `${apexHostedZone}-hosted-zone-id`,
    // });
  }
}

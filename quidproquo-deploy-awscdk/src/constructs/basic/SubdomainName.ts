import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_route53, aws_certificatemanager, aws_apigateway, aws_route53_targets } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface SubdomainNameProps extends QpqConstructBlockProps {
  subdomain: string;
  apexDomain: string;
}

export class SubdomainName extends QpqConstructBlock {
  public readonly domainName: aws_apigateway.DomainName;
  public readonly certificate: aws_certificatemanager.Certificate;
  public readonly targetARecord: aws_route53.RecordTarget;
  public readonly deployDomain: string;

  constructor(scope: Construct, id: string, props: SubdomainNameProps) {
    super(scope, id, props);

    this.deployDomain = `${props.subdomain}.${props.apexDomain}`;

    const apexHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: props.apexDomain,
    });

    this.certificate = new aws_certificatemanager.Certificate(this, 'certificate', {
      domainName: this.deployDomain,
      certificateName: `${this.deployDomain}-cert`,
      validation: aws_certificatemanager.CertificateValidation.fromDns(apexHostedZone),
    });

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

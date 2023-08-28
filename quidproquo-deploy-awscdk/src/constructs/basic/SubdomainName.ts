import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import {
  aws_route53,
  aws_certificatemanager,
  aws_apigateway,
  aws_route53_targets,
} from 'aws-cdk-lib';

export interface SubdomainNameProps extends QpqConstructBlockProps {
  subdomain: string;
  apexDomain: string;
}

export class SubdomainName extends QpqConstructBlock {
  public readonly domainName: aws_apigateway.DomainName;
  public readonly certificate: aws_certificatemanager.Certificate;

  constructor(scope: Construct, id: string, props: SubdomainNameProps) {
    super(scope, id, props);

    const newDomainName = `${props.subdomain}.${props.apexDomain}`;

    const apexHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: props.apexDomain,
    });

    this.certificate = new aws_certificatemanager.Certificate(this, 'certificate', {
      domainName: newDomainName,
      certificateName: this.qpqResourceName(props.subdomain, 'cert'),
      validation: aws_certificatemanager.CertificateValidation.fromDns(apexHostedZone),
    });

    this.domainName = new aws_apigateway.DomainName(this, 'domain-name', {
      domainName: newDomainName,
      certificate: this.certificate,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
      endpointType: aws_apigateway.EndpointType.REGIONAL,
    });

    new aws_route53.ARecord(this, 'a-record', {
      zone: apexHostedZone,
      recordName: newDomainName,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.ApiGatewayDomain(this.domainName),
      ),
    });
  }
}

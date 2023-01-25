import { QpqConstruct, QpqConstructProps } from '../core/QpqConstruct';
import { Construct } from 'constructs';
import {
  aws_route53,
  aws_certificatemanager,
  aws_apigateway,
  aws_route53_targets,
} from 'aws-cdk-lib';

export interface SubdomainNameProps extends QpqConstructProps<any> {
  subdomain: string;
  apexDomain: string;
}

export class SubdomainName extends QpqConstruct<any> {
  public readonly domainName: aws_apigateway.DomainName;

  constructor(scope: Construct, id: string, props: SubdomainNameProps) {
    super(scope, id, props);

    const newDomainName = `${props.subdomain}.${props.apexDomain}`;

    const apexHostedZone = aws_route53.HostedZone.fromLookup(scope, this.childId('hosted-zone'), {
      domainName: props.apexDomain,
    });

    const certificate = new aws_certificatemanager.Certificate(scope, this.childId('certificate'), {
      domainName: newDomainName,
      certificateName: this.resourceName(props.subdomain),
      validation: aws_certificatemanager.CertificateValidation.fromDns(apexHostedZone),
    });

    this.domainName = new aws_apigateway.DomainName(scope, this.childId('domain-name'), {
      domainName: newDomainName,
      certificate,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
      endpointType: aws_apigateway.EndpointType.REGIONAL,
    });

    new aws_route53.ARecord(scope, this.childId('a-record'), {
      zone: apexHostedZone,
      recordName: newDomainName,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.ApiGatewayDomain(this.domainName),
      ),
    });
  }
}

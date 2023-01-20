import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { QpqConstruct, QpqConstructProps } from '../core/QpqConstruct';
import { Construct } from 'constructs';
import {
  aws_route53,
  aws_certificatemanager,
  aws_apigateway,
  aws_route53_targets,
} from 'aws-cdk-lib';

export interface ServiceSubdomainNameProps extends QpqConstructProps<any> {
  subdomain: string;
}

export class ServiceSubdomainName extends QpqConstruct<any> {
  domainName: aws_apigateway.DomainName;

  constructor(scope: Construct, id: string, props: ServiceSubdomainNameProps) {
    super(scope, id, props);

    const appName = qpqCoreUtils.getAppName(props.qpqConfig);
    const apexDomain = qpqWebServerUtils.getFeatureDomainName(props.qpqConfig);
    const serviceDomainName = `${appName}.${apexDomain}`;
    const serviceSubdomainName = `${props.subdomain}.${serviceDomainName}`;

    const serviceHostedZone = aws_route53.HostedZone.fromLookup(
      scope,
      this.childId('hosted-zone'),
      {
        domainName: serviceDomainName,
      },
    );

    const certificate = new aws_certificatemanager.Certificate(scope, this.childId('certificate'), {
      domainName: serviceSubdomainName,
      certificateName: this.resourceName(`${props.subdomain}-cert`),
      validation: aws_certificatemanager.CertificateValidation.fromDns(serviceHostedZone),
    });

    this.domainName = new aws_apigateway.DomainName(scope, this.childId('custom-domain'), {
      domainName: serviceSubdomainName,
      certificate,
      securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
      endpointType: aws_apigateway.EndpointType.REGIONAL,
    });

    new aws_route53.ARecord(scope, this.childId('a-record'), {
      zone: serviceHostedZone,
      recordName: serviceSubdomainName,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.ApiGatewayDomain(this.domainName),
      ),
    });
  }
}

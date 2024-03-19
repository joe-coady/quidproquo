import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_route53, aws_certificatemanager } from 'aws-cdk-lib';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import * as qpqDeployAwsCdkUtils from '../../utils';

export interface DnsValidatedCertificateProps extends QpqConstructBlockProps {
  onRootDomain: boolean;
  subdomain?: string;
  rootDomain: string;
}

export class DnsValidatedCertificate extends QpqConstructBlock {
  public readonly deployDomain: string;
  public readonly certificate: aws_certificatemanager.Certificate;
  public readonly hostedZone: aws_route53.IHostedZone;

  constructor(scope: Construct, id: string, props: DnsValidatedCertificateProps) {
    super(scope, id, props);

    const apexDomain = qpqWebServerUtils.resolveApexDomainNameFromDomainConfig(
      props.qpqConfig,
      props.rootDomain,
      props.onRootDomain,
    );

    this.deployDomain = props.subdomain ? `${props.subdomain}.${apexDomain}` : apexDomain;

    console.log('this.deployDomain', this.deployDomain);
    console.log('apexDomain', apexDomain);

    this.hostedZone = aws_route53.HostedZone.fromLookup(this, 'MyHostedZone', {
      domainName: apexDomain,
    });

    this.certificate = new aws_certificatemanager.Certificate(this, 'mySiteCert', {
      domainName: this.deployDomain,
      validation: aws_certificatemanager.CertificateValidation.fromDns(this.hostedZone),
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.certificate, props.qpqConfig);
  }
}

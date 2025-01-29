import { qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_certificatemanager, aws_route53 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';

interface DomainConfig {
  rootDomain: string;
  subDomainNames?: string[]; // Optional to support apex domain scenarios
  onRootDomain: boolean;
}

export interface DnsValidatedCertificateProps extends QpqConstructBlockProps {
  domain: DomainConfig;
}

export class DnsValidatedCertificate extends QpqConstructBlock {
  public readonly domainNames: string[];
  public readonly certificate: aws_certificatemanager.Certificate;
  public readonly hostedZone: aws_route53.IHostedZone;

  constructor(scope: Construct, id: string, props: DnsValidatedCertificateProps) {
    super(scope, id, props);

    // Determine the apex domain
    const apexDomain = qpqWebServerUtils.resolveApexDomainNameFromDomainConfig(props.qpqConfig, props.domain.rootDomain, props.domain.onRootDomain);

    // Lookup the hosted zone
    this.hostedZone = aws_route53.HostedZone.fromLookup(this, 'MyHostedZone', {
      domainName: apexDomain,
    });

    // Generate domain names for all subdomains
    this.domainNames = props.domain.subDomainNames?.map((subDomain) => `${subDomain}.${apexDomain}`) || [];

    // Include the apex domain if onRootDomain is true
    if (props.domain.onRootDomain && (!props.domain.subDomainNames || props.domain.subDomainNames.length === 0)) {
      this.domainNames.unshift(apexDomain);
    }

    // Create the certificate
    this.certificate = new aws_certificatemanager.Certificate(this, 'SiteCertificate', {
      // Use the apex domain or the first subdomain as the main domain name
      domainName: this.domainNames[0],
      // Include all other domain names as subject alternative names (SANs), if any
      subjectAlternativeNames: this.domainNames.slice(1),
      validation: aws_certificatemanager.CertificateValidation.fromDns(this.hostedZone),
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.certificate, props.qpqConfig);
  }
}

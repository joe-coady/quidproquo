import { DomainCertificateQPQConfigSetting, qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_certificatemanager, aws_iam, aws_route53, aws_ssm, Stack } from 'aws-cdk-lib';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface DomainCertificateStackProps {
  qpqConfig: QPQConfig;
  certificateConfig: DomainCertificateQPQConfigSetting;
}

const buildDomainNames = (resolvedApex: string, certificateConfig: DomainCertificateQPQConfigSetting): string[] => {
  const subdomainFqdns = certificateConfig.subdomains.map((s) => `${s}.${resolvedApex}`);
  if (certificateConfig.includeApex) {
    return [resolvedApex, ...subdomainFqdns];
  }
  if (subdomainFqdns.length === 0) {
    throw new Error(
      `defineDomainCertificate("${certificateConfig.rootDomain}", "${certificateConfig.region}", ...) ` +
        `must declare at least one subdomain, or set includeApex: true`,
    );
  }
  return subdomainFqdns;
};

export class DomainCertificateStack extends Stack {
  public readonly certificate: aws_certificatemanager.ICertificate;
  public readonly certRegion: string;
  public readonly resolvedApex: string;

  constructor(scope: Construct, id: string, props: DomainCertificateStackProps) {
    const deployAccountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(props.qpqConfig);
    const deployRegion = qpqConfigAwsUtils.getApplicationModuleDeployRegion(props.qpqConfig);
    const certRegion = props.certificateConfig.region;

    super(scope, id, {
      env: {
        region: certRegion,
        account: deployAccountId,
      },
    });

    this.certRegion = certRegion;

    // Apply the same environment + feature prefixing that defineApi / webEntry rootDomain
    // fields go through, so `rootDomain: "example.com"` in a dev env resolves to
    // `development.example.com` — matching what API Gateway / CloudFront end up using.
    this.resolvedApex = qpqWebServerUtils.resolveDomainRoot(props.certificateConfig.rootDomain, props.qpqConfig);

    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'apex-zone', {
      domainName: this.resolvedApex,
    });

    const domainNames = buildDomainNames(this.resolvedApex, props.certificateConfig);

    const certificate = new aws_certificatemanager.Certificate(this, 'cert', {
      domainName: domainNames[0],
      subjectAlternativeNames: domainNames.slice(1),
      validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    });
    this.certificate = certificate;

    const paramName = qpqConfigAwsUtils.getDomainCertificateArnSsmParameterName(certRegion);

    if (certRegion === deployRegion) {
      new aws_ssm.StringParameter(this, 'arn-ssm', {
        parameterName: paramName,
        stringValue: certificate.certificateArn,
      });
    } else {
      const sdkCall = {
        service: 'SSM',
        action: 'putParameter',
        region: deployRegion,
        parameters: {
          Name: paramName,
          Value: certificate.certificateArn,
          Type: 'String',
          Overwrite: true,
        },
        physicalResourceId: PhysicalResourceId.of(paramName),
      };

      new AwsCustomResource(this, 'arn-ssm-xregion', {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        onDelete: {
          service: 'SSM',
          action: 'deleteParameter',
          region: deployRegion,
          parameters: {
            Name: paramName,
          },
        },
        policy: AwsCustomResourcePolicy.fromStatements([
          new aws_iam.PolicyStatement({
            actions: ['ssm:PutParameter', 'ssm:DeleteParameter'],
            resources: [`arn:aws:ssm:${deployRegion}:${deployAccountId}:parameter${paramName}`],
          }),
        ]),
      });
    }
  }
}

import { qpqConfigAwsUtils } from 'quidproquo-config-aws';

import { aws_certificatemanager, aws_ssm } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Service-side helper to import an ACM certificate previously created by a DomainCertificateStack.
 *
 * The domain phase writes the cert ARN into an SSM parameter in the deploy region, keyed by region.
 * This helper reads that parameter as a deploy-time CloudFormation token and imports the cert by ARN.
 * Resolution is deferred to CloudFormation at deploy time (via valueForStringParameter), so synth does
 * not require the domain stack to have been deployed yet.
 *
 * @param scope      CDK construct scope (typically the service stack/construct)
 * @param certRegion 'us-east-1' for CloudFront, deploy region for regional resources
 * @param idSuffix   Unique suffix for the CDK construct id (scope-local)
 */
export const lookupDomainCertificate = (
  scope: Construct,
  certRegion: string,
  idSuffix: string,
): aws_certificatemanager.ICertificate => {
  const paramName = qpqConfigAwsUtils.getDomainCertificateArnSsmParameterName(certRegion);
  const certArn = aws_ssm.StringParameter.valueForStringParameter(scope, paramName);
  return aws_certificatemanager.Certificate.fromCertificateArn(scope, `domain-cert-${idSuffix}`, certArn);
};

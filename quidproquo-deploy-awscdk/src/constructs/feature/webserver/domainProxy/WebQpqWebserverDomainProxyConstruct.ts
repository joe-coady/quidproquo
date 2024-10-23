import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { DomainProxyQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';
import { DomainProxyViewerProtocolPolicy } from 'quidproquo-webserver';

import { aws_cloudfront, aws_cloudfront_origins, aws_route53, aws_route53_targets } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';
import { QpqWebServerCacheConstruct } from '../cache/QpqWebServerCacheConstruct';

export interface WebQpqWebserverDomainProxyConstructProps extends QpqConstructBlockProps {
  domainProxyConfig: DomainProxyQPQWebServerConfigSetting;
}

function convertDomainProxyViewerProtocolPolicyToAwsViewerProtocolPolicy(
  policy: DomainProxyViewerProtocolPolicy,
): aws_cloudfront.ViewerProtocolPolicy {
  switch (policy) {
    case DomainProxyViewerProtocolPolicy.HTTPS_ONLY:
      return aws_cloudfront.ViewerProtocolPolicy.HTTPS_ONLY;
    case DomainProxyViewerProtocolPolicy.REDIRECT_TO_HTTPS:
      return aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;
    case DomainProxyViewerProtocolPolicy.ALLOW_ALL:
      return aws_cloudfront.ViewerProtocolPolicy.ALLOW_ALL;
    default:
      throw new Error('Unknown DomainProxyViewerProtocolPolicy value');
  }
}

export class WebQpqWebserverDomainProxyConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: WebQpqWebserverDomainProxyConstructProps) {
    super(scope, id, props);

    const dnsRecord = new DnsValidatedCertificate(this, 'validcert', {
      domain: {
        onRootDomain: props.domainProxyConfig.domain.onRootDomain,
        subDomainNames: props.domainProxyConfig.domain.subDomainNames,
        rootDomain: props.domainProxyConfig.domain.rootDomain,
      },
      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });

    const cachePolicy = props.domainProxyConfig.cacheSettingsName
      ? QpqWebServerCacheConstruct.fromOtherStack(
          this,
          'cache',
          props.qpqConfig,
          qpqWebServerUtils.getCacheConfigByName(props.domainProxyConfig.cacheSettingsName, props.qpqConfig),
          props.awsAccountId,
        ).cachePolicy
      : aws_cloudfront.CachePolicy.CACHING_DISABLED;

    // Create a CloudFront distribution using the S3 bucket as the origin
    // const distributionOrigin = new aws_cloudfront_origins.S3Origin(originBucket);
    let distributionOrigin = new aws_cloudfront_origins.HttpOrigin(props.domainProxyConfig.httpProxyDomain);

    const viewerProtocolPolicy = convertDomainProxyViewerProtocolPolicyToAwsViewerProtocolPolicy(
      props.domainProxyConfig.domainProxyViewerProtocolPolicy,
    );

    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: distributionOrigin,
        originRequestPolicy: aws_cloudfront.OriginRequestPolicy.ALL_VIEWER,
        allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_ALL,

        cachePolicy: cachePolicy,
        viewerProtocolPolicy,
      },

      domainNames: dnsRecord.domainNames,
      certificate: dnsRecord.certificate,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(distribution, props.qpqConfig);

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameDistributionIdArnFromConfig(props.domainProxyConfig.name, props.qpqConfig),
      distribution.distributionId,
    );

    dnsRecord.domainNames.forEach((domainName) => {
      new aws_route53.ARecord(this, `${domainName}-web-alias`, {
        zone: dnsRecord.hostedZone,
        recordName: domainName,
        target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution)),
      });
    });

    props.domainProxyConfig.ignoreCache.forEach((pathPattern) => {
      distribution.addBehavior(pathPattern, distributionOrigin, {
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy,
      });
    });
  }
}

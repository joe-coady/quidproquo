import {
  aws_cloudfront_origins,
  aws_cloudfront,
  aws_route53,
  aws_route53_targets,
} from 'aws-cdk-lib';

import { DomainProxyQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqWebServerCacheConstruct } from '../cache/QpqWebServerCacheConstruct';

export interface WebQpqWebserverDomainProxyConstructProps extends QpqConstructBlockProps {
  domainProxyConfig: DomainProxyQPQWebServerConfigSetting;
}

export class WebQpqWebserverDomainProxyConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: WebQpqWebserverDomainProxyConstructProps) {
    super(scope, id, props);

    const dnsRecord = new DnsValidatedCertificate(this, 'validcert', {
      onRootDomain: props.domainProxyConfig.domain.onRootDomain,
      subdomain: props.domainProxyConfig.domain.subDomainName,
      rootDomain: props.domainProxyConfig.domain.rootDomain,

      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });

    const cachePolicy = props.domainProxyConfig.cacheSettingsName
      ? QpqWebServerCacheConstruct.fromOtherStack(
          this,
          'cache',
          props.qpqConfig,
          qpqWebServerUtils.getCacheConfigByName(
            props.domainProxyConfig.cacheSettingsName,
            props.qpqConfig,
          ),
          props.awsAccountId,
        ).cachePolicy
      : aws_cloudfront.CachePolicy.CACHING_DISABLED;

    // Create a CloudFront distribution using the S3 bucket as the origin
    // const distributionOrigin = new aws_cloudfront_origins.S3Origin(originBucket);
    let distributionOrigin = new aws_cloudfront_origins.HttpOrigin(
      props.domainProxyConfig.httpProxyDomain,
    );

    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: distributionOrigin,
        originRequestPolicy: aws_cloudfront.OriginRequestPolicy.ALL_VIEWER,

        cachePolicy: cachePolicy,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },

      domainNames: [dnsRecord.deployDomain],
      certificate: dnsRecord.certificate,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(distribution, props.qpqConfig);

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameDistributionIdArnFromConfig(
        props.domainProxyConfig.name,
        props.qpqConfig,
      ),
      distribution.distributionId,
    );

    new aws_route53.ARecord(this, 'web-alias', {
      zone: dnsRecord.hostedZone,
      recordName: dnsRecord.deployDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(distribution),
      ),
    });

    props.domainProxyConfig.ignoreCache.forEach((pathPattern) => {
      distribution.addBehavior(pathPattern, distributionOrigin, {
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      });
    });
  }
}

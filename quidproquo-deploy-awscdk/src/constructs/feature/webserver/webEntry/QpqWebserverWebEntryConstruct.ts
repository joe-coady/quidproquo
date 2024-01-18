import path from 'path';

import {
  aws_lambda,
  aws_s3,
  aws_iam,
  aws_cloudfront_origins,
  aws_cloudfront,
  aws_route53,
  aws_s3_deployment,
  aws_route53_targets,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import {
  WebEntryQPQWebServerConfigSetting,
  qpqWebServerUtils,
  qpqHeaderIsBot,
} from 'quidproquo-webserver';

import { CloudflareDnsRecord } from '../../../basic/CloudflareDnsRecord';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';

import { convertSecurityHeadersFromQpqSecurityHeaders } from './utils/securityHeaders';

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqWebServerCacheConstruct } from '../cache/QpqWebServerCacheConstruct';

export interface QpqWebserverWebEntryConstructProps extends QpqConstructBlockProps {
  webEntryConfig: WebEntryQPQWebServerConfigSetting;
}

export class QpqWebserverWebEntryConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverWebEntryConstructProps) {
    super(scope, id, props);

    // create / reference an s3 bucket
    let originBucket: aws_s3.IBucket | null = null;

    if (!props.webEntryConfig.storageDrive.sourceStorageDrive) {
      originBucket = new aws_s3.Bucket(this, 'bucket', {
        bucketName: this.qpqResourceName(`${props.webEntryConfig.name}`, 'we'),
        // Disable public access to this bucket, Clou+dFront will do that
        publicReadAccess: false,
        blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

        // Do not do this ~ It screws with aws_cloudfront.Distribution
        // websiteIndexDocument: 'index.html',

        // Allow bucket to auto delete upon cdk:Destroy
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      originBucket.addToResourcePolicy(
        new aws_iam.PolicyStatement({
          sid: 'AllowCloudFrontServicePrincipal',
          effect: aws_iam.Effect.ALLOW,
          principals: [new aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
          actions: ['s3:GetObject'],
          resources: [originBucket.arnForObjects('*')],
          conditions: {
            StringLike: {
              'AWS:SourceArn': `arn:aws:cloudfront::${props.awsAccountId}:distribution/*`,
            },
          },
        }),
      );
    } else {
      originBucket = aws_s3.Bucket.fromBucketName(
        this,
        'src-bucket-lookup',
        this.resourceName(props.webEntryConfig.storageDrive.sourceStorageDrive),
      );
    }

    if (props.webEntryConfig.storageDrive.autoUpload) {
      const webEntryBuildPath = qpqWebServerUtils.getWebEntryFullPath(
        props.qpqConfig,
        props.webEntryConfig,
      );
      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(webEntryBuildPath)],
        destinationBucket: originBucket,
      });
    }

    const dnsRecord = new DnsValidatedCertificate(this, 'cert', {
      onRootDomain: props.webEntryConfig.domain.onRootDomain,
      subdomain: props.webEntryConfig.domain.subDomainName,

      awsAccountId: props.awsAccountId,
      qpqConfig: props.qpqConfig,
    });

    if (props.webEntryConfig.cloudflareApiKeySecretName) {
      new CloudflareDnsRecord(this, 'certDns', {
        awsAccountId: props.awsAccountId,
        buildPath: qpqWebServerUtils.getWebEntrySeoFullPath(props.qpqConfig, props.webEntryConfig),
        qpqConfig: props.qpqConfig,

        // certificateArn: dnsRecord.certificate.certificateArn,
        certificateDomain: dnsRecord.deployDomain,
        dnsEntries: {},
        apiSecretName: props.webEntryConfig.cloudflareApiKeySecretName,
      });
    }

    const originAccessControl = new aws_cloudfront.CfnOriginAccessControl(
      this,
      `oac-${props.webEntryConfig.name}${props.webEntryConfig.domain.subDomainName}`,
      {
        originAccessControlConfig: {
          name: this.resourceName(props.webEntryConfig.name),
          originAccessControlOriginType: 's3',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',

          // the properties below are optional
          description: `access to s3 bucket ${originBucket.bucketName}`,
        },
      },
    );

    const cachePolicy = props.webEntryConfig.cacheSettingsName
      ? QpqWebServerCacheConstruct.fromOtherStack(
          this,
          'cache',
          props.qpqConfig,
          qpqWebServerUtils.getCacheConfigByName(
            props.webEntryConfig.cacheSettingsName,
            props.qpqConfig,
          ),
          props.awsAccountId,
        ).cachePolicy
      : aws_cloudfront.CachePolicy.CACHING_DISABLED;

    const responseHeaderPolicy =
      props.webEntryConfig.securityHeaders &&
      new aws_cloudfront.ResponseHeadersPolicy(this, `dist-rhp`, {
        responseHeadersPolicyName: this.resourceName(props.webEntryConfig.name),
        // customHeadersBehavior: {
        //   customHeaders: [
        //     {
        //       header: 'Cache-Control',
        //       value: `max-age=${props.webEntryConfig.cache.maxTTLInSeconds}${
        //         props.webEntryConfig.cache.mustRevalidate ? ', must-revalidate' : ''
        //       }`,
        //       override: true,
        //     },
        //   ],
        // },
        securityHeadersBehavior: convertSecurityHeadersFromQpqSecurityHeaders(
          qpqWebServerUtils.getBaseDomainName(props.qpqConfig),
          props.webEntryConfig.securityHeaders,
        ),
      });

    // Create a CloudFront distribution using the S3 bucket as the origin
    const distributionOrigin = new aws_cloudfront_origins.S3Origin(originBucket);
    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: distributionOrigin,
        originRequestPolicy: aws_cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,

        cachePolicy: cachePolicy,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: props.webEntryConfig.compressFiles,
        responseHeadersPolicy: responseHeaderPolicy,
      },

      domainNames: [dnsRecord.deployDomain],
      certificate: dnsRecord.certificate,
      defaultRootObject: props.webEntryConfig.indexRoot,

      // redirect errors to root page and let spa sort it
      errorResponses: [404, 403].map((code) => ({
        httpStatus: code,
        responseHttpStatus: 200,
        responsePagePath: '/',
      })),
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(distribution, props.qpqConfig);

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameDistributionIdArnFromConfig(
        props.webEntryConfig.name,
        props.qpqConfig,
      ),
      distribution.distributionId,
    );

    // TODO: Fix this when they add l2 support for origin access control settings

    // Currently distribution don't have support for origin access control settings
    // So we manually add it.
    const cfnDistribution = distribution.node.defaultChild as aws_cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.OriginAccessControlId',
      originAccessControl.getAtt('Id'),
    );

    // We need to null out the OriginAccessIdentity that it creates by default
    // as the distribution cant work with both.
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity',
      '',
    );

    new aws_route53.ARecord(this, 'web-alias', {
      zone: dnsRecord.hostedZone,
      recordName: dnsRecord.deployDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(distribution),
      ),
    });

    if (props.webEntryConfig.cloudflareApiKeySecretName) {
      new CloudflareDnsRecord(this, 'cloudflare', {
        awsAccountId: props.awsAccountId,
        buildPath: qpqWebServerUtils.getWebEntrySeoFullPath(props.qpqConfig, props.webEntryConfig),
        qpqConfig: props.qpqConfig,

        // We cant add thease here, we need the certificate to validate
        // before the distibution is finsished creating
        // certificateArn: dnsRecord.certificate.certificateArn,
        // certificateDomain: dnsRecord.deployDomain,
        dnsEntries: {
          [dnsRecord.deployDomain]: {
            value: distribution.distributionDomainName,
            proxied: true,
            type: 'CNAME',
          },
        },
        apiSecretName: props.webEntryConfig.cloudflareApiKeySecretName,
      });
    }

    // All seos that are for this web entry
    const seos = qpqWebServerUtils
      .getAllSeo(props.qpqConfig)
      .filter((seo) => !seo.webEntry || seo.webEntry === props.webEntryConfig.name);

    // if we have some ~ Build the edge lambdas and deploy
    if (seos.length > 0) {
      const seoEntryBuildPath = qpqWebServerUtils.getWebEntrySeoFullPath(
        props.qpqConfig,
        props.webEntryConfig,
      );

      const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(this, `SEO-VR`, {
        functionName: this.qpqResourceName(props.webEntryConfig.name, 'SEO-VR'),
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,

        code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventViewerRequest')),
        handler: 'index.executeEventViewerRequest',
      });

      const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(this, `SEO-OR`, {
        functionName: this.qpqResourceName(props.webEntryConfig.name, 'SEO-OR'),
        timeout: cdk.Duration.seconds(30),
        runtime: aws_lambda.Runtime.NODEJS_18_X,

        memorySize: 1024,

        code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventOriginRequest')),
        handler: 'index.executeEventOriginRequest',
      });

      // let OR edge lambdas execute service functions
      edgeFunctionOR.addToRolePolicy(
        new aws_iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
        }),
      );

      // let VR edge lambdas access the resources they need
      const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
        this,
        'grantable',
        this.qpqConfig,
        props.awsAccountId,
      );

      grantables.forEach((g) => {
        g.grantAll(edgeFunctionVR);
        g.grantAll(edgeFunctionOR);
      });

      for (var seo of seos) {
        // Deprecated edge lambdas are not added as a behavior, but they are still built
        if (seo.deprecated) {
          continue;
        }

        // TODO: Find a better solution for this.
        // Removed this because aws limits for the number of AWS CloudFront Cache Policies in your account
        const seoCachePolicy = seo.cacheSettingsName
          ? QpqWebServerCacheConstruct.fromOtherStack(
              this,
              `seo-cache-${seo.uniqueKey}`,
              props.qpqConfig,
              qpqWebServerUtils.getCacheConfigByName(seo.cacheSettingsName, props.qpqConfig),
              props.awsAccountId,
            ).cachePolicy
          : aws_cloudfront.CachePolicy.CACHING_DISABLED;

        const wildcardPath = seo.path.replaceAll(/{(.+?)}/g, '*');
        distribution.addBehavior(wildcardPath, distributionOrigin, {
          cachePolicy: seoCachePolicy,
          viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: props.webEntryConfig.compressFiles,
          edgeLambdas: [
            {
              functionVersion: edgeFunctionVR.currentVersion,
              eventType: aws_cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            },
            {
              functionVersion: edgeFunctionOR.currentVersion,
              eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            },
          ],
        });
      }
    }

    // Removed this because aws limits for the number of AWS CloudFront Cache Policies in your account
    // const ignoreCacheResponseHeaderPolicy = new aws_cloudfront.ResponseHeadersPolicy(
    //   this,
    //   `dist-rhp-ignore`,
    //   {
    //     responseHeadersPolicyName: this.qpqResourceName(props.webEntryConfig.name, 'ignore'),
    //     customHeadersBehavior: {
    //       customHeaders: [
    //         {
    //           header: 'Cache-Control',
    //           value: `max-age=300, must-revalidate`,
    //           override: true,
    //         },
    //       ],
    //     },
    //     securityHeadersBehavior: convertSecurityHeadersFromQpqSecurityHeaders(
    //       qpqWebServerUtils.getBaseDomainName(props.qpqConfig),
    //       props.webEntryConfig.securityHeaders,
    //     ),
    //   },
    // );

    props.webEntryConfig.ignoreCache.forEach((pathPattern) => {
      distribution.addBehavior(pathPattern, distributionOrigin, {
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: props.webEntryConfig.compressFiles,
        // responseHeadersPolicy: ignoreCacheResponseHeaderPolicy,
      });
    });
  }
}

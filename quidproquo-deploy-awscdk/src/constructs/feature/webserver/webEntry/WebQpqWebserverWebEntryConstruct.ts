import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { qpqWebServerUtils, WebEntryQPQWebServerConfigSetting } from 'quidproquo-webserver';

import {
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_iam,
  aws_lambda,
  aws_route53,
  aws_route53_targets,
  aws_s3,
  aws_s3_deployment,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { qpqAwsCdkPathUtils } from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';
import { QpqWebServerCacheConstruct } from '../cache/QpqWebServerCacheConstruct';
import { convertSecurityHeadersFromQpqSecurityHeaders } from './utils/securityHeaders';

export interface WebQpqWebserverWebEntryConstructProps extends QpqConstructBlockProps {
  webEntryConfig: WebEntryQPQWebServerConfigSetting;
}

export class WebQpqWebserverWebEntryConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: WebQpqWebserverWebEntryConstructProps) {
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

      const awsAccountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(props.qpqConfig);

      originBucket.addToResourcePolicy(
        new aws_iam.PolicyStatement({
          sid: 'AllowCloudFrontServicePrincipal',
          effect: aws_iam.Effect.ALLOW,
          principals: [new aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
          actions: ['s3:GetObject'],
          resources: [originBucket.arnForObjects('*')],
          conditions: {
            StringLike: {
              'AWS:SourceArn': `arn:aws:cloudfront::${awsAccountId}:distribution/*`,
            },
          },
        }),
      );
    } else {
      originBucket = aws_s3.Bucket.fromBucketName(this, 'src-bucket-lookup', this.resourceName(props.webEntryConfig.storageDrive.sourceStorageDrive));
    }

    if (props.webEntryConfig.storageDrive.autoUpload) {
      const webEntryBuildPath = qpqAwsCdkPathUtils.getWebEntryFullPath(props.qpqConfig, props.webEntryConfig);
      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(webEntryBuildPath)],
        destinationBucket: originBucket,
      });
    }

    const dnsRecord = new DnsValidatedCertificate(this, 'validcert', {
      domain: {
        onRootDomain: props.webEntryConfig.domain.onRootDomain,
        subDomainNames: props.webEntryConfig.domain.subDomainName ? [props.webEntryConfig.domain.subDomainName] : undefined,
        rootDomain: props.webEntryConfig.domain.rootDomain,
      },

      qpqConfig: props.qpqConfig,
    });

    const cachePolicy = props.webEntryConfig.cacheSettingsName
      ? QpqWebServerCacheConstruct.fromOtherStack(
          this,
          'cache',
          props.qpqConfig,
          qpqWebServerUtils.getCacheConfigByName(props.webEntryConfig.cacheSettingsName, props.qpqConfig),
        ).cachePolicy
      : aws_cloudfront.CachePolicy.CACHING_DISABLED;

    // NOTE: This is used in the ignore cache down the bottom.
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
        securityHeadersBehavior: convertSecurityHeadersFromQpqSecurityHeaders(props.qpqConfig, props.webEntryConfig.securityHeaders),

        // TODO: Expose this to config.
        corsBehavior: {
          accessControlAllowCredentials: false,
          accessControlAllowHeaders: ['Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method'],
          accessControlAllowMethods: ['GET', 'HEAD', 'OPTIONS'],
          accessControlAllowOrigins: ['*'],
          accessControlExposeHeaders: ['*'],
          accessControlMaxAge: cdk.Duration.seconds(600),
          originOverride: true,
        },
      });

    // Create a CloudFront distribution using the S3 bucket as the origin
    // const distributionOrigin = new aws_cloudfront_origins.S3Origin(originBucket);
    const distributionOrigin = aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(originBucket);
    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: distributionOrigin,
        originRequestPolicy: aws_cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,

        cachePolicy: cachePolicy,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: props.webEntryConfig.compressFiles,
        responseHeadersPolicy: responseHeaderPolicy,
      },

      domainNames: dnsRecord.domainNames,
      certificate: dnsRecord.certificate,
      defaultRootObject: props.webEntryConfig.indexRoot,

      // redirect errors to root page and let spa sort it
      errorResponses: [404, 403].map((code) => ({
        httpStatus: code,
        responseHttpStatus: 200,
        responsePagePath: '/',
        ttl: cdk.Duration.seconds(0),
      })),
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(distribution, props.qpqConfig);

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameDistributionIdArnFromConfig(props.webEntryConfig.name, props.qpqConfig),
      distribution.distributionId,
    );

    new aws_route53.ARecord(this, `web-alias`, {
      zone: dnsRecord.hostedZone,
      recordName: dnsRecord.domainNames[0],
      target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.CloudFrontTarget(distribution)),
    });

    props.webEntryConfig.ignoreCache.forEach((pathPattern) => {
      distribution.addBehavior(pathPattern, distributionOrigin, {
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: props.webEntryConfig.compressFiles,
        responseHeadersPolicy: responseHeaderPolicy,
      });
    });

    // All seos that are for this web entry
    const seos = qpqWebServerUtils.getAllSeo(props.qpqConfig).filter((seo) => !seo.webEntry || seo.webEntry === props.webEntryConfig.name);

    // if we have some ~ Build the edge lambdas and deploy
    if (seos.length > 0) {
      const seoEntryBuildPath = qpqAwsCdkPathUtils.getApiBuildPathFullPath(props.qpqConfig);

      const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(this, `SEO-VR`, {
        functionName: this.qpqResourceName(props.webEntryConfig.name, 'SEO-VR'),
        timeout: cdk.Duration.seconds(5),
        runtime: aws_lambda.Runtime.NODEJS_18_X,

        code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'cloudFrontRequestEvent_viewerRequest')),
        handler: 'index.cloudFrontRequestEvent_viewerRequest',
      });

      const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(this, `SEO-OR`, {
        functionName: this.qpqResourceName(props.webEntryConfig.name, 'SEO-OR'),
        timeout: cdk.Duration.seconds(30),
        runtime: aws_lambda.Runtime.NODEJS_18_X,

        memorySize: 1024,

        code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'cloudFrontRequestEvent_originRequest')),
        handler: 'index.cloudFrontRequestEvent_originRequest',

        role: this.getServiceRole(),
      });

      for (let seo of seos) {
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
          responseHeadersPolicy: responseHeaderPolicy,
        });
      }
    }
  }
}

import path from 'path';

import {
  aws_lambda,
  aws_s3,
  aws_iam,
  aws_cloudfront_origins,
  aws_cloudfront,
  aws_certificatemanager,
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
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqWebserverWebEntryConstructProps extends QpqConstructBlockProps {
  webEntryConfig: WebEntryQPQWebServerConfigSetting;
}

export class QpqWebserverWebEntryConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverWebEntryConstructProps) {
    super(scope, id, props);

    const apexDomain = props.webEntryConfig.domain.onRootDomain
      ? qpqWebServerUtils.getBaseDomainName(props.qpqConfig)
      : qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    const deployDomain = props.webEntryConfig.domain.subDomainName
      ? `${props.webEntryConfig.domain.subDomainName}.${apexDomain}`
      : apexDomain;

    // create / reference an s3 bucket
    let originBucket = null;

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

    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'MyHostedZone', {
      domainName: apexDomain,
    });

    const myCertificate = new aws_certificatemanager.Certificate(this, 'mySiteCert', {
      domainName: deployDomain,
      validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

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

    const cachePolicy = new aws_cloudfront.CachePolicy(this, `dist-cp`, {
      cachePolicyName: this.resourceName(props.webEntryConfig.name),
      defaultTtl: cdk.Duration.seconds(props.webEntryConfig.cache.defaultTTLInSeconds),
      minTtl: cdk.Duration.seconds(props.webEntryConfig.cache.minTTLInSeconds),
      maxTtl: cdk.Duration.seconds(props.webEntryConfig.cache.maxTTLInSeconds),

      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Create a CloudFront distribution using the S3 bucket as the origin
    const distributionOrigin = new aws_cloudfront_origins.S3Origin(originBucket);
    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: distributionOrigin,
        cachePolicy: cachePolicy,
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [deployDomain],
      certificate: myCertificate,
      defaultRootObject: props.webEntryConfig.indexRoot,

      // redirect errors to root page and let spa sort it
      errorResponses: [404, 403].map((code) => ({
        httpStatus: code,
        responseHttpStatus: 200,
        responsePagePath: '/',
      })),
    });

    props.webEntryConfig.ignoreCache.forEach((pathPattern) => {
      distribution.addBehavior(pathPattern, distributionOrigin, {
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_DISABLED,
      });
    });

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
      zone: hostedZone,
      recordName: deployDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(distribution),
      ),
    });

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

      const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(
        this,
        `SEO-${props.webEntryConfig.name}-VR`,
        {
          functionName: this.resourceName(`SEO-VR-${props.webEntryConfig.name}`),
          timeout: cdk.Duration.seconds(5),
          runtime: aws_lambda.Runtime.NODEJS_18_X,

          code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventViewerRequest')),
          handler: 'index.executeEventViewerRequest',
        },
      );

      const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(
        this,
        `SEO-${props.webEntryConfig.name}-OR`,
        {
          functionName: this.resourceName(`SEO-OR-${props.webEntryConfig.name}`),
          timeout: cdk.Duration.seconds(30),
          runtime: aws_lambda.Runtime.NODEJS_18_X,

          memorySize: 1024,

          code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventOriginRequest')),
          handler: 'index.executeEventOriginRequest',
        },
      );

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

        const seoCachePolicy = new aws_cloudfront.CachePolicy(this, `seo-cp-${seo.uniqueKey}`, {
          cachePolicyName: this.resourceName(`${props.webEntryConfig.name}-${seo.uniqueKey}`),
          headerBehavior: aws_cloudfront.CacheHeaderBehavior.allowList(
            qpqHeaderIsBot,
            ...seo.cache.headers,
          ),
          defaultTtl: cdk.Duration.seconds(seo.cache.defaultTTLInSeconds),
          minTtl: cdk.Duration.seconds(seo.cache.minTTLInSeconds),
          maxTtl: cdk.Duration.seconds(seo.cache.maxTTLInSeconds),
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        });

        const wildcardPath = seo.path.replaceAll(/{(.+?)}/g, '*');
        distribution.addBehavior(wildcardPath, distributionOrigin, {
          cachePolicy: seoCachePolicy,
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
  }
}

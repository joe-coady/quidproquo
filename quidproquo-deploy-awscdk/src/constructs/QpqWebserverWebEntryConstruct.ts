import path from 'path';

import {
  aws_lambda,
  aws_s3,
  aws_iam,
  aws_cloudfront,
  aws_certificatemanager,
  aws_route53,
  aws_s3_deployment,
  aws_route53_targets,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import { WebEntryQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../qpqDeployAwsCdkUtils';

export interface QpqWebserverWebEntryConstructProps
  extends QpqConstructProps<WebEntryQPQWebServerConfigSetting> {}

// const originBucket = new aws_s3.Bucket(this, 'websiteBucket', {
//   bucketName: this.qpqResourceName(`${props.setting.name}-web-files`),
//   // websiteIndexDocument: 'index.html',

//   removalPolicy: cdk.RemovalPolicy.DESTROY,
//   autoDeleteObjects: true,
// });

// const hostedZone = aws_route53.HostedZone.fromLookup(this, 'MyHostedZone', {
//   domainName: apexDomain,
// });

// const myCertificate = new aws_certificatemanager.Certificate(this, 'mySiteCert', {
//   domainName: deployDomain,
//   validation: aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
// });

// const originAccessIdentity = new aws_cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
// originBucket.grantRead(originAccessIdentity);

// // Create a CloudFront distribution using the S3 bucket as the origin
// const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
//   defaultBehavior: {
//     origin: new aws_cloudfront_origins.S3Origin(originBucket, { originAccessIdentity }),
//   },
//   domainNames: [deployDomain],
//   certificate: myCertificate,
// });

// new aws_route53.ARecord(this, 'web-alias', {
//   zone: hostedZone,
//   recordName: deployDomain,
//   target: aws_route53.RecordTarget.fromAlias(
//     new aws_route53_targets.CloudFrontTarget(distribution),
//   ),
// });

export class QpqWebserverWebEntryConstruct extends QpqConstruct<WebEntryQPQWebServerConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqWebserverWebEntryConstructProps) {
    super(scope, id, props);

    const apexDomain = this.setting.domain.onRootDomain
      ? qpqWebServerUtils.getBaseDomainName(props.qpqConfig)
      : qpqWebServerUtils.getServiceDomainName(props.qpqConfig);

    const deployDomain = this.setting.domain.subDomainName
      ? `${this.setting.domain.subDomainName}.${apexDomain}`
      : apexDomain;

    // create / reference an s3 bucket
    const staticWebFilesBucket = !this.setting.storageDrive.sourceStorageDrive
      ? new aws_s3.Bucket(this, 'bucket', {
          bucketName: this.qpqResourceName(`${props.setting.name}-web-files`),
          // Disable public access to this bucket, CloudFront will do that
          publicReadAccess: false,
          blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

          // Default website file
          websiteIndexDocument: 'index.html',

          // Allow bucket to auto delete upon cdk:Destroy
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        })
      : aws_s3.Bucket.fromBucketName(
          this,
          'src-bucket-lookup',
          this.resourceName(this.setting.storageDrive.sourceStorageDrive),
        );

    // Create OriginAccessIdentity for the bucket.
    const websiteOAI = new aws_cloudfront.OriginAccessIdentity(this, 'website-oac');
    staticWebFilesBucket.grantRead(websiteOAI);

    // When you create a new Amazon S3 bucket, the AWS Cloud Development Kit (CDK) automatically creates
    // the necessary policies and permissions to allow the bucket to be used as an origin for a CloudFront
    // distribution. However, when you reference an existing bucket, the CDK does not have the information
    // it needs to automatically create the necessary policies and permissions, so you need to manually add them.
    // staticWebFilesBucket.addToResourcePolicy(
    //   new aws_iam.PolicyStatement({
    //     actions: ['s3:GetObject'],
    //     resources: [staticWebFilesBucket.bucketArn + '/*'],
    //     principals: [
    //       new aws_iam.CanonicalUserPrincipal(
    //         websiteOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
    //       ),
    //     ],
    //   }),
    // );

    // Grab the hosted zone we want to add
    const serviceHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: apexDomain,
    });

    // Create a certificate for the distribution - Seems to a bug where Route 53 records not cleaned up
    // after removing the DNS Validated certificate see: https://github.com/aws/aws-cdk/issues/3333
    // `switch over to using the Certificate with the new built-in (CloudFormation-based) DNS validation`
    const validationCertificate =
      aws_certificatemanager.CertificateValidation.fromDns(serviceHostedZone);
    const certificate = new aws_certificatemanager.DnsValidatedCertificate(this, 'viewer-cert', {
      hostedZone: serviceHostedZone,
      domainName: deployDomain,
      region: 'us-east-1', // AWS certificates can only exist in the us-east-1 region
      validation: validationCertificate,
    });
    const viewerCertificate = aws_cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: [deployDomain],
    });

    if (this.setting.storageDrive.autoUpload) {
      const webEntryBuildPath = qpqWebServerUtils.getWebEntryFullPath(
        props.qpqConfig,
        props.setting,
      );
      new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
        sources: [aws_s3_deployment.Source.asset(webEntryBuildPath)],
        destinationBucket: staticWebFilesBucket,
      });
    }

    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
    );

    const cloudFrontBehaviors = qpqWebServerUtils.getAllSeo(props.qpqConfig).map((seo) => {
      const seoEntryBuildPath = qpqWebServerUtils.getWebEntrySeoFullPath(
        props.qpqConfig,
        props.setting,
      );

      const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(
        this,
        `SEO-${seo.uniqueKey}-VR`,
        {
          functionName: this.resourceName(`SEO-VR-${seo.uniqueKey}`),
          timeout: cdk.Duration.seconds(5),
          runtime: aws_lambda.Runtime.NODEJS_16_X,

          code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventViewerRequest')),
          handler: 'index.executeEventViewerRequest',
        },
      );

      const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(
        this,
        `SEO-${seo.uniqueKey}-OR`,
        {
          functionName: this.resourceName(`SEO-OR-${seo.uniqueKey}`),
          timeout: cdk.Duration.seconds(30),
          runtime: aws_lambda.Runtime.NODEJS_16_X,

          memorySize: 1024,

          code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventOriginRequest')),
          handler: 'index.executeEventOriginRequest',
        },
      );

      grantables.forEach((g) => {
        g.grantAll(edgeFunctionVR);
        g.grantAll(edgeFunctionOR);
      });

      const wildcardPath = seo.path.replaceAll(/{(.+?)}/g, '*');

      return {
        pathPattern: wildcardPath,

        // Update this to 24 hours
        maxTtl: cdk.Duration.seconds(0),
        minTtl: cdk.Duration.seconds(0),
        defaultTtl: cdk.Duration.seconds(0),

        lambdaFunctionAssociations: [
          {
            includeBody: true,
            eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            lambdaFunction: edgeFunctionOR.currentVersion,
          },
          {
            includeBody: false,
            eventType: aws_cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            lambdaFunction: edgeFunctionVR.currentVersion,
          },
        ],
      };
    });

    // Create a cloud front distribution
    // TODO: use aws_cloudfront.Distribution
    // TODO: Somehow expose query strings: Note ~
    // (Lambda@Edge only) To access the query string in an origin request or origin response function,
    // your cache policy or origin request policy must be set to All for Query strings.
    const distribution = new aws_cloudfront.CloudFrontWebDistribution(this, 'cf-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: staticWebFilesBucket,
            originAccessIdentity: websiteOAI,
          },
          behaviors: [
            ...cloudFrontBehaviors,
            {
              isDefaultBehavior: true,

              // Update this to 24 hours
              maxTtl: cdk.Duration.seconds(0),
              minTtl: cdk.Duration.seconds(0),
              defaultTtl: cdk.Duration.seconds(0),
            },
          ],
        },
      ],
      viewerCertificate: viewerCertificate,
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/',
        },
      ],
    });

    // Create a cdn link
    new aws_route53.ARecord(this, 'web-alias', {
      zone: serviceHostedZone,
      recordName: deployDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(distribution),
      ),
    });
  }
}

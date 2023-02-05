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

import { WebEntryQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../qpqDeployAwsCdkUtils';

export interface QpqWebserverWebEntryConstructProps
  extends QpqConstructProps<WebEntryQPQWebServerConfigSetting> {}

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
    let originBucket = null;

    if (!this.setting.storageDrive.sourceStorageDrive) {
      originBucket = new aws_s3.Bucket(this, 'bucket', {
        bucketName: this.qpqResourceName(`${props.setting.name}-web-entry`),
        // Disable public access to this bucket, CloudFront will do that
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
              'AWS:SourceArn': 'arn:aws:cloudfront::868688464629:distribution/*',
            },
          },
        }),
      );
    } else {
      originBucket = aws_s3.Bucket.fromBucketName(
        this,
        'src-bucket-lookup',
        this.resourceName(this.setting.storageDrive.sourceStorageDrive),
      );
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
      `oac-${props.setting.name}${props.setting.domain.subDomainName}`,
      {
        originAccessControlConfig: {
          name: props.setting.name,
          originAccessControlOriginType: 's3',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',

          // the properties below are optional
          description: `access to s3 bucket ${this.resourceName(originBucket.bucketName)}`,
        },
      },
    );

    // Create a CloudFront distribution using the S3 bucket as the origin
    const distribution = new aws_cloudfront.Distribution(this, 'MyDistribution', {
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(originBucket),
      },
      domainNames: [deployDomain],
      certificate: myCertificate,
    });

    // const cfnDistribution = distribution.node.defaultChild as aws_cloudfront.CfnDistribution;
    // const distributionConfig =
    //   cfnDistribution.distributionConfig as aws_cloudfront.CfnDistribution.DistributionConfigProperty;
    // const origins = distributionConfig.origins as aws_cloudfront.CfnDistribution.OriginProperty[];
    // origins[0].originAccessControlId = originAccessControl.attrId;

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

    // // Create OriginAccessIdentity for the bucket.
    // const websiteOAI = new aws_cloudfront.OriginAccessIdentity(this, 'website-oac');
    // staticWebFilesBucket.grantRead(websiteOAI);

    // // Grab the hosted zone we want to add
    // const serviceHostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
    //   domainName: apexDomain,
    // });

    // // Create a certificate for the distribution - Seems to a bug where Route 53 records not cleaned up
    // // after removing the DNS Validated certificate see: https://github.com/aws/aws-cdk/issues/3333
    // // `switch over to using the Certificate with the new built-in (CloudFormation-based) DNS validation`
    // const validationCertificate =
    //   aws_certificatemanager.CertificateValidation.fromDns(serviceHostedZone);
    // const certificate = new aws_certificatemanager.DnsValidatedCertificate(this, 'viewer-cert', {
    //   hostedZone: serviceHostedZone,
    //   domainName: deployDomain,
    //   region: 'us-east-1', // AWS certificates can only exist in the us-east-1 region
    //   validation: validationCertificate,
    // });
    // const viewerCertificate = aws_cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
    //   aliases: [deployDomain],
    // });

    // if (this.setting.storageDrive.autoUpload) {
    //   const webEntryBuildPath = qpqWebServerUtils.getWebEntryFullPath(
    //     props.qpqConfig,
    //     props.setting,
    //   );
    //   new aws_s3_deployment.BucketDeployment(this, 'bucket-deploy', {
    //     sources: [aws_s3_deployment.Source.asset(webEntryBuildPath)],
    //     destinationBucket: staticWebFilesBucket,
    //   });
    // }

    // const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
    //   this,
    //   'grantable',
    //   this.qpqConfig,
    // );

    // const cloudFrontBehaviors = qpqWebServerUtils.getAllSeo(props.qpqConfig).map((seo) => {
    //   const seoEntryBuildPath = qpqWebServerUtils.getWebEntrySeoFullPath(
    //     props.qpqConfig,
    //     props.setting,
    //   );

    //   const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(
    //     this,
    //     `SEO-${seo.uniqueKey}-VR`,
    //     {
    //       functionName: this.resourceName(`SEO-VR-${seo.uniqueKey}`),
    //       timeout: cdk.Duration.seconds(5),
    //       runtime: aws_lambda.Runtime.NODEJS_16_X,

    //       code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventViewerRequest')),
    //       handler: 'index.executeEventViewerRequest',
    //     },
    //   );

    //   const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(
    //     this,
    //     `SEO-${seo.uniqueKey}-OR`,
    //     {
    //       functionName: this.resourceName(`SEO-OR-${seo.uniqueKey}`),
    //       timeout: cdk.Duration.seconds(30),
    //       runtime: aws_lambda.Runtime.NODEJS_16_X,

    //       memorySize: 1024,

    //       code: aws_lambda.Code.fromAsset(path.join(seoEntryBuildPath, 'lambdaEventOriginRequest')),
    //       handler: 'index.executeEventOriginRequest',
    //     },
    //   );

    //   grantables.forEach((g) => {
    //     g.grantAll(edgeFunctionVR);
    //     g.grantAll(edgeFunctionOR);
    //   });

    //   const wildcardPath = seo.path.replaceAll(/{(.+?)}/g, '*');

    //   return {
    //     pathPattern: wildcardPath,

    //     // Update this to 24 hours
    //     maxTtl: cdk.Duration.seconds(0),
    //     minTtl: cdk.Duration.seconds(0),
    //     defaultTtl: cdk.Duration.seconds(0),

    //     lambdaFunctionAssociations: [
    //       {
    //         includeBody: true,
    //         eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
    //         lambdaFunction: edgeFunctionOR.currentVersion,
    //       },
    //       {
    //         includeBody: false,
    //         eventType: aws_cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
    //         lambdaFunction: edgeFunctionVR.currentVersion,
    //       },
    //     ],
    //   };
    // });

    // // Create a cloud front distribution
    // // TODO: use aws_cloudfront.Distribution
    // // TODO: Somehow expose query strings: Note ~
    // // (Lambda@Edge only) To access the query string in an origin request or origin response function,
    // // your cache policy or origin request policy must be set to All for Query strings.
    // const distribution = new aws_cloudfront.CloudFrontWebDistribution(this, 'cf-distribution', {
    //   originConfigs: [
    //     {
    //       s3OriginSource: {
    //         s3BucketSource: staticWebFilesBucket,
    //         originAccessIdentity: websiteOAI,
    //       },
    //       behaviors: [
    //         ...cloudFrontBehaviors,
    //         {
    //           isDefaultBehavior: true,

    //           // Update this to 24 hours
    //           maxTtl: cdk.Duration.seconds(0),
    //           minTtl: cdk.Duration.seconds(0),
    //           defaultTtl: cdk.Duration.seconds(0),
    //         },
    //       ],
    //     },
    //   ],
    //   viewerCertificate: viewerCertificate,
    //   errorConfigurations: [
    //     {
    //       errorCode: 404,
    //       responseCode: 200,
    //       responsePagePath: '/',
    //     },
    //   ],
    // });

    // // Create a cdn link
    // new aws_route53.ARecord(this, 'web-alias', {
    //   zone: serviceHostedZone,
    //   recordName: deployDomain,
    //   target: aws_route53.RecordTarget.fromAlias(
    //     new aws_route53_targets.CloudFrontTarget(distribution),
    //   ),
    // });
  }
}

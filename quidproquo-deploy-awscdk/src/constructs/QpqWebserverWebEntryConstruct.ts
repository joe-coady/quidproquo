import {
  aws_lambda,
  aws_s3,
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

export interface QpqWebserverWebEntryConstructProps
  extends QpqConstructProps<WebEntryQPQWebServerConfigSetting> {}

export class QpqWebserverWebEntryConstruct extends QpqConstruct<WebEntryQPQWebServerConfigSetting> {
  static getUniqueId(setting: WebEntryQPQWebServerConfigSetting) {
    return setting.buildPath.replaceAll('.', '').replaceAll('\\', '').replaceAll('/', '');
  }

  constructor(scope: Construct, id: string, props: QpqWebserverWebEntryConstructProps) {
    super(scope, id, props);

    const apexDomain = qpqWebServerUtils.getFeatureDomainName(props.qpqConfig);
    const webEntry = qpqWebServerUtils.getWebEntry(props.qpqConfig);

    console.log(webEntry);

    // create an s3 bucket
    const staticWebFilesBucket = new aws_s3.Bucket(scope, this.childId('bucket'), {
      bucketName: this.resourceName('web-files'),
      // Disable public access to this bucket, CloudFront will do that
      publicReadAccess: false,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

      // Default website file
      websiteIndexDocument: 'index.html',

      // Allow bucket to auto delete upon cdk:Destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create OriginAccessIdentity for the bucket.
    const websiteOAI = new aws_cloudfront.OriginAccessIdentity(scope, this.childId('website-oai'));
    staticWebFilesBucket.grantRead(websiteOAI);

    // Grab the hosted zone we want to add
    const serviceHostedZone = aws_route53.HostedZone.fromLookup(
      scope,
      this.childId('hosted-zone'),
      {
        domainName: apexDomain,
      },
    );

    // Create a certificate for the distribution - Seems to a bug where Route 53 records not cleaned up
    // after removing the DNS Validated certificate see: https://github.com/aws/aws-cdk/issues/3333
    // `switch over to using the Certificate with the new built-in (CloudFormation-based) DNS validation`
    const validationCertificate =
      aws_certificatemanager.CertificateValidation.fromDns(serviceHostedZone);
    const certificate = new aws_certificatemanager.DnsValidatedCertificate(
      scope,
      this.childId('viewer-cert'),
      {
        hostedZone: serviceHostedZone,
        domainName: apexDomain,
        region: 'us-east-1', // AWS certificates can only exist in the us-east-1 region
        validation: validationCertificate,
      },
    );
    const viewerCertificate = aws_cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: [apexDomain],
    });

    new aws_s3_deployment.BucketDeployment(scope, this.childId(`deploy-website`), {
      sources: [aws_s3_deployment.Source.asset(webEntry)],
      destinationBucket: staticWebFilesBucket,
    });

    // const cloudFrontBehaviors = qpqWebServerUtils.getAllSeo(props.qpqConfig).map((seo, index) => {
    //   const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(
    //     scope,
    //     this.childId(`$SEO-${seo.runtime}-${index}-VR`),
    //     {
    //       functionName: this.resourceName(`SEO-VR-${seo.runtime}-${index}`),
    //       timeout: cdk.Duration.seconds(5),
    //       runtime: aws_lambda.Runtime.NODEJS_16_X,

    //       code: aws_lambda.Code.fromAsset(
    //         path.join(stackProps.apiBuildPath, 'lambdaEventViewerRequest'),
    //       ),
    //       handler: 'index.executeEventViewerRequest',
    //     },
    //   );

    //   const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(
    //     stack,
    //     `${id}-SEO-${index}-${seo.runtime}-OR`,
    //     {
    //       functionName: `SEO-OR-${index}-${seo.runtime}-${environment}-${serviceName}`,
    //       timeout: cdk.Duration.seconds(30),
    //       runtime: aws_lambda.Runtime.NODEJS_16_X,

    //       memorySize: 1024,

    //       code: aws_lambda.Code.fromAsset(
    //         path.join(stackProps.apiBuildPath, 'lambdaEventOriginRequest'),
    //       ),
    //       handler: 'index.executeEventOriginRequest',
    //     },
    //   );

    //   // We don't need access to anything in the VR
    //   grantReadToOwnedResources(ownedResourceSettings, edgeFunctionOR);

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

    // Create a cloud front distribution
    // TODO: use aws_cloudfront.Distribution
    // TODO: Somehow expose query strings: Note ~
    // (Lambda@Edge only) To access the query string in an origin request or origin response function,
    // your cache policy or origin request policy must be set to All for Query strings.
    const distribution = new aws_cloudfront.CloudFrontWebDistribution(
      scope,
      this.childId('cf-distribution'),
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: staticWebFilesBucket,
              originAccessIdentity: websiteOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
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
      },
    );

    // Create a cdn link
    new aws_route53.ARecord(scope, this.childId(`web-alias`), {
      zone: serviceHostedZone,
      recordName: apexDomain,
      target: aws_route53.RecordTarget.fromAlias(
        new aws_route53_targets.CloudFrontTarget(distribution),
      ),
    });
  }
}

import * as path from 'path';
import { DeploymentSettings } from './DeploymentSettings';

import {
  Stack,
  aws_lambda_nodejs,
  aws_lambda,
  aws_apigateway,
  aws_s3,
  aws_s3_deployment,
  aws_events,
  aws_events_targets,
  aws_secretsmanager,
  aws_route53,
  aws_certificatemanager,
  aws_route53_targets,
  aws_cloudfront,
  aws_ssm,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';

import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';
import { DeploymentType } from './DeploymentType';

export interface QPQPrototypeStackProps extends DeploymentSettings {
  account: string;
  region: string;

  apiBuildPath: string;
  webBuildPath: string;

  lambdaAPIGatewayEventPath?: string;
  lambdaEventBridgeEventPath?: string;
}

const getEnvironmentDomain = (stackProps: QPQPrototypeStackProps) => {
  const apexDomain = qpqWebServerUtils.getDomainName(stackProps.qpqConfig);
  if (stackProps.environment === DeploymentType.Prod) {
    return apexDomain;
  }

  return `${stackProps.environment}.${apexDomain}`;
};

const createApiDomainName = (stack: cdk.Stack, id: string, stackProps: QPQPrototypeStackProps) => {
  const apexDomain = getEnvironmentDomain(stackProps);

  const apiDomainName = `api.${apexDomain}`;

  const apexHostedZone = aws_route53.HostedZone.fromLookup(stack, `${id}-apex-hostedZone`, {
    domainName: apexDomain,
  });

  const certificate = new aws_certificatemanager.Certificate(stack, `${id}-api-certificate`, {
    domainName: apiDomainName,
    certificateName: `api-cert-${qpqCoreUtils.getAppName(stackProps.qpqConfig)}`,
    validation: aws_certificatemanager.CertificateValidation.fromDns(apexHostedZone),
  });

  const domainName = new aws_apigateway.DomainName(stack, `${id}-api-custom-domain`, {
    domainName: apiDomainName,
    certificate,
    securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
    endpointType: aws_apigateway.EndpointType.REGIONAL,
  });

  new aws_route53.ARecord(stack, `${id}-a-record`, {
    zone: apexHostedZone,
    recordName: apiDomainName,
    target: aws_route53.RecordTarget.fromAlias(
      new aws_route53_targets.ApiGatewayDomain(domainName),
    ),
  });

  return domainName;
};

const createWebDistribution = (
  stack: cdk.Stack,
  id: string,
  stackProps: QPQPrototypeStackProps,
) => {
  const apexDomain = getEnvironmentDomain(stackProps);
  const serviceName = qpqCoreUtils.getAppName(stackProps.qpqConfig);

  // create an s3 bucket
  const staticWebFilesBucket = new aws_s3.Bucket(stack, `${id}-web`, {
    bucketName: `${serviceName}-${stackProps.environment}-web`,
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
  const websiteOAI = new aws_cloudfront.OriginAccessIdentity(stack, `${id}-website-OAI`);
  staticWebFilesBucket.grantRead(websiteOAI);

  // Grab the hosted zone we want to add
  const serviceHostedZone = aws_route53.HostedZone.fromLookup(stack, 'hosted-zone', {
    domainName: apexDomain,
  });

  // Create a certificate for the distribution - Seems to a bug where Route 53 records not cleaned up
  // after removing the DNS Validated certificate see: https://github.com/aws/aws-cdk/issues/3333
  // `switch over to using the Certificate with the new built-in (CloudFormation-based) DNS validation`
  const validationCertificate =
    aws_certificatemanager.CertificateValidation.fromDns(serviceHostedZone);
  const certificate = new aws_certificatemanager.DnsValidatedCertificate(
    stack,
    `${id}-viewer-cert`,
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

  new aws_s3_deployment.BucketDeployment(stack, `${id}-DeployWebsite`, {
    sources: [aws_s3_deployment.Source.asset(stackProps.webBuildPath)],
    destinationBucket: staticWebFilesBucket,
  });

  // Create a cloud front distribution
  // TODO: use aws_cloudfront.Distribution
  const distribution = new aws_cloudfront.CloudFrontWebDistribution(stack, 'cf-distribution', {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: staticWebFilesBucket,
          originAccessIdentity: websiteOAI,
        },
        behaviors: [
          ...[
            '/remoteEntry.js',
            '/index.js', // Add this if we need it
            '/index.html', // Add this if we need it
          ].map((pp) => ({
            pathPattern: pp,
            maxTtl: cdk.Duration.seconds(0),
            minTtl: cdk.Duration.seconds(0),
            defaultTtl: cdk.Duration.seconds(0),
          })),
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
  });

  // Create a cdn link
  new aws_route53.ARecord(stack, `${id}-web-alias`, {
    zone: serviceHostedZone,
    recordName: apexDomain,
    target: aws_route53.RecordTarget.fromAlias(
      new aws_route53_targets.CloudFrontTarget(distribution),
    ),
  });

  return distribution;
};

export class QPQPrototypeSingleServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: QPQPrototypeStackProps) {
    super(scope, id, {
      env: {
        account: props.account,
        region: props.region,
      },
    });

    const settings = {
      environment: props.environment,
      service: qpqCoreUtils.getAppName(props.qpqConfig),
    };

    const domainName = createApiDomainName(this, id, props);

    createWebDistribution(this, `${id}-web-dist`, props);

    const resourceName = (name: string) => {
      return `${settings.service}-${settings.environment}-${name}`;
    };

    // const BLLayer = new aws_lambda.LayerVersion(this, `${id}-BLLayer`, {
    //   layerVersionName: `${id}-BLLayer`,
    //   code: new aws_lambda.AssetCode(props.apiBuildPath),
    //   compatibleRuntimes: [aws_lambda.Runtime.NODEJS_16_X],
    // });

    const ownedSecrets = qpqCoreUtils.getOwnedSecrets(props.qpqConfig).map((secret) => {
      const realSecretName = `${secret.key}-${settings.service}-${settings.environment}`;
      return {
        secretName: secret.key,
        realName: realSecretName,
        secret: new aws_secretsmanager.Secret(this, `${id}-secret-${secret.key}`, {
          secretName: realSecretName,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          description: `${settings.environment}-${settings.service}`,
        }),
      };
    });

    const ownedParameters = qpqCoreUtils.getOwnedParameters(props.qpqConfig).map((parameter) => {
      const realParameterName = `${parameter.key}-${settings.service}-${settings.environment}`;
      return {
        parameterName: parameter.key,
        realName: realParameterName,
        parameter: new aws_ssm.StringParameter(this, `${id}-parameter-${parameter.key}`, {
          parameterName: realParameterName,
          description: `${settings.environment}-${settings.service}`,
          stringValue: parameter.value,

          // No additional costs ~ 4k max size
          tier: aws_ssm.ParameterTier.STANDARD,
        }),
      };
    });

    const buckets = qpqCoreUtils.getStorageDriveNames(props.qpqConfig).map((driveName) => {
      const bucketName = resourceName(driveName);

      const bucket = new aws_s3.Bucket(this, bucketName, {
        bucketName: resourceName(driveName),

        // Disable public access to this bucket, CloudFront will do that
        publicReadAccess: false,
        blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,

        // Allow bucket to auto delete upon cdk:Destroy
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      return {
        driveName,
        bucketName: bucketName,
        bucket: bucket,
      };
    });

    // This should be all resource names
    const runtimeConfigLambdaConfig: QPQAWSLambdaConfig = {
      qpqConfig: props.qpqConfig,
      secretNameMap: ownedSecrets.reduce(
        (acc, os) => ({
          ...acc,
          [os.secretName]: os.realName,
        }),
        {},
      ),
      parameterNameMap: ownedParameters.reduce(
        (acc, os) => ({
          ...acc,
          [os.parameterName]: os.realName,
        }),
        {},
      ),
      resourceNameMap: buckets.reduce(
        (acc, b) => ({
          ...acc,
          [b.driveName]: b.bucketName,
        }),
        {},
      ),
    };

    const lambdaHandler = new aws_lambda_nodejs.NodejsFunction(
      this,
      `${settings.environment}-${settings.service}-lambda-rest`,
      {
        functionName: `lambda-rest-${settings.service}-${settings.environment}`,
        entry:
          props.lambdaAPIGatewayEventPath ||
          path.resolve(__dirname, 'lambdas', 'lambdaAPIGatewayEvent.js'),
        handler: 'executeAPIGatewayEvent',
        timeout: cdk.Duration.seconds(25),

        runtime: aws_lambda.Runtime.NODEJS_16_X,

        // layers: [BLLayer],
        memorySize: 1024,

        bundling: {
          tsconfig: './tsconfig.json',
          define: {
            'process.env.lambdaRuntimeConfig': JSON.stringify(
              JSON.stringify(runtimeConfigLambdaConfig),
            ),
          },
        },

        environment: {
          TABLES: JSON.stringify([]),
        },
      },
    );

    // Grant access to the lambda
    buckets.forEach((b) => b.bucket.grantReadWrite(lambdaHandler));
    ownedSecrets.forEach((os) => os.secret.grantRead(lambdaHandler));
    ownedParameters.forEach((os) => os.parameter.grantRead(lambdaHandler));

    // Create a rest api
    const api = new aws_apigateway.LambdaRestApi(
      this,
      `${settings.environment}-${settings.service}-http-api`,
      {
        restApiName: `${settings.environment}-${settings.service}-http-api`,
        handler: lambdaHandler,
        deployOptions: {
          loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
          dataTraceEnabled: true,
        },
        proxy: true,
      },
    );

    // Map all requests to this service to /serviceName/*
    new aws_apigateway.BasePathMapping(this, `${id}-rest-bpm`, {
      domainName: domainName,
      restApi: api,

      // the properties below are optional
      // basePath: settings.service,
    });

    qpqCoreUtils.getScheduleEvents(props.qpqConfig).forEach((se, index) => {
      const schedulerFunction = new aws_lambda_nodejs.NodejsFunction(
        this,
        `${settings.environment}-${settings.service}-SE-${index}`,
        {
          functionName: `SE-${index}-${se.runtime}-${settings.environment}-${settings.service}`,
          entry:
            props.lambdaEventBridgeEventPath ||
            path.resolve(__dirname, 'lambdas', 'lambdaEventBridgeEvent.js'),
          handler: 'execute',
          timeout: cdk.Duration.minutes(15),

          runtime: aws_lambda.Runtime.NODEJS_16_X,

          // layers: [BLLayer],
          memorySize: 1024,

          bundling: {
            tsconfig: './tsconfig.json',
            define: {
              'process.env.lambdaRuntimeConfig': JSON.stringify(
                JSON.stringify({
                  ...runtimeConfigLambdaConfig,
                  lambdaRuntimeConfig: {
                    src: se.src,
                    runtime: se.runtime,
                  },
                }),
              ),
            },
          },

          environment: {
            TABLES: JSON.stringify([]),
          },
        },
      );

      buckets.forEach((b) => b.bucket.grantReadWrite(schedulerFunction));
      ownedSecrets.forEach((os) => os.secret.grantRead(schedulerFunction));
      ownedParameters.forEach((os) => os.parameter.grantRead(schedulerFunction));

      // EventBridge rule which runs every five minutes
      const cronRule = new aws_events.Rule(this, `${id}-se-cronrule-${index}`, {
        schedule: aws_events.Schedule.expression(`cron(${se.cronExpression})`),
      });

      // Set the target as lambda function
      cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction));
    });
  }
}

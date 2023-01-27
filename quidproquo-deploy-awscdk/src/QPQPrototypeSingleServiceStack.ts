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

import { LambdaRuntimeConfig } from 'quidproquo-actionprocessor-awslambda';

import { qpqCoreUtils } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

export interface QPQPrototypeStackProps extends DeploymentSettings {
  account: string;

  apiBuildPath: string;
  webBuildPath: string;

  lambdaAPIGatewayEventPath?: string;
  lambdaEventBridgeEventPath?: string;

  layers?: string[];
}

interface OwnedBucket {
  driveName: string;
  bucketName: string;
  bucket: aws_s3.Bucket;
}

interface OwnedSecret {
  secretName: string;
  realName: string;
  secret: aws_secretsmanager.Secret;
}

interface OwnedParameter {
  parameterName: string;
  realName: string;
  parameter: aws_ssm.StringParameter;
}

interface OwnedResourceSettings {
  ownedBuckets: OwnedBucket[];
  ownedSecrets: OwnedSecret[];
  ownedParameters: OwnedParameter[];
}

const grantReadToOwnedResources = (
  ownedResourceSettings: OwnedResourceSettings,
  identity: cdk.aws_iam.IGrantable,
) => {
  ownedResourceSettings.ownedBuckets.forEach((b) => b.bucket.grantReadWrite(identity));
  ownedResourceSettings.ownedSecrets.forEach((os) => os.secret.grantRead(identity));
  ownedResourceSettings.ownedParameters.forEach((os) => os.parameter.grantRead(identity));
};

const getParameterName = (parameterKey: string, service: string, environment: string) =>
  `${parameterKey}-${service}-${environment}`;

const createServiceParameter = (
  stack: cdk.Stack,
  id: string,
  service: string,
  environment: string,
  parameterKey: string,
  value: string,
) => {
  const realParameterName = getParameterName(parameterKey, service, environment);
  return {
    parameterName: parameterKey,
    realName: realParameterName,
    parameter: new aws_ssm.StringParameter(stack, `${id}-parameter-${parameterKey}`, {
      parameterName: realParameterName,
      description: `${environment}-${service}`,
      stringValue: value,

      // No additional costs ~ 4k max size
      tier: aws_ssm.ParameterTier.STANDARD,
    }),
  };
};

const createApiDomainName = (
  stack: cdk.Stack,
  id: string,
  stackProps: QPQPrototypeStackProps,
  subdomain: string,
) => {
  const apexDomain = qpqWebServerUtils.getEnvironmentDomainName(stackProps.qpqConfig);

  const apiDomainName = `${subdomain}.${apexDomain}`;

  const apexHostedZone = aws_route53.HostedZone.fromLookup(stack, `${id}-hostedZone-${subdomain}`, {
    domainName: apexDomain,
  });

  const certificate = new aws_certificatemanager.Certificate(
    stack,
    `${id}-${subdomain}-certificate`,
    {
      domainName: apiDomainName,
      certificateName: `${subdomain}-cert-${qpqCoreUtils.getAppName(stackProps.qpqConfig)}`,
      validation: aws_certificatemanager.CertificateValidation.fromDns(apexHostedZone),
    },
  );

  const domainName = new aws_apigateway.DomainName(stack, `${id}-${subdomain}-custom-domain`, {
    domainName: apiDomainName,
    certificate,
    securityPolicy: aws_apigateway.SecurityPolicy.TLS_1_2,
    endpointType: aws_apigateway.EndpointType.REGIONAL,
  });

  new aws_route53.ARecord(stack, `${id}-a-record-${subdomain}`, {
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
  ownedResourceSettings: OwnedResourceSettings,
) => {
  const environment = qpqCoreUtils.getApplicationEnvironment(stackProps.qpqConfig);
  const apexDomain = qpqWebServerUtils.getEnvironmentDomainName(stackProps.qpqConfig);
  const serviceName = qpqCoreUtils.getAppName(stackProps.qpqConfig);

  // create an s3 bucket
  const staticWebFilesBucket = new aws_s3.Bucket(stack, `${id}-web`, {
    bucketName: `${serviceName}-${environment}-web`,
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

  const cloudFrontBehaviors = qpqWebServerUtils
    .getAllSeo(stackProps.qpqConfig)
    .map((seo, index) => {
      const edgeFunctionVR = new aws_cloudfront.experimental.EdgeFunction(
        stack,
        `${id}-SEO-${index}-${seo.runtime}-VR`,
        {
          functionName: `SEO-VR-${index}-${seo.runtime}-${environment}-${serviceName}`,
          timeout: cdk.Duration.seconds(5),
          runtime: aws_lambda.Runtime.NODEJS_16_X,

          code: aws_lambda.Code.fromAsset(
            path.join(stackProps.apiBuildPath, 'lambdaEventViewerRequest'),
          ),
          handler: 'index.executeEventViewerRequest',
        },
      );

      const edgeFunctionOR = new aws_cloudfront.experimental.EdgeFunction(
        stack,
        `${id}-SEO-${index}-${seo.runtime}-OR`,
        {
          functionName: `SEO-OR-${index}-${seo.runtime}-${environment}-${serviceName}`,
          timeout: cdk.Duration.seconds(30),
          runtime: aws_lambda.Runtime.NODEJS_16_X,

          memorySize: 1024,

          code: aws_lambda.Code.fromAsset(
            path.join(stackProps.apiBuildPath, 'lambdaEventOriginRequest'),
          ),
          handler: 'index.executeEventOriginRequest',
        },
      );

      // We don't need access to anything in the VR
      grantReadToOwnedResources(ownedResourceSettings, edgeFunctionOR);

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
  const distribution = new aws_cloudfront.CloudFrontWebDistribution(stack, 'cf-distribution', {
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
        region: qpqCoreUtils.getDeployRegion(props.qpqConfig),
      },
    });

    const settings = {
      environment: qpqCoreUtils.getApplicationEnvironment(props.qpqConfig),
      service: qpqCoreUtils.getAppName(props.qpqConfig),
    };

    const domainName = createApiDomainName(this, id, props, 'api');

    const resourceName = (name: string) => {
      return `${settings.service}-${settings.environment}-${name}`;
    };

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

    const ownedParameters = qpqCoreUtils
      .getOwnedParameters(props.qpqConfig)
      .map((parameter) =>
        createServiceParameter(
          this,
          id,
          settings.service,
          settings.environment,
          parameter.key,
          parameter.value,
        ),
      );

    const ownedBuckets = qpqCoreUtils.getStorageDriveNames(props.qpqConfig).map((driveName) => {
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
    // const runtimeConfigLambdaConfig: QPQAWSResourceMap = {
    //   secretNameMap: ownedSecrets.reduce(
    //     (acc, os) => ({
    //       ...acc,
    //       [os.secretName]: os.realName,
    //     }),
    //     {},
    //   ),
    //   parameterNameMap: {
    //     ...ownedParameters.reduce(
    //       (acc, os) => ({
    //         ...acc,
    //         [os.parameterName]: os.realName,
    //       }),
    //       {},
    //     ),
    //     [qpqResourceMapConfigName]: getParameterName(
    //       qpqResourceMapConfigName,
    //       settings.service,
    //       settings.environment,
    //     ),
    //   },
    //   resourceNameMap: ownedBuckets.reduce(
    //     (acc, b) => ({
    //       ...acc,
    //       [b.driveName]: b.bucketName,
    //     }),
    //     {},
    //   ),
    // };

    // Build the param that stores the config
    // Note: The mapping was done manually previously inside the value
    // ownedParameters.push(
    //   createServiceParameter(
    //     this,
    //     id,
    //     settings.service,
    //     settings.environment,
    //     qpqResourceMapConfigName,
    //     JSON.stringify(runtimeConfigLambdaConfig),
    //   ),
    // );

    const ownedResourceSettings: OwnedResourceSettings = {
      ownedBuckets,
      ownedParameters,
      ownedSecrets,
    };

    ////////////////////////////////////////////////////////////////////////////////////
    // Finished building resources, now we can build the lambdas
    ////////////////////////////////////////////////////////////////////////////////////

    createWebDistribution(this, `${id}-web-dist`, props, ownedResourceSettings);

    const customLayers = (props.layers || []).map((layer) => {
      const layerName = `${layer.replace(/\\/g, '/').split('/').pop()}-${settings.environment}-${
        settings.service
      }`;

      return new aws_lambda.LayerVersion(this, `${id}-${layerName}`, {
        layerVersionName: `${layerName}`,
        code: new aws_lambda.AssetCode(layer),
        compatibleRuntimes: [aws_lambda.Runtime.NODEJS_16_X],
      });
    });

    const lambdaHandler = new aws_lambda.Function(
      this,
      `${settings.environment}-${settings.service}-lambda-rest`,
      {
        functionName: `lambda-rest-${settings.service}-${settings.environment}`,
        timeout: cdk.Duration.seconds(25),

        runtime: aws_lambda.Runtime.NODEJS_16_X,
        memorySize: 1024,
        layers: customLayers,

        code: aws_lambda.Code.fromAsset(path.join(props.apiBuildPath, 'lambdaAPIGatewayEvent')),
        handler: 'index.executeAPIGatewayEvent',

        environment: {
          TABLES: JSON.stringify([]),
          // lambdaRuntimeConfig: JSON.stringify(runtimeConfigLambdaConfig),
        },
      },
    );

    // Grant access to the lambda
    grantReadToOwnedResources(ownedResourceSettings, lambdaHandler);

    qpqWebServerUtils.getSubdomainRedirects(props.qpqConfig).forEach((redirect) => {
      const redirectLambda = new aws_lambda.Function(
        this,
        `${settings.environment}-${settings.service}-lambda-redirect-${redirect.subdomain}`,
        {
          functionName: `redirect-${redirect.subdomain}-${settings.service}-${settings.environment}`,
          timeout: cdk.Duration.seconds(25),

          runtime: aws_lambda.Runtime.NODEJS_16_X,
          memorySize: 128,

          code: aws_lambda.Code.fromAsset(
            path.join(props.apiBuildPath, 'lambdaAPIGatewayEvent_redirect'),
          ),
          handler: 'index.executeAPIGatewayEvent',

          environment: {
            redirectConfig: JSON.stringify(redirect),
            environment: JSON.stringify(settings.environment),
          },
        },
      );

      const restApi = new aws_apigateway.LambdaRestApi(
        this,
        `${id}-redirect-${redirect.subdomain}`,
        {
          restApiName: `subdomain-redirect-${redirect.subdomain}-${settings.environment}-${settings.service}`,
          handler: redirectLambda,
          deployOptions: {
            loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
            dataTraceEnabled: true,
          },
          proxy: true,
        },
      );

      // Map all requests to this service to /serviceName/*
      new aws_apigateway.BasePathMapping(this, `${id}-subdomain-bpm-${redirect.subdomain}`, {
        domainName: createApiDomainName(this, id, props, redirect.subdomain),
        restApi: restApi,

        // the properties below are optional
        // basePath: settings.service,
      });
    });

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
        binaryMediaTypes: ['*/*'],
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
      const schedulerFunction = new aws_lambda.Function(
        this,
        `${settings.environment}-${settings.service}-SE-${index}`,
        {
          functionName: `SE-${index}-${se.runtime}-${settings.environment}-${settings.service}`,
          timeout: cdk.Duration.minutes(15),

          runtime: aws_lambda.Runtime.NODEJS_16_X,
          memorySize: 1024,
          layers: customLayers,

          code: aws_lambda.Code.fromAsset(path.join(props.apiBuildPath, 'lambdaEventBridgeEvent')),
          handler: 'index.executeEventBridgeEvent',

          environment: {
            lambdaRuntimeConfig: JSON.stringify({
              src: se.src,
              runtime: se.runtime,
            } as LambdaRuntimeConfig),
          },
        },
      );

      grantReadToOwnedResources(ownedResourceSettings, schedulerFunction);

      // EventBridge rule which runs every five minutes
      const cronRule = new aws_events.Rule(this, `${id}-se-cronrule-${index}`, {
        schedule: aws_events.Schedule.expression(`cron(${se.cronExpression})`),
      });

      // Set the target as lambda function
      cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction));
    });
  }
}

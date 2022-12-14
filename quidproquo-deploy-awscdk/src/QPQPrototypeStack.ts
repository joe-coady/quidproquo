import * as path from 'path';

import {
  Stack,
  StackProps,
  aws_lambda_nodejs,
  aws_lambda,
  aws_apigateway,
  aws_s3,
  aws_events,
  aws_events_targets,
  aws_secretsmanager,
  aws_route53,
  aws_certificatemanager,
  aws_route53_targets,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

export interface QPQPrototypeStackProps extends StackProps {
  environment: string;
  serviceBuildPath: string;
  qpqConfig: QPQConfig;

  account: string;
  region: string;
}

const createApiDomainName = (stack: cdk.Stack, id: string, qpqConfig: QPQConfig) => {
  const serviceName = qpqCoreUtils.getAppName(qpqConfig);
  const apexDomain = qpqWebServerUtils.getDomainName(qpqConfig);

  const apiDomainName = `api.${serviceName}.${apexDomain}`;

  const apexHostedZone = aws_route53.HostedZone.fromLookup(stack, `${id}-apex-hostedZone`, {
    domainName: apexDomain,
  });

  const certificate = new aws_certificatemanager.Certificate(stack, `${id}-api-certificate`, {
    domainName: apiDomainName,
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

export class QPQPrototypeStack extends Stack {
  constructor(scope: Construct, props: QPQPrototypeStackProps) {
    const settings = {
      environment: props.environment,
      service: qpqCoreUtils.getAppName(props.qpqConfig),
      id: `${qpqCoreUtils.getAppName(props.qpqConfig)}-${props.environment}`,
    };

    super(scope, settings.id, {
      ...props,

      env: {
        account: props.account,
        region: props.region,
      },
    });

    const domainName = createApiDomainName(this, settings.id, props.qpqConfig);

    const resourceName = (name: string) => {
      return `${settings.service}-${settings.environment}-${name}`;
    };

    const BLLayer = new aws_lambda.LayerVersion(this, `${settings.id}-BLLayer`, {
      layerVersionName: `${settings.id}-BLLayer`,
      code: new aws_lambda.AssetCode(props.serviceBuildPath),
      compatibleRuntimes: [aws_lambda.Runtime.NODEJS_16_X],
    });

    const ownedSecrets = qpqCoreUtils.getOwnedSecrets(props.qpqConfig).map((secret) => {
      const realSecretName = `${secret.key}-${settings.service}-${settings.environment}`;
      return {
        secretName: secret.key,
        realName: realSecretName,
        secret: new aws_secretsmanager.Secret(this, `${settings.id}-secret-${secret.key}`, {
          secretName: realSecretName,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          description: `${settings.environment}-${settings.service}`,
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
        entry: path.resolve(__dirname, 'lambdas', 'lambdaAPIGatewayEvent.js'),
        handler: 'execute',
        timeout: cdk.Duration.seconds(25),

        runtime: aws_lambda.Runtime.NODEJS_16_X,

        layers: [BLLayer],

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
    new aws_apigateway.BasePathMapping(this, `${settings.id}-rest-bpm`, {
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
          entry: path.resolve(__dirname, 'lambdas', 'lambdaEventBridgeEvent.js'),
          handler: 'execute',
          timeout: cdk.Duration.minutes(15),

          runtime: aws_lambda.Runtime.NODEJS_16_X,

          memorySize: 400,

          layers: [BLLayer],

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

      // EventBridge rule which runs every five minutes
      const cronRule = new aws_events.Rule(this, `${settings.id}-se-cronrule-${index}`, {
        schedule: aws_events.Schedule.expression(`cron(${se.cronExpression})`),
      });

      // Set the targert as lambda function
      cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction));
    });
  }
}

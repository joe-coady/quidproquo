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
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';

import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

export interface LambdaEntry {
  src: string;
  runtime: string;
}

export interface QPQPrototypeStackProps extends StackProps {
  serviceBuildPath: string;
  qpqConfig: QPQConfig;

  routeEntry: LambdaEntry;
  eventEntry: LambdaEntry;
}

export class QPQPrototypeStack extends Stack {
  constructor(scope: Construct, id: string, props: QPQPrototypeStackProps) {
    super(scope, id, props);

    const settings = {
      environment: process.env.ENVIRONMENT || 'dev',
      service: qpqCoreUtils.getAppName(props.qpqConfig),

      aws: {
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
      },
    };

    const resourceName = (name: string) => {
      return `${settings.service}-${settings.environment}-${name}`;
    };

    const BLLayer = new aws_lambda.LayerVersion(this, `${id}-BLLayer`, {
      layerVersionName: `${id}-BLLayer`,
      code: new aws_lambda.AssetCode(props.serviceBuildPath),
      compatibleRuntimes: [aws_lambda.Runtime.NODEJS_16_X],
    });

    const ownedSecrets = qpqCoreUtils.getOwnedSecrets(props.qpqConfig).map(
      (secret) =>
        new aws_secretsmanager.Secret(this, `secret-${secret.key}`, {
          secretName: secret.key,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          description: `${settings.environment}-${settings.service}`,
        }),
    );

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
        entry: props.routeEntry.src,
        handler: props.routeEntry.runtime,
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
    ownedSecrets.forEach((os) => os.grantRead(lambdaHandler));

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

    qpqCoreUtils.getScheduleEvents(props.qpqConfig).forEach((se, index) => {
      const schedulerFunction = new aws_lambda_nodejs.NodejsFunction(
        this,
        `${settings.environment}-${settings.service}-SE-${index}`,
        {
          functionName: `SE-${index}-${se.runtime}-${settings.environment}-${settings.service}`,
          entry: props.eventEntry.src,
          handler: props.eventEntry.runtime,
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
      ownedSecrets.forEach((os) => os.grantRead(schedulerFunction));

      // EventBridge rule which runs every five minutes
      const cronRule = new aws_events.Rule(this, `se-cronrule-${index}`, {
        schedule: aws_events.Schedule.expression(`cron(${se.cronExpression})`),
      });

      // Set the targert as lambda function
      cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction));
    });
  }
}

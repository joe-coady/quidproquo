import { aws_ec2,aws_iam, aws_lambda, aws_logs, aws_sns, aws_sns_subscriptions } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';
import { getAwsServiceAccountInfoConfig } from 'quidproquo-config-aws';
import { qpqCoreUtils } from 'quidproquo-core';

import { BootstrapResource } from '../../constants';
import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';

export interface FunctionProps extends QpqConstructBlockProps {
  functionName?: string;

  srcFilename?: string;
  functionType: string; // TODO: Rename this to subFolder / folder or something
  executorName: string; // TODO: Rename this to handlerName or something maybe?

  timeoutInSeconds?: number;
  memoryInBytes?: number;

  environment?: {
    [key: string]: string;
  };

  apiLayerVersions?: aws_lambda.ILayerVersion[];

  reservedConcurrentExecutions?: number;

  role?: aws_iam.IRole;

  reacreateOnFunctionNameChange?: boolean;

  vpc?: aws_ec2.IVpc;
}

export class Function extends QpqConstructBlock {
  public readonly lambdaFunction: aws_lambda.Function;

  constructor(scope: Construct, id: string, props: FunctionProps) {
    super(scope, id, props);

    console.log(`Function: [${props.functionName || ''}]::${props.functionName?.length}`);

    const handlerFile = props.srcFilename || 'index';

    const serviceInfo = getAwsServiceAccountInfoConfig(props.qpqConfig);

    const functionId = props.reacreateOnFunctionNameChange && props.functionName ? props.functionName : 'function';

    this.lambdaFunction = new aws_lambda.Function(this, functionId, {
      functionName: props.functionName,
      timeout: cdk.Duration.seconds(props.timeoutInSeconds || 25),

      runtime: aws_lambda.Runtime.NODEJS_18_X,
      memorySize: props.memoryInBytes || serviceInfo.lambdaMaxMemoryInMiB || 1024,
      layers: props.apiLayerVersions,

      code: aws_lambda.Code.fromAsset(path.join(qpqCoreUtils.getApiBuildPathFullPath(props.qpqConfig), props.functionType)),
      handler: `${handlerFile}.${props.executorName}`,

      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        ...(props.environment || {}),
      },

      reservedConcurrentExecutions: props.reservedConcurrentExecutions,

      // TODO: Make this optional
      tracing: aws_lambda.Tracing.DISABLED,

      logRetention: aws_logs.RetentionDays.ONE_WEEK,

      role: props.role,

      vpc: props.vpc,
      vpcSubnets: props.vpc
        ? {
            subnetType: aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          }
        : undefined,
    });

    const region = qpqCoreUtils.getApplicationModuleDeployRegion(props.qpqConfig);
    const accountId = props.awsAccountId;
    const topicName = this.qpqBootstrapResourceName(BootstrapResource.WarmLambdas);
    const topicArn = `arn:aws:sns:${region}:${accountId}:${topicName}`;
    const topic = aws_sns.Topic.fromTopicArn(this, 'ImportedTopic', topicArn);

    topic.addSubscription(new aws_sns_subscriptions.LambdaSubscription(this.lambdaFunction));
  }
}

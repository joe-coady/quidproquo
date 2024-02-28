import path from 'path';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_lambda, aws_logs, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import { getAwsServiceAccountInfoConfig } from 'quidproquo-config-aws';

export interface FunctionProps extends QpqConstructBlockProps {
  functionName?: string;

  buildPath: string;
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
}

export class Function extends QpqConstructBlock {
  public readonly lambdaFunction: aws_lambda.Function;

  constructor(scope: Construct, id: string, props: FunctionProps) {
    super(scope, id, props);

    const handlerFile = props.srcFilename || 'index';

    const serviceInfo = getAwsServiceAccountInfoConfig(props.qpqConfig);

    const functionId =
      props.reacreateOnFunctionNameChange && props.functionName ? props.functionName : 'function';

    this.lambdaFunction = new aws_lambda.Function(this, functionId, {
      functionName: props.functionName,
      timeout: cdk.Duration.seconds(props.timeoutInSeconds || 25),

      runtime: aws_lambda.Runtime.NODEJS_18_X,
      memorySize: props.memoryInBytes || serviceInfo.lambdaMaxMemoryInMiB || 1024,
      layers: props.apiLayerVersions,

      code: aws_lambda.Code.fromAsset(path.join(props.buildPath, props.functionType)),
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
    });
  }
}

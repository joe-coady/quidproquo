import path from 'path';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_lambda, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface FunctionProps extends QpqConstructBlockProps {
  functionName: string;

  buildPath: string;
  functionType: string;
  executorName: string;

  timeoutInSeconds?: number;
  memoryInBytes?: number;

  environment?: {
    [key: string]: string;
  };

  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class Function extends QpqConstructBlock {
  public readonly lambdaFunction: aws_lambda.Function;

  constructor(scope: Construct, id: string, props: FunctionProps) {
    super(scope, id, props);

    this.lambdaFunction = new aws_lambda.Function(this, 'function', {
      functionName: props.functionName,
      timeout: cdk.Duration.seconds(props.timeoutInSeconds || 25),

      runtime: aws_lambda.Runtime.NODEJS_18_X,
      memorySize: props.memoryInBytes || 1024,
      layers: props.apiLayerVersions,

      code: aws_lambda.Code.fromAsset(path.join(props.buildPath, props.functionType)),
      handler: `index.${props.executorName}`,

      environment: props.environment,
    });

    // Let lambdas read from the exported variables in cloudformation
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['cloudformation:ListExports'],
        resources: ['*'],
      }),
    );

    // Let lambdas read from api keys in api gateway
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['apigateway:GET'],
        resources: ['*'],
      }),
    );
  }
}

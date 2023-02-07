import path from 'path';

import { QpqConstruct, QpqConstructProps } from '../core/QpqConstruct';
import { Construct } from 'constructs';
import { aws_lambda } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { ApiLayer } from '../../layers/ApiLayer';

export interface FunctionProps extends QpqConstructProps<any> {
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

export class Function extends QpqConstruct<any> {
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
  }
}

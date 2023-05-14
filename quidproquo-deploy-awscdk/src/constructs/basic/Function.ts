import path from 'path';

import { QpqConstructBlock, QpqConstructBlockProps } from '../base/QpqConstructBlock';
import { Construct } from 'constructs';
import { aws_lambda, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface FunctionProps extends QpqConstructBlockProps {
  functionName: string;

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
}

export class Function extends QpqConstructBlock {
  public readonly lambdaFunction: aws_lambda.Function;

  constructor(scope: Construct, id: string, props: FunctionProps) {
    super(scope, id, props);

    const handlerFile = props.srcFilename || 'index';

    this.lambdaFunction = new aws_lambda.Function(this, 'function', {
      functionName: props.functionName,
      timeout: cdk.Duration.seconds(props.timeoutInSeconds || 25),

      runtime: aws_lambda.Runtime.NODEJS_18_X,
      memorySize: props.memoryInBytes || 1024,
      layers: props.apiLayerVersions,

      code: aws_lambda.Code.fromAsset(path.join(props.buildPath, props.functionType)),
      handler: `${handlerFile}.${props.executorName}`,

      environment: props.environment,

      reservedConcurrentExecutions: props.reservedConcurrentExecutions,
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

    // Let lambdas invalidate cache for cloud front
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: ['*'],
      }),
    );

    // Let lambdas publish sns messages.
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: ['*'],
      }),
    );

    // Let lambdas publish sns messages.
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
      }),
    );

    // Let lambdas write to dynamo logs
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: ['arn:aws:lambda:*:*:function:*sfunc*'],
      }),
    );

    // We need access to dynamo log tables
    this.lambdaFunction.addToRolePolicy(
      new aws_iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:Scan', 'dynamodb:Query', 'dynamodb:PutItem'],

        // TODO: Revisit this, the user can make logs tables them selves... ~ Slight security risk here
        // Consider making tags to identify logs tables, all qpq resourses
        // conditions: {
        //   'ForAllValues:StringLike': {
        //     'aws:ResourceTag/Name': '*qpqlog',
        //   },
        // },
        resources: ['arn:aws:dynamodb:*:*:table/logs-*'],
      }),
    );
  }
}

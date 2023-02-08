import { QueueQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_sqs, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreQueueConstructProps extends QpqConstructBlockProps {
  queueConfig: QueueQPQConfigSetting;
}

export abstract class QpqCoreQueueConstructBase extends QpqConstructBlock {
  abstract queue: aws_sqs.IQueue;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.queue.grant(
      grantee,
      'sqs:GetQueueAttributes',
      'sqs:GetQueueUrl',
      'sqs:ListDeadLetterSourceQueues',
      'sqs:ReceiveMessage',
      'sqs:PeekMessage',
    );
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.queue.grant(grantee, 'sqs:SendMessage');
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class QpqCoreQueueConstruct extends QpqCoreQueueConstructBase {
  queue: aws_sqs.IQueue;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    queueConfig: QueueQPQConfigSetting,
    awsAccountId: string,
  ): QpqResource {
    class Import extends QpqCoreQueueConstructBase {
      queue = aws_sqs.Queue.fromQueueAttributes(scope, `${id}-${queueConfig.uniqueKey}`, {
        queueArn: `arn:aws:sqs:${qpqCoreUtils.getApplicationModuleDeployRegion(
          qpqConfig,
        )}:${awsAccountId}:${this.resourceName(queueConfig.name)}`,
      });
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreQueueConstructProps) {
    super(scope, id, props);

    this.queue = new aws_sqs.Queue(this, 'MainQueue', {
      queueName: this.resourceName(props.queueConfig.name),
      visibilityTimeout: cdk.Duration.seconds(props.queueConfig.ttRetryInSeconds),
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      deadLetterQueue: {
        maxReceiveCount: props.queueConfig.maxRetry,
        queue: new aws_sqs.Queue(this, 'DeadLetterQueue', {
          queueName: this.resourceName(`${props.queueConfig.name}-dead`),
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      },
    });

    // const queueFunction = new Function(this, props.setting.uniqueKey, {
    //   buildPath: qpqCoreUtils.getQueueEntryFullPath(props.qpqConfig, props.setting),
    //   functionName: this.resourceName(`${props.setting.uniqueKey}-queue`),
    //   functionType: 'lambdaSQSEvent',
    //   executorName: 'executeSQSEvent',

    //   qpqConfig: props.qpqConfig,
    //   setting: props.setting,

    //   apiLayerVersions: props.apiLayerVersions,

    //   awsAccountId: props.awsAccountId,
    // });

    // // TODO: Make this a utility function
    // const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
    //   this,
    //   'grantable',
    //   this.qpqConfig,
    //   props.awsAccountId,
    // );

    // grantables.forEach((g) => {
    //   g.grantAll(queueFunction.lambdaFunction);
    // });
    // // ///////// end todo

    // const mainQueue = new aws_sqs.Queue(this, 'MainQueue', {
    //   queueName: this.resourceName(`${props.setting.name}`),
    //   visibilityTimeout: cdk.Duration.seconds(props.setting.ttRetryInSeconds),
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,

    //   deadLetterQueue: {
    //     maxReceiveCount: props.setting.maxRetry,
    //     queue: new aws_sqs.Queue(this, 'DeadLetterQueue', {
    //       queueName: this.resourceName(`${props.setting.name}-dead`),
    //       removalPolicy: cdk.RemovalPolicy.DESTROY,
    //     }),
    //   },
    // });

    // queueFunction.lambdaFunction.addEventSource(
    //   new aws_lambda_event_sources.SqsEventSource(mainQueue, {
    //     batchSize: props.setting.batchSize,
    //     maxBatchingWindow: cdk.Duration.seconds(props.setting.batchWindowInSeconds),
    //     reportBatchItemFailures: true,
    //   }),
    // );
  }
}

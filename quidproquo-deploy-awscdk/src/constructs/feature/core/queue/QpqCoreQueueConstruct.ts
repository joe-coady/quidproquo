import { aws_iam,aws_sqs } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { getAwsAccountIds } from 'quidproquo-config-aws';
import { QPQConfig,qpqCoreUtils, QueueQPQConfigSetting } from 'quidproquo-core';

import * as qpqDeployAwsCdkUtils from '../../../../utils/qpqDeployAwsCdkUtils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

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
  ): QpqCoreQueueConstructBase {
    const queueArn = `arn:aws:sqs:${qpqCoreUtils.getApplicationModuleDeployRegion(
      qpqConfig,
    )}:${awsAccountId}:${awsNamingUtils.getConfigRuntimeResourceNameFromConfig(queueConfig.name, qpqConfig)}`;

    class Import extends QpqCoreQueueConstructBase {
      queue = aws_sqs.Queue.fromQueueAttributes(scope, `${id}-${queueConfig.uniqueKey}`, {
        queueArn: queueArn,
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
        maxReceiveCount: props.queueConfig.maxTries,
        queue: new aws_sqs.Queue(this, 'DeadLetterQueue', {
          queueName: this.resourceName(`${props.queueConfig.name}-dead`),
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      },
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.queue, props.qpqConfig);

    const accountIds = getAwsAccountIds(props.qpqConfig);

    // This has to be any topic arn as we want other services / apps to be able
    // to publish to this queue
    accountIds.forEach((accountId) => {
      this.queue.addToResourcePolicy(
        new aws_iam.PolicyStatement({
          sid: `AllowSNSServicePrincipal_${accountId}`,
          effect: aws_iam.Effect.ALLOW,
          principals: [new aws_iam.ServicePrincipal('sns.amazonaws.com')],
          actions: ['sqs:SendMessage'],
          resources: [this.queue.queueArn],
          conditions: {
            ArnEquals: {
              'aws:SourceArn': `arn:aws:sns:*:${accountId}:*`,
            },
          },
        }),
      );
    });
  }

  public static authorizeActionsForRole(role: aws_iam.IRole, queues: QpqCoreQueueConstruct[]) {
    if (queues.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: [
            'sqs:GetQueueAttributes',
            'sqs:GetQueueUrl',
            'sqs:ListDeadLetterSourceQueues',
            'sqs:ReceiveMessage',
            'sqs:PeekMessage',
            'sqs:SendMessage',
          ],
          resources: queues.map((queue) => queue.queue.queueArn),
        }),
      );
    }
  }
}

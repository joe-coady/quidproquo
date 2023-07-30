import { QueueQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqCoreQueueConstruct } from './QpqCoreQueueConstruct';
import { QpqCoreEventBusConstruct } from '../eventBus/QpqCoreEventBusConstruct';

import { Function } from '../../../basic/Function';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Construct } from 'constructs';
import { aws_lambda_event_sources, aws_lambda, aws_sns, aws_sns_subscriptions } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import {
  getEventBusSubscriptionDetails,
  getAwsServiceAccountInfoByDeploymentInfo,
} from 'quidproquo-config-aws';

export interface QpqApiCoreQueueConstructProps extends QpqConstructBlockProps {
  queueConfig: QueueQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqApiCoreQueueConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqApiCoreQueueConstructProps) {
    super(scope, id, props);

    const queueFunction = new Function(this, props.queueConfig.uniqueKey, {
      buildPath: qpqCoreUtils.getQueueEntryFullPath(props.qpqConfig, props.queueConfig),
      functionName: this.resourceName(`${props.queueConfig.uniqueKey}-queue`),
      functionType: 'lambdaSQSEvent',
      executorName: 'executeSQSEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,

      environment: {
        queueQPQConfigSetting: JSON.stringify(props.queueConfig),
      },

      // TODO: Expose this as a config option
      reservedConcurrentExecutions: props.queueConfig.maxConcurrentExecutions,

      // Timeout in 15 mins ~ Max
      // Note: AWS requires that the visibility timeout of the SQS queue be greater than or
      //       equal to the timeout of the Lambda function. This is because if a message is
      //       processed by a Lambda function for a time longer than the SQS visibility timeout,
      //       the message will become visible in the SQS queue again and could be consumed
      //       by another Lambda function, resulting in the message being processed multiple times.
      timeoutInSeconds: Math.min(props.queueConfig.ttRetryInSeconds, 15*60)
    });

    // TODO: Make this a utility function
    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
      props.awsAccountId,
    );

    grantables.forEach((g) => {
      g.grantAll(queueFunction.lambdaFunction);
    });
    // ///////// end todo

    const queueResource = QpqCoreQueueConstruct.fromOtherStack(
      this,
      'queue',
      props.qpqConfig,
      props.queueConfig,
      props.awsAccountId,
    );

    props.queueConfig.eventBusSubscriptions.forEach((eventBusSubscription) => {
      const eventBusSubscriptionDetails = getEventBusSubscriptionDetails(
        eventBusSubscription,
        props.qpqConfig,
      );

      const deploymentInfo = getAwsServiceAccountInfoByDeploymentInfo(
        props.qpqConfig,
        eventBusSubscriptionDetails.module,
        eventBusSubscriptionDetails.environment,
        eventBusSubscriptionDetails.feature,
      );

      const eventBus = QpqCoreEventBusConstruct.fromOtherStack(
        this,
        `event-bus-${eventBusSubscriptionDetails.eventBusName}`,
        props.qpqConfig,
        deploymentInfo.awsAccountId,
        eventBusSubscriptionDetails,
      );

      eventBus.topic.addSubscription(
        new aws_sns_subscriptions.SqsSubscription(queueResource.queue, {
          rawMessageDelivery: true,

          // No wildcard support :(
          // filterPolicy: {
          //   type: aws_sns.SubscriptionFilter.stringFilter({
          //     allowlist: Object.keys(props.queueConfig.qpqQueueProcessors).map((type) =>
          //       type.replaceAll(/{(.+?)}/g, '*'),
          //     ),
          //   }),
          // },
        }),
      );
    });

    queueFunction.lambdaFunction.addEventSource(
      new aws_lambda_event_sources.SqsEventSource(queueResource.queue, {
        batchSize: props.queueConfig.batchSize,
        maxBatchingWindow: cdk.Duration.seconds(props.queueConfig.batchWindowInSeconds),
        reportBatchItemFailures: true,
      }),
    );
  }
}

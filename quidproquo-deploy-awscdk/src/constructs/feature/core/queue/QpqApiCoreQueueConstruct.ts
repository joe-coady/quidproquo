import { QueueQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqCoreQueueConstruct } from './QpqCoreQueueConstruct';
import { QpqCoreEventBusConstruct } from '../eventBus/QpqCoreEventBusConstruct';

import { Function } from '../../../basic/Function';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Construct } from 'constructs';
import { aws_lambda_event_sources, aws_lambda, aws_sns, aws_sns_subscriptions } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

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

    props.queueConfig.eventBusSubscriptions.forEach((eventBusName) => {
      const eventBus = QpqCoreEventBusConstruct.fromOtherStack(
        this,
        `event-bus-${eventBusName}`,
        props.qpqConfig,
        props.awsAccountId,
        eventBusName,
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

import { QueueQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqCoreQueueConstruct } from './QpqCoreQueueConstruct';

import { Function } from '../../../basic/Function';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Construct } from 'constructs';
import { aws_sqs, aws_lambda_event_sources, aws_lambda } from 'aws-cdk-lib';
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

    queueFunction.lambdaFunction.addEventSource(
      new aws_lambda_event_sources.SqsEventSource(queueResource.queue, {
        batchSize: props.queueConfig.batchSize,
        maxBatchingWindow: cdk.Duration.seconds(props.queueConfig.batchWindowInSeconds),
        reportBatchItemFailures: true,
      }),
    );
  }
}

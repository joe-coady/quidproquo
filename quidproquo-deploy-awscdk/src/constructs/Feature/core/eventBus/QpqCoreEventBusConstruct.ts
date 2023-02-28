import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { EventBusQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Construct } from 'constructs';
import { aws_sns } from 'aws-cdk-lib';

export interface QpqCoreEventBusConstructProps extends QpqConstructBlockProps {
  eventBusConfig: EventBusQPQConfigSetting;
}

export class QpqCoreEventBusConstruct extends QpqConstructBlock {
  topic: aws_sns.Topic;

  constructor(scope: Construct, id: string, props: QpqCoreEventBusConstructProps) {
    super(scope, id, props);

    this.topic = new aws_sns.Topic(this, 'topic', {
      topicName: this.resourceName(props.eventBusConfig.name),
      displayName: props.eventBusConfig.name,
    });

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameSnsTopicArnFromConfig(
        props.eventBusConfig.name,
        props.qpqConfig,
      ),
      this.topic.topicArn,
    );
  }
}

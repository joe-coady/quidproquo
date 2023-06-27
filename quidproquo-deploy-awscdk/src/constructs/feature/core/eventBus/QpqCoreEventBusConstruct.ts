import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { EventBusQPQConfigSetting, qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Construct } from 'constructs';
import { aws_sns, aws_iam } from 'aws-cdk-lib';

export interface QpqCoreEventBusConstructProps extends QpqConstructBlockProps {
  eventBusConfig: EventBusQPQConfigSetting;
}

export abstract class QpqCoreEventBusConstructBase extends QpqConstructBlock {
  abstract topic: aws_sns.ITopic;

  public grantRead(grantee: aws_iam.IGrantable) {}

  public grantWrite(grantee: aws_iam.IGrantable): void {
    this.topic.grantPublish(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class QpqCoreEventBusConstruct extends QpqCoreEventBusConstructBase {
  topic: aws_sns.ITopic;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    awsAccountId: string,
    eventBusName: string,

    module: string,
    environment: string,
    application: string,
    feature?: string,
  ): QpqCoreEventBusConstructBase {
    const topicArn = awsNamingUtils.getEventBusSnsTopicArn(
      eventBusName,
      qpqConfig,
      module,
      environment,
      application,
      feature,
    );

    class Import extends QpqCoreEventBusConstructBase {
      topic = aws_sns.Topic.fromTopicArn(this, 'topic-arn', topicArn);
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreEventBusConstructProps) {
    super(scope, id, props);

    this.topic = new aws_sns.Topic(this, 'topic', {
      topicName: this.resourceName(props.eventBusConfig.name),
      displayName: props.eventBusConfig.name,
    });

    // TODO: remove this, its deprecated
    const exportName = awsNamingUtils.getCFExportNameSnsTopicArnFromConfig(
      props.eventBusConfig.name,
      props.qpqConfig,
    );
    qpqDeployAwsCdkUtils.exportStackValue(this, exportName, this.topic.topicArn);
    // ///////// end todo
  }
}

import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { getAwsAccountIds } from 'quidproquo-config-aws';
import { EventBusQPQConfigSetting, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { aws_iam, aws_sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

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

  static fromOtherStack(scope: Construct, id: string, qpqConfig: QPQConfig, eventBusSubscription: string): QpqCoreEventBusConstructBase {
    const eventBusConfig = qpqCoreUtils.getEventBusConfigByName(eventBusSubscription, qpqConfig);

    const topicArn = awsNamingUtils.getEventBusSnsTopicArn(
      eventBusConfig?.owner?.resourceNameOverride || eventBusSubscription,
      qpqConfig,
      eventBusConfig?.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      eventBusConfig?.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      eventBusConfig?.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig),
      eventBusConfig?.owner?.feature ?? qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
    );

    class Import extends QpqCoreEventBusConstructBase {
      topic = aws_sns.Topic.fromTopicArn(this, 'topic-arn', topicArn);
    }

    return new Import(scope, id, { qpqConfig });
  }

  constructor(scope: Construct, id: string, props: QpqCoreEventBusConstructProps) {
    super(scope, id, props);

    this.topic = new aws_sns.Topic(this, 'topic', {
      topicName: this.resourceName(props.eventBusConfig.name),
      displayName: props.eventBusConfig.name,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.topic, props.qpqConfig);

    const accountIds = getAwsAccountIds(props.qpqConfig);
    accountIds.forEach((accountId) => {
      this.topic.addToResourcePolicy(
        new aws_iam.PolicyStatement({
          sid: `x-account-sub-${accountId}`,
          effect: aws_iam.Effect.ALLOW,
          principals: [new aws_iam.AccountPrincipal(accountId)],
          actions: ['sns:Subscribe'],
          resources: [this.topic.topicArn],
        }),
      );
    });

    this.topic.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        sid: 'AllowCloudWatchAlarms',
        effect: aws_iam.Effect.ALLOW,
        principals: [new aws_iam.ServicePrincipal('cloudwatch.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [this.topic.topicArn],
      }),
    );

    // TODO: remove this, its deprecated
    const exportName = awsNamingUtils.getCFExportNameSnsTopicArnFromConfig(props.eventBusConfig.name, props.qpqConfig);
    qpqDeployAwsCdkUtils.exportStackValue(this, exportName, this.topic.topicArn);
    // ///////// end todo
  }
}

import { aws_cloudwatch, aws_sns, aws_cloudwatch_actions } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import {
  AwsAlarmNamespace,
  AwsAlarmOperator,
  AwsAlarmQPQConfigSetting,
} from 'quidproquo-config-aws';
import { QpqCoreEventBusConstruct } from '../../core';

export interface QpqConfigAwsAlarmConstructProps extends QpqConstructBlockProps {
  alarmConfig: AwsAlarmQPQConfigSetting;
}

function AwsAlarmOperatorToComparisonOperator(
  operator: AwsAlarmOperator,
): aws_cloudwatch.ComparisonOperator {
  switch (operator) {
    case AwsAlarmOperator.GreaterThanThreshold:
      return aws_cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD;
    case AwsAlarmOperator.GreaterThanOrEqualToThreshold:
      return aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD;
    case AwsAlarmOperator.LessThanThreshold:
      return aws_cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD;
    case AwsAlarmOperator.LessThanOrEqualToThreshold:
      return aws_cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD;
    default:
      throw new Error('Invalid AwsAlarmOperator value');
  }
}

export class QpqConfigAwsAlarmConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqConfigAwsAlarmConstructProps) {
    super(scope, id, props);

    // Check if the namespace is Lambda
    if (props.alarmConfig.alarmSettings.namespace === AwsAlarmNamespace.Lambda) {
      const lambdaAlarmSettings = props.alarmConfig.alarmSettings;

      // Create CloudWatch alarm for Lambda
      const alarm = new aws_cloudwatch.Alarm(this, props.alarmConfig.uniqueKey, {
        alarmName: this.resourceName(props.alarmConfig.name),
        metric: new aws_cloudwatch.Metric({
          namespace: lambdaAlarmSettings.namespace,
          metricName: lambdaAlarmSettings.metricName,
          statistic: lambdaAlarmSettings.statistic,
          period: cdk.Duration.seconds(lambdaAlarmSettings.period),
        }),
        threshold: lambdaAlarmSettings.threshold,
        comparisonOperator: AwsAlarmOperatorToComparisonOperator(lambdaAlarmSettings.operator),
        datapointsToAlarm: lambdaAlarmSettings.datapointsToAlarm,
        evaluationPeriods: lambdaAlarmSettings.evaluationPeriodsToAlarm,
      });

      props.alarmConfig.alarmSettings.onAlarm.publishToEventBus?.forEach((eventBusName) => {
        const eventBus = QpqCoreEventBusConstruct.fromOtherStack(
          scope,
          'eventBus',
          props.qpqConfig,
          props.awsAccountId,
          eventBusName,
        );

        alarm.addAlarmAction(new aws_cloudwatch_actions.SnsAction(eventBus.topic));
      });
    } else {
      // Handle other namespaces or throw an error
      throw new Error(`Invalid namespace ${props.alarmConfig.alarmSettings.namespace}`);
    }
  }
}

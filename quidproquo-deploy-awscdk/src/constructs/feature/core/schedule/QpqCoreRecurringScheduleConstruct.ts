import { LambdaRuntimeConfig } from 'quidproquo-actionprocessor-awslambda';
import { qpqCoreUtils,ScheduleQPQConfigSetting } from 'quidproquo-core';

import { aws_events, aws_events_targets, aws_lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { Function } from '../../../basic/Function';

export interface QpqCoreRecurringScheduleConstructProps extends QpqConstructBlockProps {
  scheduleConfig: ScheduleQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqCoreRecurringScheduleConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqCoreRecurringScheduleConstructProps) {
    super(scope, id, props);

    const schedulerFunction = new Function(this, props.scheduleConfig.uniqueKey, {
      functionName: this.resourceName(`${props.scheduleConfig.uniqueKey}-SE`),
      functionType: 'eventBridgeEvent_recurringSchedule',
      executorName: 'eventBridgeEvent_recurringSchedule',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      environment: {
        lambdaRuntimeConfig: JSON.stringify({
          runtime: props.scheduleConfig.runtime,
        } as LambdaRuntimeConfig),
      },

      awsAccountId: props.awsAccountId,

      // 15 min timeout
      timeoutInSeconds: 15 * 60,

      role: this.getServiceRole(),
    });

    // EventBridge rule which runs every five minutes
    const cronRule = new aws_events.Rule(this, 'cron', {
      schedule: aws_events.Schedule.expression(`cron(${props.scheduleConfig.cronExpression})`),
    });

    // Set the target as lambda function
    cronRule.addTarget(
      new aws_events_targets.LambdaFunction(schedulerFunction.lambdaFunction, {
        event: aws_events.RuleTargetInput.fromObject({
          source: 'custom.event.RecurringSchedule',
          'detail-type': 'Recurring Schedule',
          detail: props.scheduleConfig.metadata,
        }),
      }),
    );
  }
}

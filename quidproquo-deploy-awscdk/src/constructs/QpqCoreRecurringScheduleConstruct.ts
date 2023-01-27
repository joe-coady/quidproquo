import { ScheduleQPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { LambdaRuntimeConfig } from 'quidproquo-actionprocessor-awslambda';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';

import { Construct } from 'constructs';
import { aws_events, aws_events_targets } from 'aws-cdk-lib';

import { Function } from './basic/Function';
import * as qpqDeployAwsCdkUtils from '../qpqDeployAwsCdkUtils';

export interface QpqCoreRecurringScheduleConstructProps
  extends QpqConstructProps<ScheduleQPQConfigSetting> {}

export class QpqCoreRecurringScheduleConstruct extends QpqConstruct<ScheduleQPQConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqCoreRecurringScheduleConstructProps) {
    super(scope, id, props);

    const schedulerFunction = new Function(this, props.setting.uniqueKey, {
      buildPath: qpqCoreUtils.getScheduleEntryFullPath(props.qpqConfig, props.setting),
      functionName: this.resourceName(`${props.setting.uniqueKey}-SE`),
      functionType: 'lambdaEventBridgeEvent',
      executorName: 'executeEventBridgeEvent',

      qpqConfig: props.qpqConfig,
      setting: props.setting,

      apiLayerVersions: props.apiLayerVersions,

      environment: {
        lambdaRuntimeConfig: JSON.stringify({
          src: props.setting.src,
          runtime: props.setting.runtime,
        } as LambdaRuntimeConfig),
      },
    });

    // TODO: Make this a utility function
    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
    );

    grantables.forEach((g) => {
      g.grantAll(schedulerFunction.lambdaFunction);
    });
    // ///////// end todo

    // EventBridge rule which runs every five minutes
    const cronRule = new aws_events.Rule(this, 'cron', {
      schedule: aws_events.Schedule.expression(`cron(${props.setting.cronExpression})`),
    });

    // Set the target as lambda function
    cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction.lambdaFunction));
  }
}

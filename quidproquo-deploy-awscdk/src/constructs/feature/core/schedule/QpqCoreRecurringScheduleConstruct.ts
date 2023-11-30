import { ScheduleQPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { LambdaRuntimeConfig } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_events, aws_events_targets, aws_lambda } from 'aws-cdk-lib';

import { Function } from '../../../basic/Function';
import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqCoreRecurringScheduleConstructProps extends QpqConstructBlockProps {
  scheduleConfig: ScheduleQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqCoreRecurringScheduleConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqCoreRecurringScheduleConstructProps) {
    super(scope, id, props);

    const schedulerFunction = new Function(this, props.scheduleConfig.uniqueKey, {
      buildPath: qpqCoreUtils.getScheduleEntryFullPath(props.qpqConfig, props.scheduleConfig),
      functionName: this.resourceName(`${props.scheduleConfig.uniqueKey}-SE`),
      functionType: 'lambdaEventBridgeEvent',
      executorName: 'executeEventBridgeEvent',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      environment: {
        lambdaRuntimeConfig: JSON.stringify({
          src: props.scheduleConfig.src,
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
    cronRule.addTarget(new aws_events_targets.LambdaFunction(schedulerFunction.lambdaFunction));
  }
}

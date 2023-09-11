import { MigrationsQPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

import { Construct } from 'constructs';
import { aws_events, aws_events_targets, aws_lambda } from 'aws-cdk-lib';

import { Function } from '../../../basic/Function';
import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqCoreMigrationsConstructProps extends QpqConstructBlockProps {
  migrationsConfig: MigrationsQPQConfigSetting;
  apiLayerVersions?: aws_lambda.ILayerVersion[];
}

export class QpqCoreMigrationsConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqCoreMigrationsConstructProps) {
    super(scope, id, props);

    const func = new Function(this, props.migrationsConfig.uniqueKey, {
      buildPath: qpqCoreUtils.getMigrationsFullPath(props.qpqConfig, props.migrationsConfig),
      functionName: this.resourceName(`${props.migrationsConfig.uniqueKey}-migrations`),
      functionType: 'lambdaEventBridgeEventStackDeploy',
      executorName: 'executelambdaEventBridgeEventStackDeploy',

      qpqConfig: props.qpqConfig,

      apiLayerVersions: props.apiLayerVersions,

      awsAccountId: props.awsAccountId,

      // 15 min timeout
      timeoutInSeconds: 15*60
    });

    // TODO: Make this a utility function
    const grantables = qpqDeployAwsCdkUtils.getQqpGrantableResources(
      this,
      'grantable',
      this.qpqConfig,
      props.awsAccountId,
    );

    grantables.forEach((g) => {
      g.grantAll(func.lambdaFunction);
    });
    // ///////// end todo

    // Create a CloudWatch Event that triggers when CloudFormation stack deploys
    const rule = new aws_events.Rule(this, 'Rule', {
      eventPattern: {
        source: ['aws.cloudformation'],
        detailType: ["CloudFormation Stack Status Change"],
        detail: {
          eventName: ["UPDATE_COMPLETE", "CREATE_COMPLETE", "DELETE_COMPLETE"],
        },
      },
    });

    // Add Lambda as the target of the CloudWatch Event
    rule.addTarget(new aws_events_targets.LambdaFunction(func.lambdaFunction));
  }
}

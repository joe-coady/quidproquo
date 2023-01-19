import { ParameterQPQConfigSetting } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';
import { aws_ssm } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreParameterConstructProps
  extends QpqConstructProps<ParameterQPQConfigSetting> {}

export class QpqCoreParameterConstruct extends QpqConstruct<ParameterQPQConfigSetting> {
  static getUniqueId(setting: ParameterQPQConfigSetting) {
    return setting.key;
  }

  constructor(scope: Construct, id: string, props: QpqCoreParameterConstructProps) {
    super(scope, id, props);

    new aws_ssm.StringParameter(scope, this.childId('param'), {
      parameterName: this.resourceName(props.setting.key),
      description: props.setting.key,
      stringValue: props.setting.value,

      // No additional costs ~ 4k max size
      tier: aws_ssm.ParameterTier.STANDARD,
    });
  }
}

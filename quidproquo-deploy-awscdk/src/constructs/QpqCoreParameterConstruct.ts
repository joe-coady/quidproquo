import { ParameterQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { QpqResource } from './core/QpqResource';
import { Construct } from 'constructs';
import { aws_ssm, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreParameterConstructProps
  extends QpqConstructProps<ParameterQPQConfigSetting> {}

export abstract class QpqCoreParameterConstructBase
  extends QpqConstruct<ParameterQPQConfigSetting>
  implements QpqResource
{
  abstract stringParameter: aws_ssm.IStringParameter;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.stringParameter.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.stringParameter.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class QpqCoreParameterConstruct extends QpqCoreParameterConstructBase {
  stringParameter: aws_ssm.IStringParameter;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    setting: ParameterQPQConfigSetting,
  ): QpqResource {
    console.log('fromOtherStack', setting.key);
    class Import extends QpqCoreParameterConstructBase {
      stringParameter = aws_ssm.StringParameter.fromStringParameterName(
        scope,
        `${id}-${setting.uniqueKey}`,
        this.resourceName(setting.key),
      );
    }

    return new Import(scope, id, { qpqConfig, setting });
  }

  static getUniqueId(setting: ParameterQPQConfigSetting) {
    return setting.key;
  }

  constructor(scope: Construct, id: string, props: QpqCoreParameterConstructProps) {
    super(scope, id, props);

    this.stringParameter = new aws_ssm.StringParameter(scope, this.childId('param'), {
      parameterName: this.resourceName(props.setting.key),
      description: props.setting.key,
      stringValue: props.setting.value,

      // No additional costs ~ 4k max size
      tier: aws_ssm.ParameterTier.STANDARD,
    });
  }
}

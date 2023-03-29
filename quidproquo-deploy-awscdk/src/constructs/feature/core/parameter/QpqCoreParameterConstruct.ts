import { ParameterQPQConfigSetting, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_ssm, aws_iam } from 'aws-cdk-lib';

export interface QpqCoreParameterConstructProps extends QpqConstructBlockProps {
  parameterConfig: ParameterQPQConfigSetting;
}

export abstract class QpqCoreParameterConstructBase extends QpqConstructBlock {
  abstract stringParameter: aws_ssm.IStringParameter;

  public grantRead(grantee: aws_iam.IGrantable) {
    this.stringParameter.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): void {
    this.stringParameter.grantWrite(grantee);
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
    parameterConfig: ParameterQPQConfigSetting,
    awsAccountId: string,
  ): QpqResource {
    class Import extends QpqCoreParameterConstructBase {
      stringParameter = aws_ssm.StringParameter.fromStringParameterName(
        scope,
        `${id}-${parameterConfig.uniqueKey}`,
        this.resourceName(parameterConfig.key),
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreParameterConstructProps) {
    super(scope, id, props);

    this.stringParameter = new aws_ssm.StringParameter(this, 'param', {
      parameterName: this.resourceName(props.parameterConfig.key),
      description: props.parameterConfig.key,
      stringValue: props.parameterConfig.value,

      // No additional costs ~ 4k max size
      tier: aws_ssm.ParameterTier.STANDARD,
    });
  }
}

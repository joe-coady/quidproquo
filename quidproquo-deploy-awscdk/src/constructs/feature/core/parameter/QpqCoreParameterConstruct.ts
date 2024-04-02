import { ParameterQPQConfigSetting, QPQConfig } from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_ssm, aws_iam } from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { resolveAwsServiceAccountInfo } from 'quidproquo-config-aws';

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
    const paramName = awsNamingUtils.resolveConfigRuntimeResourceNameFromConfig(
      parameterConfig.key,
      qpqConfig,
      parameterConfig.owner,
    );

    class Import extends QpqCoreParameterConstructBase {
      stringParameter = aws_ssm.StringParameter.fromStringParameterName(
        scope,
        `${id}-${parameterConfig.uniqueKey}`,
        paramName,
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreParameterConstructProps) {
    super(scope, id, props);

    this.stringParameter = new aws_ssm.StringParameter(this, 'param', {
      parameterName: this.resourceName(props.parameterConfig.key),
      description: props.parameterConfig.key,
      stringValue: props.parameterConfig.value || 'Please set a value',

      // No additional costs ~ 4k max size
      tier: aws_ssm.ParameterTier.STANDARD,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.stringParameter, props.qpqConfig);
  }

  public static authorizeActionsForRole(
    role: aws_iam.IRole,
    parameterConfigs: ParameterQPQConfigSetting[],
    qpqConfig: QPQConfig,
  ) {
    console.log('OMG PARAMS', parameterConfigs.length);
    if (parameterConfigs.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:DescribeParameters'],
          resources: parameterConfigs.map((parameterConfig) => {
            const { awsRegion, awsAccountId } = resolveAwsServiceAccountInfo(
              qpqConfig,
              parameterConfig.owner,
            );

            const paramName = awsNamingUtils.resolveConfigRuntimeResourceNameFromConfig(
              parameterConfig.key,
              qpqConfig,
              parameterConfig.owner,
            );

            return `arn:aws:ssm:${awsRegion}:${awsAccountId}:parameter/${paramName}`;
          }),
        }),
      );
    }
  }
}

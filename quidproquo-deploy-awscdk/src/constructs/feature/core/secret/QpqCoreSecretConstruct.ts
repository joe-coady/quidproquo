import { SecretQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { resolveAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_secretsmanager, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqCoreSecretConstructProps extends QpqConstructBlockProps {
  secretConfig: SecretQPQConfigSetting;
}

export abstract class QpqCoreSecretConstructBase extends QpqConstructBlock implements QpqResource {
  abstract secret: aws_secretsmanager.ISecret;

  public grantRead(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.secret.grantRead(grantee);
  }

  public grantWrite(grantee: aws_iam.IGrantable): aws_iam.Grant {
    return this.secret.grantWrite(grantee);
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class QpqCoreSecretConstruct extends QpqCoreSecretConstructBase {
  secret: aws_secretsmanager.ISecret;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    secretConfig: SecretQPQConfigSetting,
    awsAccountId: string,
  ): QpqResource {
    class Import extends QpqCoreSecretConstructBase {
      secret = aws_secretsmanager.Secret.fromSecretNameV2(
        scope,
        `${id}-${secretConfig.uniqueKey}`,
        this.resourceNameWithModuleOveride(secretConfig.key, secretConfig.owner?.module),
      );
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreSecretConstructProps) {
    super(scope, id, props);

    this.secret = new aws_secretsmanager.Secret(this, 'secret', {
      secretName: this.resourceName(props.secretConfig.key),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: props.secretConfig.key,
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(this.secret, props.qpqConfig);
  }

  public static authorizeActionsForRole(
    role: aws_iam.IRole,
    secretConfigs: SecretQPQConfigSetting[],
    qpqConfig: QPQConfig,
  ) {
    if (secretConfigs.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: ['secretsmanager:GetSecretValue'],
          resources: secretConfigs.map((secretConfig) => {
            const { awsRegion, awsAccountId } = resolveAwsServiceAccountInfo(
              qpqConfig,
              secretConfig.owner,
            );

            const secretName = awsNamingUtils.resolveConfigRuntimeResourceNameFromConfig(
              secretConfig.key,
              qpqConfig,
              secretConfig.owner,
            );

            return `arn:aws:secretsmanager:${awsRegion}:${awsAccountId}:secret:${secretName}`;
          }),
        }),
      );
    }
  }
}

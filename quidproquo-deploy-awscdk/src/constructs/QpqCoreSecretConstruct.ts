import { SecretQPQConfigSetting, QPQConfig } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { QpqResource } from './core/QpqResource';
import { Construct } from 'constructs';
import { aws_secretsmanager, aws_iam } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreSecretConstructProps extends QpqConstructProps<SecretQPQConfigSetting> {}

export abstract class QpqCoreSecretConstructBase
  extends QpqConstruct<SecretQPQConfigSetting>
  implements QpqResource
{
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

  static getUniqueId(setting: SecretQPQConfigSetting) {
    return setting.key;
  }

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    setting: SecretQPQConfigSetting,
  ): QpqResource {
    class Import extends QpqCoreSecretConstructBase {
      secret = aws_secretsmanager.Secret.fromSecretNameV2(
        scope,
        `${id}-${setting.uniqueKey}`,
        this.resourceName(setting.key),
      );
    }

    return new Import(scope, id, { qpqConfig, setting });
  }

  constructor(scope: Construct, id: string, props: QpqCoreSecretConstructProps) {
    super(scope, id, props);

    this.secret = new aws_secretsmanager.Secret(this, this.childId('secret'), {
      secretName: this.resourceName(props.setting.key),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: props.setting.key,
    });
  }
}

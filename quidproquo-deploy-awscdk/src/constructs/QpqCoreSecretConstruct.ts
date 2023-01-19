import { SecretQPQConfigSetting } from 'quidproquo-core';
import { QpqConstruct, QpqConstructProps } from './core/QpqConstruct';
import { Construct } from 'constructs';
import { aws_secretsmanager } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface QpqCoreSecretConstructProps extends QpqConstructProps<SecretQPQConfigSetting> {}

export class QpqCoreSecretConstruct extends QpqConstruct<SecretQPQConfigSetting> {
  constructor(scope: Construct, id: string, props: QpqCoreSecretConstructProps) {
    super(scope, id, props);

    new aws_secretsmanager.Secret(this, this.childId('secret'), {
      secretName: this.resourceName(props.setting.key),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: props.setting.key,
    });
  }
}

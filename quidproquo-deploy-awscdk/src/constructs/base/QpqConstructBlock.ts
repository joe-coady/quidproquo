import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { QPQConfig } from 'quidproquo-core';
import { Construct } from 'constructs';

import { QpqResource } from './QpqResource';
import { IGrantable, IRole } from 'aws-cdk-lib/aws-iam';
import { aws_iam } from 'aws-cdk-lib';

export interface QpqConstructBlockProps {
  awsAccountId: string;
  qpqConfig: QPQConfig;
}

export class QpqConstructBlock extends Construct implements QpqResource {
  awsAccountId: string;
  qpqConfig: QPQConfig;
  serviceRole?: aws_iam.IRole;

  constructor(scope: Construct, id: string, props: QpqConstructBlockProps) {
    super(scope, id);

    this.awsAccountId = props.awsAccountId;
    this.qpqConfig = props.qpqConfig;
  }

  resourceName(name: string) {
    return awsNamingUtils.getConfigRuntimeResourceNameFromConfig(name, this.qpqConfig);
  }

  resourceNameWithModuleOveride(name: string, module?: string) {
    return awsNamingUtils.getConfigRuntimeResourceNameFromConfigWithServiceOverride(
      name,
      this.qpqConfig,
      module,
    );
  }

  qpqResourceName(name: string, resourceType: string) {
    return awsNamingUtils.getQpqRuntimeResourceNameFromConfig(name, this.qpqConfig, resourceType);
  }

  grantRead(grantee: IGrantable): void {}

  grantWrite(grantee: IGrantable): void {}

  grantAll(grantee: IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }

  getServiceRole(): aws_iam.IRole {
    if (!this.serviceRole) {
      this.serviceRole = aws_iam.Role.fromRoleName(
        this,
        'service-role',
        this.resourceName('service-role'),
        {
          mutable: true,
        },
      );
    }

    return this.serviceRole;
  }
}

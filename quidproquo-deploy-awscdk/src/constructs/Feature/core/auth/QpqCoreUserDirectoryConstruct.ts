import { QPQConfig, UserDirectoryQPQConfigSetting } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_ssm, aws_iam, aws_cognito } from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

const getUserPoolArnNameExport = (
  userDirectoryConfig: UserDirectoryQPQConfigSetting,
  qpqConfig: QPQConfig,
) =>
  awsNamingUtils.getQpqRuntimeResourceName(
    userDirectoryConfig.name,
    qpqConfig,
    'user-pool-arn-export',
  );

export interface QpqCoreUserDirectoryConstructProps extends QpqConstructBlockProps {
  userDirectoryConfig: UserDirectoryQPQConfigSetting;
}

export abstract class QpqCoreUserDirectoryConstructBase extends QpqConstructBlock {
  abstract userPool: aws_cognito.IUserPool;

  public grantRead(grantee: aws_iam.IGrantable) {
    this.userPool.grant(
      grantee,
      'cognito-idp:DescribeUserPool',
      'cognito-idp:ListUsers',
      'cognito-idp:GetUser',
      'cognito-idp:GetGroup',
      'cognito-idp:ListGroups',
    );
  }

  public grantWrite(grantee: aws_iam.IGrantable): void {
    this.userPool.grant(
      grantee,
      'cognito-idp:SignUp',
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminUpdateUserAttributes',
      'cognito-idp:AdminDeleteUser',
      'cognito-idp:AdminDeleteUserAttributes',
    );
  }

  public grantAll(grantee: aws_iam.IGrantable): void {
    this.grantRead(grantee);
    this.grantWrite(grantee);
  }
}

export class QpqCoreUserDirectoryConstruct extends QpqCoreUserDirectoryConstructBase {
  userPool: aws_cognito.IUserPool;

  static fromOtherStack(
    scope: Construct,
    id: string,
    qpqConfig: QPQConfig,
    userDirectoryConfig: UserDirectoryQPQConfigSetting,
    awsAccountId: string,
  ): QpqResource {
    const userPoolArn = qpqDeployAwsCdkUtils.importStackValue(
      getUserPoolArnNameExport(userDirectoryConfig, qpqConfig),
    );

    class Import extends QpqCoreUserDirectoryConstructBase {
      userPool = aws_cognito.UserPool.fromUserPoolArn(this, 'pool-arn', userPoolArn);
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreUserDirectoryConstructProps) {
    super(scope, id, props);

    this.userPool = new aws_cognito.UserPool(this, 'user-pool', {
      userPoolName: this.resourceName(props.userDirectoryConfig.name),
      selfSignUpEnabled: props.userDirectoryConfig.selfSignUpEnabled,
      autoVerify: {
        email: props.userDirectoryConfig.emailRequired,
        phone: props.userDirectoryConfig.phoneRequired,
      },
    });

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      getUserPoolArnNameExport(props.userDirectoryConfig, props.qpqConfig),
      this.userPool.userPoolArn,
    );

    // const userPoolClient = new aws_cognito.UserPoolClient(this, 'user-pool-client', {
    //   userPoolClientName: this.qpqResourceName(props.userDirectoryConfig.name, 'upc'),
    //   userPool: this.userPool,
    //   generateSecret: true,
    // });
  }
}

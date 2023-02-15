import { QPQConfig, UserDirectoryQPQConfigSetting } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_iam, aws_cognito } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

export interface QpqCoreUserDirectoryConstructProps extends QpqConstructBlockProps {
  userDirectoryConfig: UserDirectoryQPQConfigSetting;
}

export abstract class QpqCoreUserDirectoryConstructBase extends QpqConstructBlock {
  abstract userPool: aws_cognito.IUserPool;

  public grantRead(grantee: aws_iam.IGrantable) {
    this.userPool.grant(
      grantee,

      'cognito-idp:ListUsers',
      'cognito-idp:GetUser',

      'cognito-idp:ListGroups',
      'cognito-idp:GetGroup',

      'cognito-idp:ListUserPools',

      'cognito-idp:DescribeUserPool',
      'cognito-idp:DescribeUserPoolClient',
    );
  }

  public grantWrite(grantee: aws_iam.IGrantable): void {
    this.userPool.grant(
      grantee,
      'cognito-idp:SignUp',
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminInitiateAuth',
      'cognito-idp:AdminRespondToAuthChallenge',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminDeleteUser',
      'cognito-idp:AdminUpdateUserAttributes',
      'cognito-idp:AdminDeleteUserAttributes',
      'cognito-idp:AdminSetUserPassword',
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
    const userPoolId = qpqDeployAwsCdkUtils.importStackValue(
      awsNamingUtils.getCFExportNameUserPoolId(userDirectoryConfig.name, qpqConfig),
    );

    class Import extends QpqCoreUserDirectoryConstructBase {
      userPool = aws_cognito.UserPool.fromUserPoolId(this, 'pool-id', userPoolId);
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreUserDirectoryConstructProps) {
    super(scope, id, props);

    this.userPool = new aws_cognito.UserPool(this, 'user-pool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      userPoolName: this.resourceName(props.userDirectoryConfig.name),
      selfSignUpEnabled: props.userDirectoryConfig.selfSignUpEnabled,
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: props.userDirectoryConfig.phoneRequired,
          mutable: true,
        },
      },
      autoVerify: {
        email: true,
        phone: props.userDirectoryConfig.phoneRequired,
      },
    });

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameUserPoolId(props.userDirectoryConfig.name, props.qpqConfig),
      this.userPool.userPoolId,
    );

    const userPoolClient = new aws_cognito.UserPoolClient(this, 'user-pool-client', {
      userPoolClientName: this.qpqResourceName(props.userDirectoryConfig.name, 'upc'),
      userPool: this.userPool,
      generateSecret: true,
      authFlows: {
        adminUserPassword: true,
      },
    });

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameUserPoolClientId(
        props.userDirectoryConfig.name,
        props.qpqConfig,
      ),
      userPoolClient.userPoolClientId,
    );
  }
}

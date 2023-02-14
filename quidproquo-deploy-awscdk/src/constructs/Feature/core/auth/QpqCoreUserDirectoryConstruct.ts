import {
  ParameterQPQConfigSetting,
  QPQConfig,
  UserDirectoryQPQConfigSetting,
} from 'quidproquo-core';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_ssm, aws_iam, aws_cognito } from 'aws-cdk-lib';

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

  // static fromOtherStack(
  //   scope: Construct,
  //   id: string,
  //   qpqConfig: QPQConfig,
  //   parameterConfig: ParameterQPQConfigSetting,
  //   awsAccountId: string,
  // ): QpqResource {
  //   class Import extends QpqCoreUserDirectoryConstructBase {
  //     stringParameter = aws_cognito.UserPool.from(
  //       scope,
  //       `${id}-${parameterConfig.uniqueKey}`,
  //       this.resourceName(parameterConfig.key),
  //     );
  //   }

  //   return new Import(scope, id, { qpqConfig, awsAccountId });
  // }

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

    // const userPoolClient = new aws_cognito.UserPoolClient(this, 'user-pool-client', {
    //   userPoolClientName: this.qpqResourceName(props.userDirectoryConfig.name, 'upc'),
    //   userPool: this.userPool,
    //   generateSecret: true,
    // });
  }
}

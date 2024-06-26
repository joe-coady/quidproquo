import { QPQConfig, UserDirectoryQPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_iam, aws_cognito, aws_lambda } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Function } from '../../../basic/Function';
import { resolveAwsServiceAccountInfo } from 'quidproquo-config-aws';

export interface QpqCoreUserDirectoryConstructProps extends QpqConstructBlockProps {
  userDirectoryConfig: UserDirectoryQPQConfigSetting;
}

export abstract class QpqCoreUserDirectoryConstructBase extends QpqConstructBlock {
  abstract userPool: aws_cognito.IUserPool;

  public grantRead(grantee: aws_iam.IGrantable): void {
    this.userPool.grant(
      grantee,

      'cognito-idp:ListUsers',
      'cognito-idp:GetUser',
      'cognito-idp:AdminGetUser',

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

  static fromOtherStack(scope: Construct, id: string, qpqConfig: QPQConfig, awsAccountId: string, userDirectoryName: string): QpqResource {
    const userPoolId = qpqDeployAwsCdkUtils.importStackValue(awsNamingUtils.getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig));

    class Import extends QpqCoreUserDirectoryConstructBase {
      userPool = aws_cognito.UserPool.fromUserPoolId(this, 'pool-id', userPoolId);
    }

    return new Import(scope, id, { qpqConfig, awsAccountId });
  }

  constructor(scope: Construct, id: string, props: QpqCoreUserDirectoryConstructProps) {
    super(scope, id, props);

    const userPool = new aws_cognito.UserPool(this, 'user-pool', {
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
      // signInAliases: {
      //   username: true,
      //   email: true,
      // },
    });

    qpqDeployAwsCdkUtils.applyEnvironmentTags(userPool, props.qpqConfig);

    this.userPool = userPool;

    if (
      props.userDirectoryConfig.emailTemplates.resetPassword ||
      props.userDirectoryConfig.emailTemplates.resetPasswordAdmin ||
      props.userDirectoryConfig.emailTemplates.verifyEmail
    ) {
      const customMessageTrigger = new Function(this, 'csm-msg-trigger-func', {
        buildPath: qpqCoreUtils.getUserDirectoryEntryFullPath(props.qpqConfig, props.userDirectoryConfig),
        functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cm-trig'),
        functionType: 'lambdaCognitoTriggerEvent_CustomMessage',
        executorName: 'executeLambdaCognitoCustomMessageTriggerEvent',

        qpqConfig: props.qpqConfig,

        environment: {
          userDirectoryName: props.userDirectoryConfig.name,
        },

        awsAccountId: props.awsAccountId,

        role: this.getServiceRole(),
      });

      userPool.addTrigger(aws_cognito.UserPoolOperation.CUSTOM_MESSAGE, customMessageTrigger.lambdaFunction);
    }

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameUserPoolIdFromConfig(props.userDirectoryConfig.name, props.qpqConfig),
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
      awsNamingUtils.getCFExportNameUserPoolClientIdFromConfig(props.userDirectoryConfig.name, props.qpqConfig),
      userPoolClient.userPoolClientId,
    );
  }

  public static authorizeActionsForRole(
    role: aws_iam.IRole,
    userDirectoryConfigs: UserDirectoryQPQConfigSetting[],
    userDirectoryConstructs: QpqCoreUserDirectoryConstruct[],
    qpqConfig: QPQConfig,
  ) {
    if (userDirectoryConstructs.length > 0) {
      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.ALLOW,
          actions: [
            'cognito-idp:SignUp',
            'cognito-idp:AdminCreateUser',
            'cognito-idp:AdminInitiateAuth',
            'cognito-idp:AdminRespondToAuthChallenge',
            'cognito-idp:AdminAddUserToGroup',
            'cognito-idp:AdminDeleteUser',
            'cognito-idp:AdminUpdateUserAttributes',
            'cognito-idp:AdminDeleteUserAttributes',
            'cognito-idp:AdminSetUserPassword',

            'cognito-idp:ListUsers',
            'cognito-idp:GetUser',
            'cognito-idp:AdminGetUser',
            'cognito-idp:ListGroups',
            'cognito-idp:GetGroup',
            'cognito-idp:ListUserPools',
            'cognito-idp:DescribeUserPool',
            'cognito-idp:DescribeUserPoolClient',
          ],
          resources: userDirectoryConfigs.map((userDirectoryConfig, index) => {
            const { awsRegion, awsAccountId } = resolveAwsServiceAccountInfo(qpqConfig, userDirectoryConfig.owner);

            const userpoolId = userDirectoryConstructs[index].userPool.userPoolId;

            return `arn:aws:cognito-idp:${awsRegion}:${awsAccountId}:userpool/${userpoolId}`;
          }),
        }),
      );
    }
  }
}

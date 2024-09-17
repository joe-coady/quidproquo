import { AuthDirectoryFederatedProviderType, QPQConfig, UserDirectoryQPQConfigSetting, qpqCoreUtils } from 'quidproquo-core';
import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';

import { Construct } from 'constructs';
import { aws_iam, aws_cognito, aws_lambda, aws_route53, aws_route53_targets } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

import * as qpqDeployAwsCdkUtils from '../../../../utils';

import { Function } from '../../../basic/Function';
import { resolveAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { DnsValidatedCertificate } from '../../../basic/DnsValidatedCertificate';

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

    const userPoolName = this.resourceName(props.userDirectoryConfig.name);

    const userPool = new aws_cognito.UserPool(this, 'user-pool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      userPoolName: userPoolName,
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
        functionType: 'customMessageTriggerEvent_customMessage',
        executorName: 'customMessageTriggerEvent_customMessage',

        qpqConfig: props.qpqConfig,

        environment: {
          userDirectoryName: props.userDirectoryConfig.name,
        },

        awsAccountId: props.awsAccountId,

        role: this.getServiceRole(),
      });

      userPool.addTrigger(aws_cognito.UserPoolOperation.CUSTOM_MESSAGE, customMessageTrigger.lambdaFunction);
    }

    if (props.userDirectoryConfig.customAuthRuntime) {
      const defAuthChallengeTrigger = new Function(this, 'def-auth-challenge', {
        buildPath: qpqCoreUtils.getUserDirectoryEntryFullPath(props.qpqConfig, props.userDirectoryConfig),
        functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-define'),
        functionType: 'customMessageTriggerEvent_defineAuthChallenge',
        executorName: 'customMessageTriggerEvent_defineAuthChallenge',

        qpqConfig: props.qpqConfig,

        environment: {
          userDirectoryName: props.userDirectoryConfig.name,
        },

        awsAccountId: props.awsAccountId,

        role: this.getServiceRole(),
      });

      userPool.addTrigger(aws_cognito.UserPoolOperation.DEFINE_AUTH_CHALLENGE, defAuthChallengeTrigger.lambdaFunction);

      if (props.userDirectoryConfig.customAuthRuntime.createAuthChallenge) {
        const createAuthChallengeTrigger = new Function(this, 'create-auth-challenge', {
          buildPath: qpqCoreUtils.getUserDirectoryEntryFullPath(props.qpqConfig, props.userDirectoryConfig),
          functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-create'),
          functionType: 'customMessageTriggerEvent_createAuthChallenge',
          executorName: 'customMessageTriggerEvent_createAuthChallenge',

          qpqConfig: props.qpqConfig,

          environment: {
            userDirectoryName: props.userDirectoryConfig.name,
          },

          awsAccountId: props.awsAccountId,

          role: this.getServiceRole(),
        });
        userPool.addTrigger(aws_cognito.UserPoolOperation.CREATE_AUTH_CHALLENGE, createAuthChallengeTrigger.lambdaFunction);
      }

      if (props.userDirectoryConfig.customAuthRuntime.verifyAuthChallenge) {
        const verifyAuthChallengeTrigger = new Function(this, 'verify-auth-challenge', {
          buildPath: qpqCoreUtils.getUserDirectoryEntryFullPath(props.qpqConfig, props.userDirectoryConfig),
          functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-verify'),
          functionType: 'customMessageTriggerEvent_verifyAuthChallenge',
          executorName: 'customMessageTriggerEvent_verifyAuthChallenge',

          qpqConfig: props.qpqConfig,

          environment: {
            userDirectoryName: props.userDirectoryConfig.name,
          },

          awsAccountId: props.awsAccountId,

          role: this.getServiceRole(),
        });
        userPool.addTrigger(aws_cognito.UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE, verifyAuthChallengeTrigger.lambdaFunction);
      }
    }

    qpqDeployAwsCdkUtils.exportStackValue(
      this,
      awsNamingUtils.getCFExportNameUserPoolIdFromConfig(props.userDirectoryConfig.name, props.qpqConfig),
      this.userPool.userPoolId,
    );

    const federatedProviders = props.userDirectoryConfig.oAuth?.federatedProviders || [];
    federatedProviders.forEach((fp) => {
      if (fp.type === AuthDirectoryFederatedProviderType.Facebook) {
        new aws_cognito.UserPoolIdentityProviderFacebook(this, fp.clientId, {
          userPool: this.userPool,
          clientId: fp.clientId,
          clientSecret: fp.clientSecret,

          scopes: ['public_profile', 'email'],
          attributeMapping: {
            email: aws_cognito.ProviderAttribute.FACEBOOK_EMAIL,
            givenName: aws_cognito.ProviderAttribute.FACEBOOK_FIRST_NAME,
            familyName: aws_cognito.ProviderAttribute.FACEBOOK_LAST_NAME,
            middleName: aws_cognito.ProviderAttribute.FACEBOOK_MIDDLE_NAME,
            birthdate: aws_cognito.ProviderAttribute.FACEBOOK_BIRTHDAY,
            profilePicture: aws_cognito.ProviderAttribute.other('picture'),
          },
        });
      } else if (fp.type === AuthDirectoryFederatedProviderType.Google) {
        new aws_cognito.UserPoolIdentityProviderGoogle(this, fp.clientId, {
          userPool: this.userPool,
          clientId: fp.clientId,
          clientSecret: fp.clientSecret,
          scopes: ['profile', 'email'],
          attributeMapping: {
            email: aws_cognito.ProviderAttribute.GOOGLE_EMAIL,
            givenName: aws_cognito.ProviderAttribute.GOOGLE_NAME,
            familyName: aws_cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
            birthdate: aws_cognito.ProviderAttribute.GOOGLE_BIRTHDAYS,
            profilePicture: aws_cognito.ProviderAttribute.GOOGLE_PICTURE,
          },
        });
      }
    });

    if (props.userDirectoryConfig.dnsRecord) {
      const dnsRecord = new DnsValidatedCertificate(this, 'validcert', {
        domain: {
          onRootDomain: true,
          subDomainNames: [props.userDirectoryConfig.dnsRecord.subdomain],
          rootDomain: props.userDirectoryConfig.dnsRecord.rootDomain,
        },

        awsAccountId: props.awsAccountId,
        qpqConfig: props.qpqConfig,
      });

      const userPoolDomain = new aws_cognito.UserPoolDomain(this, 'user-pool-domain', {
        userPool: this.userPool,

        // Full custom domain
        customDomain: {
          certificate: dnsRecord.certificate,
          domainName: dnsRecord.domainNames[0],
        },
      });

      new aws_route53.ARecord(this, 'CognitoDomainAliasRecord', {
        zone: dnsRecord.hostedZone,
        recordName: dnsRecord.domainNames[0],
        target: aws_route53.RecordTarget.fromAlias(new aws_route53_targets.UserPoolDomainTarget(userPoolDomain)),
      });
    }

    const userPoolClient = new aws_cognito.UserPoolClient(this, 'user-pool-client', {
      userPoolClientName: this.qpqResourceName(props.userDirectoryConfig.name, 'upc'),
      userPool: this.userPool,
      generateSecret: true,
      authFlows: {
        adminUserPassword: true,
        custom: !!props.userDirectoryConfig.customAuthRuntime,
      },
      supportedIdentityProviders: federatedProviders.map((fp) =>
        fp.type === AuthDirectoryFederatedProviderType.Facebook
          ? aws_cognito.UserPoolClientIdentityProvider.FACEBOOK
          : aws_cognito.UserPoolClientIdentityProvider.GOOGLE,
      ),
      oAuth: {
        callbackUrls: props.userDirectoryConfig.oAuth?.callbacks?.map((cb) => qpqCoreUtils.getFullUrlFromConfigUrl(cb, props.qpqConfig)),
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

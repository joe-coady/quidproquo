import { awsNamingUtils } from 'quidproquo-actionprocessor-awslambda';
import { resolveAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { AuthDirectoryFederatedProviderType, QPQConfig, qpqCoreUtils, UserDirectoryQPQConfigSetting } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_cognito, aws_iam, aws_lambda, aws_route53, aws_route53_targets } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as qpqDeployAwsCdkUtils from '../../../../utils';
import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';
import { QpqResource } from '../../../base/QpqResource';
import { lookupDomainCertificate } from '../../../basic/DomainCertificateLookup';
import { Function } from '../../../basic/Function';

export interface QpqInfCoreUserDirectoryConstructProps extends QpqConstructBlockProps {
  userDirectoryConfig: UserDirectoryQPQConfigSetting;
}

export class QpqInfCoreUserDirectoryConstruct extends QpqConstructBlock {
  public userPool: aws_cognito.IUserPool;

  static fromOtherStack(scope: Construct, id: string, qpqConfig: QPQConfig, userDirectoryName: string): QpqInfCoreUserDirectoryConstruct {
    const userPoolId = qpqDeployAwsCdkUtils.importStackValue(awsNamingUtils.getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig));

    class Import extends QpqConstructBlock {
      userPool = aws_cognito.UserPool.fromUserPoolId(this, 'pool-id', userPoolId);
    }

    return new Import(scope, id, { qpqConfig });
  }

  constructor(scope: Construct, id: string, props: QpqInfCoreUserDirectoryConstructProps) {
    super(scope, id, props);

    const userPoolName = this.resourceName(props.userDirectoryConfig.name);

    const userPool = new aws_cognito.UserPool(this, 'user-pool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      userPoolName: userPoolName,
      selfSignUpEnabled: props.userDirectoryConfig.selfSignUpEnabled,
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
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
        functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cm-trig'),
        functionType: 'customMessageTriggerEvent_customMessage',
        executorName: 'customMessageTriggerEvent_customMessage',

        qpqConfig: props.qpqConfig,

        environment: {
          userDirectoryName: props.userDirectoryConfig.name,
        },

        role: this.getServiceRole(),
      });

      userPool.addTrigger(aws_cognito.UserPoolOperation.CUSTOM_MESSAGE, customMessageTrigger.lambdaFunction);
    }

    if (props.userDirectoryConfig.customAuthRuntime) {
      const defAuthChallengeTrigger = new Function(this, 'def-auth-challenge', {
        functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-define'),
        functionType: 'customMessageTriggerEvent_defineAuthChallenge',
        executorName: 'customMessageTriggerEvent_defineAuthChallenge',

        qpqConfig: props.qpqConfig,

        environment: {
          userDirectoryName: props.userDirectoryConfig.name,
        },

        role: this.getServiceRole(),
      });

      userPool.addTrigger(aws_cognito.UserPoolOperation.DEFINE_AUTH_CHALLENGE, defAuthChallengeTrigger.lambdaFunction);

      if (props.userDirectoryConfig.customAuthRuntime.createAuthChallenge) {
        const createAuthChallengeTrigger = new Function(this, 'create-auth-challenge', {
          functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-create'),
          functionType: 'customMessageTriggerEvent_createAuthChallenge',
          executorName: 'customMessageTriggerEvent_createAuthChallenge',

          qpqConfig: props.qpqConfig,

          environment: {
            userDirectoryName: props.userDirectoryConfig.name,
          },

          role: this.getServiceRole(),
        });
        userPool.addTrigger(aws_cognito.UserPoolOperation.CREATE_AUTH_CHALLENGE, createAuthChallengeTrigger.lambdaFunction);
      }

      if (props.userDirectoryConfig.customAuthRuntime.verifyAuthChallenge) {
        const verifyAuthChallengeTrigger = new Function(this, 'verify-auth-challenge', {
          functionName: this.qpqResourceName(`${props.userDirectoryConfig.name}`, 'cac-verify'),
          functionType: 'customMessageTriggerEvent_verifyAuthChallenge',
          executorName: 'customMessageTriggerEvent_verifyAuthChallenge',

          qpqConfig: props.qpqConfig,

          environment: {
            userDirectoryName: props.userDirectoryConfig.name,
          },

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
      // Cognito custom domains use CloudFront under the hood, so the cert must be in us-east-1.
      const apexDomain = qpqWebServerUtils.resolveApexDomainNameFromDomainConfig(
        props.qpqConfig,
        props.userDirectoryConfig.dnsRecord.rootDomain,
        true,
      );

      const hostedZone = aws_route53.HostedZone.fromLookup(this, 'apex-zone', {
        domainName: apexDomain,
      });

      const fullDomain = `${props.userDirectoryConfig.dnsRecord.subdomain}.${apexDomain}`;
      const certificate = lookupDomainCertificate(this, 'us-east-1', props.userDirectoryConfig.name);

      const userPoolDomain = new aws_cognito.UserPoolDomain(this, 'user-pool-domain', {
        userPool: this.userPool,

        // Full custom domain
        customDomain: {
          certificate,
          domainName: fullDomain,
        },
      });

      new aws_route53.ARecord(this, 'CognitoDomainAliasRecord', {
        zone: hostedZone,
        recordName: fullDomain,
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

  // Grants admin Cognito actions for pools this service owns. Services that
  // only reference a foreign user directory get no Cognito IAM from here —
  // token validation runs against the pool's public JWKs over HTTPS and needs
  // no IAM. Call sites must pass only owned directories (see
  // `qpqCoreUtils.getOwnedUserDirectories`).
  public static authorizeAdminActionsForRole(
    role: aws_iam.IRole,
    userDirectoryConfigs: UserDirectoryQPQConfigSetting[],
    userDirectoryConstructs: QpqInfCoreUserDirectoryConstruct[],
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

import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { QPQConfig } from 'quidproquo-core';
import { EmailSenderQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { aws_iam, aws_route53, aws_ses } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../../base/QpqConstructBlock';

export interface QpqWebserverEmailSenderConstructProps extends QpqConstructBlockProps {
  emailSenderConfig: EmailSenderQPQWebServerConfigSetting;
}

export class QpqWebserverEmailSenderConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqWebserverEmailSenderConstructProps) {
    super(scope, id, props);

    // The identity is the env-resolved root domain (e.g. development.example.com), the same
    // zone SubdomainName resolves against, so DKIM records land in the qpq-managed zone.
    const identityDomain = qpqWebServerUtils.resolveDomainRoot(props.emailSenderConfig.rootDomain, props.qpqConfig);

    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: identityDomain,
    });

    // qpq zones are always public (they serve public DNS); fromLookup just types
    // them as the broader IHostedZone
    new aws_ses.EmailIdentity(this, 'identity', {
      identity: aws_ses.Identity.publicHostedZone(hostedZone as aws_route53.IPublicHostedZone),
    });
  }

  // Scope email sending to this service's own verified identity domains (exact ARNs, per the
  // shared-account rule). SendRawEmail is needed for the attachment (raw MIME) path.
  // While the SES account is in sandbox, SES also authorizes against the recipient's identity,
  // so any defineEmailSenderAllowList addresses for the domain are granted too.
  // No-op when the service declares no email senders.
  public static authorizeSendEmailForRole(
    role: aws_iam.IRole,
    emailSenderConfigs: EmailSenderQPQWebServerConfigSetting[],
    qpqConfig: QPQConfig,
  ): void {
    if (emailSenderConfigs.length > 0) {
      const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
      const accountId = qpqConfigAwsUtils.getApplicationModuleDeployAccountId(qpqConfig);

      const identityArn = (identity: string): string => `arn:aws:ses:${region}:${accountId}:identity/${identity}`;

      const resources = emailSenderConfigs.flatMap((setting) => [
        identityArn(qpqWebServerUtils.resolveDomainRoot(setting.rootDomain, qpqConfig)),
        ...qpqConfigAwsUtils.getEmailSenderAllowedAddresses(qpqConfig, setting.rootDomain).map(identityArn),
      ]);

      role.addToPrincipalPolicy(
        new aws_iam.PolicyStatement({
          sid: 'SESSendEmail',
          effect: aws_iam.Effect.ALLOW,
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: [...new Set(resources)],
        }),
      );
    }
  }
}

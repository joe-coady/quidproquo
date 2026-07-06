import { AccountSecurityServicesQPQConfigSetting } from 'quidproquo-config-aws';

import { aws_guardduty, aws_securityhub } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { QpqConstructBlock, QpqConstructBlockProps } from '../../base/QpqConstructBlock';

export interface QpqAccountSecurityServicesConstructProps extends QpqConstructBlockProps {
  securityServicesConfig: AccountSecurityServicesQPQConfigSetting;
}

// GuardDuty detectors and Security Hub hubs are one-per-account+region, which is exactly
// why they live in the account stack rather than any app's bootstrap - an app teardown
// must not take the account's threat detection with it.
export class QpqAccountSecurityServicesConstruct extends QpqConstructBlock {
  constructor(scope: Construct, id: string, props: QpqAccountSecurityServicesConstructProps) {
    super(scope, id, props);

    if (props.securityServicesConfig.enableGuardDuty) {
      new aws_guardduty.CfnDetector(this, 'guardduty-detector', {
        enable: true,
      });
    }

    if (props.securityServicesConfig.enableSecurityHub) {
      // Security Hub's compliance standards require AWS Config recording, which bills per
      // configuration item recorded - enabling this is a deliberate cost decision
      new aws_securityhub.CfnHub(this, 'security-hub');
    }
  }
}
